import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";

function dateWhere(dateFrom?: Date, dateTo?: Date) {
  return dateFrom || dateTo ? { gte: dateFrom, lte: dateTo } : undefined;
}

export async function summary(dateFrom?: Date, dateTo?: Date) {
  const tripDate = dateWhere(dateFrom, dateTo);
  const [fuel, maintenance, expenses, revenue, vehicles, onTrip] = await prisma.$transaction([
    prisma.fuelLog.aggregate({ where: { logDate: tripDate }, _sum: { liters: true, cost: true } }),
    prisma.maintenanceLog.aggregate({ where: { startDate: tripDate }, _sum: { cost: true } }),
    prisma.expense.aggregate({ where: { expenseDate: tripDate }, _sum: { amount: true } }),
    prisma.trip.aggregate({ where: { status: "Completed", completedAt: tripDate }, _sum: { actualDistanceKm: true, revenue: true } }),
    prisma.vehicle.count({ where: { status: { not: "Retired" } } }),
    prisma.vehicle.count({ where: { status: "On Trip" } }),
  ]);

  const liters = Number(fuel._sum.liters ?? 0);
  const distance = Number(revenue._sum.actualDistanceKm ?? 0);
  const fuelCost = Number(fuel._sum.cost ?? 0);
  const maintenanceCost = Number(maintenance._sum.cost ?? 0);
  const otherExpenses = Number(expenses._sum.amount ?? 0);
  const totalRevenue = Number(revenue._sum.revenue ?? 0);

  return {
    fuelEfficiency: liters ? Number((distance / liters).toFixed(2)) : 0,
    fleetUtilization: vehicles ? Number(((onTrip / vehicles) * 100).toFixed(2)) : 0,
    operationalCost: fuelCost + maintenanceCost,
    totalCost: fuelCost + maintenanceCost + otherExpenses,
    revenue: totalRevenue,
    profit: totalRevenue - fuelCost - maintenanceCost - otherExpenses,
  };
}

export async function fuelEfficiency() {
  const rows = await prisma.trip.findMany({
    where: { status: "Completed", actualDistanceKm: { not: null }, fuelConsumedLiters: { not: null } },
    include: { vehicle: true },
    orderBy: { completedAt: "desc" },
    take: 20,
  });
  return rows.map((trip) => ({
    tripCode: trip.tripCode,
    vehicle: trip.vehicle?.registrationNumber ?? "Unknown",
    kmPerLiter: Number(trip.fuelConsumedLiters) ? Number((Number(trip.actualDistanceKm) / Number(trip.fuelConsumedLiters)).toFixed(2)) : 0,
  }));
}

export async function fleetUtilization() {
  const rows = await prisma.vehicle.groupBy({ by: ["status"], _count: { status: true } });
  return rows.map((row) => ({ status: row.status, count: row._count.status }));
}

export async function operationalCost() {
  const [fuel, maintenance, expenses] = await prisma.$transaction([
    prisma.fuelLog.aggregate({ _sum: { cost: true } }),
    prisma.maintenanceLog.aggregate({ _sum: { cost: true } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
  ]);
  return {
    fuel: Number(fuel._sum.cost ?? 0),
    maintenance: Number(maintenance._sum.cost ?? 0),
    otherExpenses: Number(expenses._sum.amount ?? 0),
  };
}

export async function vehicleRoi() {
  const vehicles = await prisma.vehicle.findMany({
    include: { trips: true, maintenanceLogs: true, fuelLogs: true },
    orderBy: { registrationNumber: "asc" },
  });
  return vehicles.map((vehicle) => {
    const revenue = vehicle.trips.reduce((sum, trip) => sum + Number(trip.revenue), 0);
    const maintenance = vehicle.maintenanceLogs.reduce((sum, row) => sum + Number(row.cost), 0);
    const fuel = vehicle.fuelLogs.reduce((sum, row) => sum + Number(row.cost), 0);
    const acquisition = Number(vehicle.acquisitionCost);
    return {
      vehicleId: vehicle.id,
      registrationNumber: vehicle.registrationNumber,
      roi: acquisition ? Number((((revenue - maintenance - fuel) / acquisition) * 100).toFixed(2)) : 0,
    };
  });
}

export async function exportCsv() {
  const trips = await prisma.trip.findMany({ include: { vehicle: true, driver: true }, orderBy: { createdAt: "desc" } });
  const header = ["tripCode", "status", "source", "destination", "vehicle", "driver", "cargoWeightKg", "plannedDistanceKm", "actualDistanceKm", "revenue"];
  const lines = trips.map((trip) =>
    [
      trip.tripCode,
      trip.status,
      trip.source,
      trip.destination,
      trip.vehicle?.registrationNumber ?? "",
      trip.driver?.name ?? "",
      trip.cargoWeightKg,
      trip.plannedDistanceKm,
      trip.actualDistanceKm ?? "",
      trip.revenue,
    ]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}
