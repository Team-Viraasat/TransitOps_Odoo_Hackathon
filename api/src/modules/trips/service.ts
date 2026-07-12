import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { emitRealtime } from "../../realtime/socket.js";
import { AppError, notFound } from "../../utils/http.js";
import { serialize } from "../../utils/serialize.js";

const pageSize = 25;

const todayStart = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

async function nextTripCode(tx: Prisma.TransactionClient) {
  const count = await tx.trip.count();
  return `TRP-${1001 + count}`;
}

export async function list(query: Record<string, unknown>) {
  const page = Number(query.page ?? 1);
  const where: Prisma.TripWhereInput = {
    ...(query.status ? { status: String(query.status) } : {}),
    ...(query.vehicleId ? { vehicleId: String(query.vehicleId) } : {}),
    ...(query.driverId ? { driverId: String(query.driverId) } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.trip.findMany({ where, include: { vehicle: true, driver: true }, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.trip.count({ where }),
  ]);
  return { items: serialize(items), total, page, pageSize };
}

export async function get(id: string) {
  const trip = await prisma.trip.findUnique({ where: { id }, include: { vehicle: true, driver: true, fuelLogs: true, expenses: true } });
  if (!trip) throw notFound("Trip not found");
  return serialize(trip);
}

export async function create(data: Prisma.TripUncheckedCreateInput, userId: string) {
  const trip = await prisma.$transaction(async (tx) =>
    tx.trip.create({
      data: {
        ...data,
        tripCode: await nextTripCode(tx),
        status: "Draft",
        createdById: userId,
      },
    }),
  );
  emitRealtime("trips:updated", { id: trip.id });
  return serialize(trip);
}

export async function dispatch(id: string) {
  const trip = await prisma.$transaction(async (tx) => {
    const existing = await tx.trip.findUnique({ where: { id }, include: { vehicle: true, driver: true } });
    if (!existing) throw notFound("Trip not found");
    if (existing.status !== "Draft") throw new AppError(409, "Only Draft trips can be dispatched", "INVALID_STATUS");
    if (!existing.vehicle || !existing.driver) throw new AppError(400, "Assign an available vehicle and driver first", "ASSIGNMENT_REQUIRED");
    if (existing.vehicle.status !== "Available") throw new AppError(409, `Vehicle is ${existing.vehicle.status}`, "VEHICLE_UNAVAILABLE");
    if (existing.driver.status !== "Available") throw new AppError(409, `Driver is ${existing.driver.status}`, "DRIVER_UNAVAILABLE");
    if (existing.driver.licenseExpiryDate < todayStart()) throw new AppError(409, "Driver license is expired", "DRIVER_LICENSE_EXPIRED");
    if (Number(existing.cargoWeightKg) > Number(existing.vehicle.maxLoadKg)) {
      throw new AppError(409, "Cargo weight exceeds vehicle capacity", "CAPACITY_EXCEEDED");
    }

    await tx.vehicle.update({ where: { id: existing.vehicle.id }, data: { status: "On Trip" } });
    await tx.driver.update({ where: { id: existing.driver.id }, data: { status: "On Trip" } });
    return tx.trip.update({
      where: { id },
      data: {
        status: "Dispatched",
        startOdometerKm: existing.vehicle.odometerKm,
        dispatchedAt: new Date(),
      },
      include: { vehicle: true, driver: true },
    });
  });
  emitRealtime("trips:updated", { id });
  emitRealtime("vehicles:updated");
  emitRealtime("drivers:updated");
  emitRealtime("dashboard:updated");
  return serialize(trip);
}

export async function complete(id: string, data: { finalOdometerKm: number; actualDistanceKm: number; fuelConsumedLiters: number; revenue: number }, userId: string) {
  const trip = await prisma.$transaction(async (tx) => {
    const existing = await tx.trip.findUnique({ where: { id } });
    if (!existing) throw notFound("Trip not found");
    if (existing.status !== "Dispatched") throw new AppError(409, "Only Dispatched trips can be completed", "INVALID_STATUS");
    if (existing.startOdometerKm !== null && data.finalOdometerKm < existing.startOdometerKm) {
      throw new AppError(400, "Final odometer cannot be lower than start odometer", "INVALID_ODOMETER");
    }

    if (existing.vehicleId) {
      await tx.vehicle.update({ where: { id: existing.vehicleId }, data: { status: "Available", odometerKm: data.finalOdometerKm } });
    }
    if (existing.driverId) await tx.driver.update({ where: { id: existing.driverId }, data: { status: "Available" } });
    if (existing.vehicleId && data.fuelConsumedLiters > 0) {
      await tx.fuelLog.create({
        data: {
          vehicleId: existing.vehicleId,
          tripId: existing.id,
          liters: data.fuelConsumedLiters,
          cost: Math.round(data.fuelConsumedLiters * 95),
          logDate: new Date(),
          odometerKm: data.finalOdometerKm,
          createdById: userId,
        },
      });
    }
    return tx.trip.update({
      where: { id },
      data: {
        status: "Completed",
        finalOdometerKm: data.finalOdometerKm,
        actualDistanceKm: data.actualDistanceKm,
        fuelConsumedLiters: data.fuelConsumedLiters,
        revenue: data.revenue,
        completedAt: new Date(),
      },
      include: { vehicle: true, driver: true },
    });
  });
  emitRealtime("trips:updated", { id });
  emitRealtime("vehicles:updated");
  emitRealtime("drivers:updated");
  emitRealtime("fuel:updated");
  emitRealtime("dashboard:updated");
  emitRealtime("analytics:updated");
  return serialize(trip);
}

export async function cancel(id: string, reason: string) {
  const trip = await prisma.$transaction(async (tx) => {
    const existing = await tx.trip.findUnique({ where: { id } });
    if (!existing) throw notFound("Trip not found");
    if (!["Draft", "Dispatched"].includes(existing.status)) {
      throw new AppError(409, "Only Draft or Dispatched trips can be cancelled", "INVALID_STATUS");
    }
    if (existing.status === "Dispatched") {
      if (existing.vehicleId) await tx.vehicle.update({ where: { id: existing.vehicleId }, data: { status: "Available" } });
      if (existing.driverId) await tx.driver.update({ where: { id: existing.driverId }, data: { status: "Available" } });
    }
    return tx.trip.update({
      where: { id },
      data: { status: "Cancelled", cancelReason: reason, cancelledAt: new Date() },
      include: { vehicle: true, driver: true },
    });
  });
  emitRealtime("trips:updated", { id });
  emitRealtime("vehicles:updated");
  emitRealtime("drivers:updated");
  emitRealtime("dashboard:updated");
  return serialize(trip);
}
