import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const daysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date;
};

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.setting.deleteMany();

  const roles = await Promise.all(
    [
      ["Fleet Manager", "Manages fleet assets, lifecycle, and maintenance"],
      ["Dispatcher", "Creates and manages trips"],
      ["Safety Officer", "Manages driver compliance and safety"],
      ["Financial Analyst", "Reviews cost, fuel, ROI, and exports"],
      ["Admin", "Manages settings and RBAC"],
    ].map(([name, description]) => prisma.role.create({ data: { name, description } })),
  );
  const roleByName = Object.fromEntries(roles.map((role) => [role.name, role]));
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.createMany({
    data: [
      { name: "Priya Nair", email: "fleet@transitops.local", passwordHash, roleId: roleByName["Fleet Manager"].id },
      { name: "Arjun Mehta", email: "dispatch@transitops.local", passwordHash, roleId: roleByName.Dispatcher.id },
      { name: "Sana Kapoor", email: "safety@transitops.local", passwordHash, roleId: roleByName["Safety Officer"].id },
      { name: "Rahul Desai", email: "finance@transitops.local", passwordHash, roleId: roleByName["Financial Analyst"].id },
      { name: "Admin", email: "admin@transitops.local", passwordHash, roleId: roleByName.Admin.id },
    ],
  });

  const dispatcher = await prisma.user.findUniqueOrThrow({ where: { email: "dispatch@transitops.local" } });
  const fleetManager = await prisma.user.findUniqueOrThrow({ where: { email: "fleet@transitops.local" } });

  const v1 = await prisma.vehicle.create({ data: { registrationNumber: "MH12AB1001", nameModel: "Tata Ace Gold", type: "Mini", maxLoadKg: 750, odometerKm: 48200, acquisitionCost: 620000, region: "West", status: "Available" } });
  const v2 = await prisma.vehicle.create({ data: { registrationNumber: "MH14CD2045", nameModel: "Ashok Leyland Dost", type: "Van", maxLoadKg: 1250, odometerKm: 91300, acquisitionCost: 890000, region: "West", status: "On Trip" } });
  const v3 = await prisma.vehicle.create({ data: { registrationNumber: "DL01EF3300", nameModel: "Tata 407 LPT", type: "Truck", maxLoadKg: 2500, odometerKm: 152000, acquisitionCost: 1450000, region: "North", status: "In Shop" } });
  const v4 = await prisma.vehicle.create({ data: { registrationNumber: "KA05GH4120", nameModel: "Eicher Pro 2049", type: "Truck", maxLoadKg: 4000, odometerKm: 63400, acquisitionCost: 1980000, region: "South", status: "Available" } });
  await prisma.vehicle.create({ data: { registrationNumber: "TN09IJ5560", nameModel: "BharatBenz 1617", type: "Container", maxLoadKg: 9000, odometerKm: 210500, acquisitionCost: 3800000, region: "South", status: "Retired" } });
  const v6 = await prisma.vehicle.create({ data: { registrationNumber: "GJ01KL6789", nameModel: "Mahindra Bolero Pik-Up", type: "Van", maxLoadKg: 1500, odometerKm: 33100, acquisitionCost: 940000, region: "West", status: "Available" } });

  const d1 = await prisma.driver.create({ data: { name: "Vikram Singh", licenseNumber: "MH-DL-77012", licenseCategory: "HMV", licenseExpiryDate: daysFromNow(420), contactNumber: "+91 98200 11223", safetyScore: 92, status: "Available" } });
  const d2 = await prisma.driver.create({ data: { name: "Imran Sheikh", licenseNumber: "MH-DL-88234", licenseCategory: "Transport", licenseExpiryDate: daysFromNow(120), contactNumber: "+91 98330 44556", safetyScore: 84, status: "On Trip" } });
  await prisma.driver.create({ data: { name: "Manoj Kumar", licenseNumber: "DL-DL-33110", licenseCategory: "HMV", licenseExpiryDate: daysFromNow(-15), contactNumber: "+91 99100 77889", safetyScore: 71, status: "Available" } });
  await prisma.driver.create({ data: { name: "Suresh Rao", licenseNumber: "KA-DL-55221", licenseCategory: "LMV", licenseExpiryDate: daysFromNow(260), contactNumber: "+91 90080 22334", safetyScore: 58, status: "Suspended" } });
  await prisma.driver.create({ data: { name: "Deepak Yadav", licenseNumber: "GJ-DL-66445", licenseCategory: "Transport", licenseExpiryDate: daysFromNow(75), contactNumber: "+91 97250 66778", safetyScore: 88, status: "Off Duty" } });
  const d6 = await prisma.driver.create({ data: { name: "Ravi Pillai", licenseNumber: "TN-DL-99001", licenseCategory: "HMV", licenseExpiryDate: daysFromNow(540), contactNumber: "+91 94440 33221", safetyScore: 95, status: "Available" } });

  const t1 = await prisma.trip.create({ data: { tripCode: "TRP-1001", source: "Mumbai", destination: "Pune", vehicleId: v2.id, driverId: d2.id, cargoWeightKg: 1100, plannedDistanceKm: 150, startOdometerKm: 91300, revenue: 18000, status: "Dispatched", dispatchedAt: daysFromNow(-1), createdById: dispatcher.id, createdAt: daysFromNow(-1) } });
  const t2 = await prisma.trip.create({ data: { tripCode: "TRP-1002", source: "Bengaluru", destination: "Chennai", vehicleId: v4.id, driverId: d6.id, cargoWeightKg: 3200, plannedDistanceKm: 350, actualDistanceKm: 358, startOdometerKm: 62000, finalOdometerKm: 62358, fuelConsumedLiters: 92, revenue: 42000, status: "Completed", completedAt: daysFromNow(-6), createdById: dispatcher.id, createdAt: daysFromNow(-6) } });
  await prisma.trip.create({ data: { tripCode: "TRP-1003", source: "Ahmedabad", destination: "Surat", cargoWeightKg: 900, plannedDistanceKm: 265, revenue: 15000, status: "Draft", createdById: dispatcher.id } });
  await prisma.trip.create({ data: { tripCode: "TRP-1004", source: "Delhi", destination: "Jaipur", cargoWeightKg: 2100, plannedDistanceKm: 280, revenue: 26000, status: "Cancelled", cancelReason: "Customer postponed shipment", cancelledAt: daysFromNow(-3), createdById: dispatcher.id, createdAt: daysFromNow(-3) } });

  await prisma.maintenanceLog.create({ data: { vehicleId: v3.id, serviceType: "Engine Overhaul", description: "Coolant leak and gasket replacement", cost: 42000, startDate: daysFromNow(-2), status: "Active", createdById: fleetManager.id } });
  await prisma.maintenanceLog.create({ data: { vehicleId: v1.id, serviceType: "Tyre Replacement", description: "4 tyres rotated and replaced", cost: 28000, startDate: daysFromNow(-30), endDate: daysFromNow(-28), status: "Completed", createdById: fleetManager.id } });
  await prisma.maintenanceLog.create({ data: { vehicleId: v4.id, serviceType: "Periodic Service", description: "Oil, filters, brakes inspection", cost: 9500, startDate: daysFromNow(-20), endDate: daysFromNow(-20), status: "Completed", createdById: fleetManager.id } });

  await prisma.fuelLog.createMany({
    data: [
      { vehicleId: v4.id, tripId: t2.id, liters: 92, cost: 8740, logDate: daysFromNow(-6), odometerKm: 62358, createdById: dispatcher.id },
      { vehicleId: v2.id, tripId: t1.id, liters: 40, cost: 3800, logDate: daysFromNow(-1), odometerKm: 91300, createdById: dispatcher.id },
      { vehicleId: v1.id, liters: 25, cost: 2375, logDate: daysFromNow(-10), odometerKm: 48000, createdById: dispatcher.id },
      { vehicleId: v6.id, liters: 30, cost: 2850, logDate: daysFromNow(-4), odometerKm: 33000, createdById: dispatcher.id },
    ],
  });

  await prisma.expense.createMany({
    data: [
      { tripId: t2.id, vehicleId: v4.id, type: "Toll", description: "NH44 toll plazas", amount: 1450, expenseDate: daysFromNow(-6), createdById: dispatcher.id },
      { tripId: t1.id, vehicleId: v2.id, type: "Misc", description: "Loading labour charges", amount: 900, expenseDate: daysFromNow(-1), createdById: dispatcher.id },
      { vehicleId: v6.id, type: "Maintenance", description: "Wiper and bulb replacement", amount: 650, expenseDate: daysFromNow(-4), createdById: dispatcher.id },
    ],
  });

  await prisma.setting.create({
    data: {
      id: 1,
      depotName: "TransitOps Central Depot",
      currency: "INR",
      distanceUnit: "km",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seeded TransitOps demo data");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
