import { prisma } from "../../db/prisma.js";
import { serialize } from "../../utils/serialize.js";

export async function kpis() {
  const [totalActiveVehicles, availableVehicles, maintenanceVehicles, activeTrips, draftTrips, driversOnDuty, allVehicles] =
    await prisma.$transaction([
      prisma.vehicle.count({ where: { status: { not: "Retired" } } }),
      prisma.vehicle.count({ where: { status: "Available" } }),
      prisma.vehicle.count({ where: { status: "In Shop" } }),
      prisma.trip.count({ where: { status: "Dispatched" } }),
      prisma.trip.count({ where: { status: "Draft" } }),
      prisma.driver.count({ where: { status: { in: ["Available", "On Trip"] } } }),
      prisma.vehicle.count({ where: { status: { not: "Retired" } } }),
    ]);

  return {
    activeVehicles: totalActiveVehicles,
    availableVehicles,
    vehiclesInMaintenance: maintenanceVehicles,
    activeTrips,
    pendingTrips: draftTrips,
    driversOnDuty,
    fleetUtilization: allVehicles ? Math.round((activeTrips / allVehicles) * 100) : 0,
  };
}

export async function recentTrips() {
  const trips = await prisma.trip.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: { vehicle: true, driver: true },
  });
  return serialize(trips);
}

export async function vehicleStatusBreakdown() {
  const rows = await prisma.vehicle.groupBy({ by: ["status"], _count: { status: true } });
  return rows.map((row) => ({ status: row.status, count: row._count.status }));
}
