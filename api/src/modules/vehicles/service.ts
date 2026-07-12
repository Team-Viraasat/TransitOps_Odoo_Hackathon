import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { emitRealtime } from "../../realtime/socket.js";
import { AppError, notFound } from "../../utils/http.js";
import { serialize } from "../../utils/serialize.js";

const pageSize = 25;

export async function list(query: Record<string, unknown>) {
  const page = Number(query.page ?? 1);
  const where: Prisma.VehicleWhereInput = {
    ...(query.type ? { type: String(query.type) } : {}),
    ...(query.status ? { status: String(query.status) } : {}),
    ...(query.region ? { region: { contains: String(query.region), mode: "insensitive" } } : {}),
    ...(query.search
      ? {
          OR: [
            { registrationNumber: { contains: String(query.search), mode: "insensitive" } },
            { nameModel: { contains: String(query.search), mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.vehicle.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.vehicle.count({ where }),
  ]);
  return { items: serialize(items), total, page, pageSize };
}

export async function availableForDispatch() {
  const vehicles = await prisma.vehicle.findMany({ where: { status: "Available" }, orderBy: { registrationNumber: "asc" } });
  return serialize(vehicles);
}

export async function get(id: string) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw notFound("Vehicle not found");
  return serialize(vehicle);
}

export async function create(data: Prisma.VehicleCreateInput) {
  const vehicle = await prisma.vehicle.create({ data: { ...data, status: "Available" } });
  emitRealtime("vehicles:updated", { id: vehicle.id });
  emitRealtime("dashboard:updated");
  return serialize(vehicle);
}

export async function update(id: string, data: Prisma.VehicleUpdateInput) {
  const vehicle = await prisma.vehicle.update({ where: { id }, data });
  emitRealtime("vehicles:updated", { id });
  emitRealtime("dashboard:updated");
  return serialize(vehicle);
}

export async function retire(id: string) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw notFound("Vehicle not found");
  if (vehicle.status === "On Trip") throw new AppError(409, "Cannot retire a vehicle that is On Trip", "INVALID_STATUS");
  const retired = await prisma.vehicle.update({ where: { id }, data: { status: "Retired" } });
  emitRealtime("vehicles:updated", { id });
  emitRealtime("dashboard:updated");
  return serialize(retired);
}
