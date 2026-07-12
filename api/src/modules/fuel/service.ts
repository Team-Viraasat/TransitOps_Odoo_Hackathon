import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { emitRealtime } from "../../realtime/socket.js";
import { notFound } from "../../utils/http.js";
import { serialize } from "../../utils/serialize.js";

export async function list(query: Record<string, unknown>) {
  const where: Prisma.FuelLogWhereInput = {
    ...(query.vehicleId ? { vehicleId: String(query.vehicleId) } : {}),
    ...(query.dateFrom || query.dateTo
      ? {
          logDate: {
            ...(query.dateFrom ? { gte: query.dateFrom as Date } : {}),
            ...(query.dateTo ? { lte: query.dateTo as Date } : {}),
          },
        }
      : {}),
  };
  return { items: serialize(await prisma.fuelLog.findMany({ where, include: { vehicle: true, trip: true }, orderBy: { logDate: "desc" } })) };
}

export async function create(data: Prisma.FuelLogUncheckedCreateInput, userId: string) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: String(data.vehicleId) } });
  if (!vehicle) throw notFound("Vehicle not found");
  if (data.tripId) {
    const trip = await prisma.trip.findUnique({ where: { id: String(data.tripId) } });
    if (!trip) throw notFound("Trip not found");
  }
  const record = await prisma.fuelLog.create({ data: { ...data, createdById: userId } });
  emitRealtime("fuel:updated", { id: record.id });
  emitRealtime("analytics:updated");
  return serialize(record);
}
