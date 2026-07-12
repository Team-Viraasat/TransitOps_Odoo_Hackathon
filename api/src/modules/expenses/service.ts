import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { emitRealtime } from "../../realtime/socket.js";
import { AppError, notFound } from "../../utils/http.js";
import { serialize } from "../../utils/serialize.js";

export async function list(query: Record<string, unknown>) {
  const where: Prisma.ExpenseWhereInput = {
    ...(query.vehicleId ? { vehicleId: String(query.vehicleId) } : {}),
    ...(query.tripId ? { tripId: String(query.tripId) } : {}),
    ...(query.dateFrom || query.dateTo
      ? {
          expenseDate: {
            ...(query.dateFrom ? { gte: query.dateFrom as Date } : {}),
            ...(query.dateTo ? { lte: query.dateTo as Date } : {}),
          },
        }
      : {}),
  };
  return { items: serialize(await prisma.expense.findMany({ where, include: { vehicle: true, trip: true }, orderBy: { expenseDate: "desc" } })) };
}

export async function create(data: Prisma.ExpenseUncheckedCreateInput, userId: string) {
  if (!data.vehicleId && !data.tripId) throw new AppError(400, "Expense must reference a vehicle or trip", "REFERENCE_REQUIRED");
  if (data.vehicleId && !(await prisma.vehicle.findUnique({ where: { id: String(data.vehicleId) } }))) throw notFound("Vehicle not found");
  if (data.tripId && !(await prisma.trip.findUnique({ where: { id: String(data.tripId) } }))) throw notFound("Trip not found");
  const record = await prisma.expense.create({ data: { ...data, createdById: userId } });
  emitRealtime("expenses:updated", { id: record.id });
  emitRealtime("analytics:updated");
  return serialize(record);
}
