import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { emitRealtime } from "../../realtime/socket.js";
import { AppError, notFound } from "../../utils/http.js";
import { serialize } from "../../utils/serialize.js";

const pageSize = 25;

export async function list(query: Record<string, unknown>) {
  const page = Number(query.page ?? 1);
  const where: Prisma.DriverWhereInput = {
    ...(query.status ? { status: String(query.status) } : {}),
    ...(query.licenseCategory ? { licenseCategory: String(query.licenseCategory) } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: String(query.search), mode: "insensitive" } },
            { licenseNumber: { contains: String(query.search), mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.driver.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.driver.count({ where }),
  ]);
  return { items: serialize(items), total, page, pageSize };
}

export async function availableForDispatch() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const drivers = await prisma.driver.findMany({
    where: { status: "Available", licenseExpiryDate: { gte: today } },
    orderBy: { name: "asc" },
  });
  return serialize(drivers);
}

export async function get(id: string) {
  const driver = await prisma.driver.findUnique({ where: { id } });
  if (!driver) throw notFound("Driver not found");
  return serialize(driver);
}

export async function create(data: Prisma.DriverCreateInput) {
  const driver = await prisma.driver.create({ data: { ...data, status: "Available" } });
  emitRealtime("drivers:updated", { id: driver.id });
  emitRealtime("dashboard:updated");
  return serialize(driver);
}

export async function update(id: string, data: Prisma.DriverUpdateInput) {
  const driver = await prisma.driver.update({ where: { id }, data });
  emitRealtime("drivers:updated", { id });
  emitRealtime("dashboard:updated");
  return serialize(driver);
}

export async function setStatus(id: string, status: string) {
  const driver = await prisma.driver.findUnique({ where: { id } });
  if (!driver) throw notFound("Driver not found");
  if (driver.status === "On Trip") throw new AppError(409, "Driver is On Trip. Close the trip first.", "INVALID_STATUS");
  const updated = await prisma.driver.update({ where: { id }, data: { status } });
  emitRealtime("drivers:updated", { id });
  emitRealtime("dashboard:updated");
  return serialize(updated);
}
