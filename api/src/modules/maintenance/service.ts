import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { emitRealtime } from "../../realtime/socket.js";
import { AppError, notFound } from "../../utils/http.js";
import { serialize } from "../../utils/serialize.js";

const pageSize = 25;

export async function list(query: Record<string, unknown>) {
  const page = Number(query.page ?? 1);
  const where: Prisma.MaintenanceLogWhereInput = {
    ...(query.vehicleId ? { vehicleId: String(query.vehicleId) } : {}),
    ...(query.status ? { status: String(query.status) } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.maintenanceLog.findMany({ where, include: { vehicle: true }, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.maintenanceLog.count({ where }),
  ]);
  return { items: serialize(items), total, page, pageSize };
}

export async function create(data: { vehicleId: string; serviceType: string; description?: string; cost: number; startDate?: Date }, userId: string) {
  const record = await prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) throw notFound("Vehicle not found");
    if (vehicle.status === "Retired") throw new AppError(409, "Cannot service a retired vehicle", "INVALID_STATUS");
    if (vehicle.status === "On Trip") throw new AppError(409, "Vehicle is On Trip. Complete the trip first.", "INVALID_STATUS");
    const active = await tx.maintenanceLog.findFirst({ where: { vehicleId: data.vehicleId, status: "Active" } });
    if (active) throw new AppError(409, "An active maintenance record already exists for this vehicle", "ACTIVE_MAINTENANCE_EXISTS");

    const created = await tx.maintenanceLog.create({
      data: {
        vehicleId: data.vehicleId,
        serviceType: data.serviceType,
        description: data.description ?? "",
        cost: data.cost,
        startDate: data.startDate ?? new Date(),
        status: "Active",
        createdById: userId,
      },
      include: { vehicle: true },
    });
    await tx.vehicle.update({ where: { id: data.vehicleId }, data: { status: "In Shop" } });
    return created;
  });
  emitRealtime("maintenance:updated", { id: record.id });
  emitRealtime("vehicles:updated", { id: data.vehicleId });
  emitRealtime("dashboard:updated");
  emitRealtime("analytics:updated");
  return serialize(record);
}

export async function update(id: string, data: Prisma.MaintenanceLogUpdateInput) {
  const record = await prisma.maintenanceLog.update({ where: { id }, data, include: { vehicle: true } });
  emitRealtime("maintenance:updated", { id });
  emitRealtime("analytics:updated");
  return serialize(record);
}

export async function close(id: string) {
  const record = await prisma.$transaction(async (tx) => {
    const existing = await tx.maintenanceLog.findUnique({ where: { id }, include: { vehicle: true } });
    if (!existing) throw notFound("Maintenance record not found");
    if (existing.status === "Completed") return existing;
    const closed = await tx.maintenanceLog.update({
      where: { id },
      data: { status: "Completed", endDate: new Date() },
      include: { vehicle: true },
    });
    if (existing.vehicle.status !== "Retired") {
      await tx.vehicle.update({ where: { id: existing.vehicleId }, data: { status: "Available" } });
    }
    return closed;
  });
  emitRealtime("maintenance:updated", { id });
  emitRealtime("vehicles:updated", { id: record.vehicleId });
  emitRealtime("dashboard:updated");
  return serialize(record);
}
