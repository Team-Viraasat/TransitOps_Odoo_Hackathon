import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding TransitOps database...\n");

  // ─── Roles ───────────────────────────────────────────
  const roles = await Promise.all(
    [
      { name: "Fleet_Manager" as const, description: "Manages fleet assets, vehicle lifecycle, and maintenance" },
      { name: "Dispatcher" as const, description: "Creates and manages trips" },
      { name: "Safety_Officer" as const, description: "Manages driver compliance and safety status" },
      { name: "Financial_Analyst" as const, description: "Reviews costs, fuel, expenses, ROI, and analytics" },
      { name: "Admin" as const, description: "Full system access including settings and RBAC" },
    ].map((r) =>
      prisma.role.upsert({
        where: { name: r.name },
        update: { description: r.description },
        create: r,
      })
    )
  );

  const roleMap = Object.fromEntries(roles.map((r) => [r.name, r.id]));
  console.log(`✅ Roles: ${roles.length}`);

  // ─── Users ───────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password123", 10);

  const usersData = [
    { name: "Rajesh Sharma", email: "fleet@transitops.local", roleId: roleMap.Fleet_Manager },
    { name: "Priya Patel", email: "dispatch@transitops.local", roleId: roleMap.Dispatcher },
    { name: "Amit Singh", email: "safety@transitops.local", roleId: roleMap.Safety_Officer },
    { name: "Neha Gupta", email: "finance@transitops.local", roleId: roleMap.Financial_Analyst },
    { name: "Vikram Admin", email: "admin@transitops.local", roleId: roleMap.Admin },
  ];

  const users = await Promise.all(
    usersData.map((u) =>
      prisma.user.upsert({
        where: { email: u.email },
        update: { name: u.name, passwordHash, roleId: u.roleId },
        create: { ...u, passwordHash },
      })
    )
  );

  const userMap = Object.fromEntries(users.map((u) => [u.email.split("@")[0], u.id]));
  console.log(`✅ Users: ${users.length}`);

  // ─── Vehicles ────────────────────────────────────────
  const vehiclesData = [
    { registrationNumber: "GJ-01-AB-1234", nameModel: "Tata Ace Gold", type: "Mini" as const, maxLoadKg: 750, odometerKm: 45200, acquisitionCost: 450000, region: "Gujarat", status: "Available" as const },
    { registrationNumber: "MH-02-CD-5678", nameModel: "Ashok Leyland Dost+", type: "Truck" as const, maxLoadKg: 1500, odometerKm: 78500, acquisitionCost: 750000, region: "Maharashtra", status: "Available" as const },
    { registrationNumber: "RJ-14-EF-9012", nameModel: "Mahindra Bolero Pickup", type: "Van" as const, maxLoadKg: 1250, odometerKm: 62100, acquisitionCost: 890000, region: "Rajasthan", status: "Available" as const },
    { registrationNumber: "GJ-05-GH-3456", nameModel: "Eicher Pro 2049", type: "Truck" as const, maxLoadKg: 4900, odometerKm: 124300, acquisitionCost: 1650000, region: "Gujarat", status: "On_Trip" as const },
    { registrationNumber: "MH-12-IJ-7890", nameModel: "Tata 407 Gold SFC", type: "Container" as const, maxLoadKg: 3500, odometerKm: 95800, acquisitionCost: 1250000, region: "Maharashtra", status: "In_Shop" as const },
    { registrationNumber: "DL-08-KL-2345", nameModel: "Force Traveller 3350", type: "Van" as const, maxLoadKg: 1800, odometerKm: 156000, acquisitionCost: 1100000, region: "Delhi", status: "Retired" as const },
    { registrationNumber: "GJ-03-MN-6789", nameModel: "BharatBenz 1217C", type: "Truck" as const, maxLoadKg: 8500, odometerKm: 210400, acquisitionCost: 2400000, region: "Gujarat", status: "Available" as const },
    { registrationNumber: "KA-01-OP-1122", nameModel: "Tata Intra V30", type: "Mini" as const, maxLoadKg: 1100, odometerKm: 33700, acquisitionCost: 680000, region: "Karnataka", status: "Available" as const },
  ];

  const vehicles = await Promise.all(
    vehiclesData.map((v) =>
      prisma.vehicle.upsert({
        where: { registrationNumber: v.registrationNumber },
        update: { status: v.status, odometerKm: v.odometerKm },
        create: v,
      })
    )
  );

  const vehMap = Object.fromEntries(vehicles.map((v) => [v.registrationNumber, v.id]));
  console.log(`✅ Vehicles: ${vehicles.length}`);

  // ─── Drivers ─────────────────────────────────────────
  const driversData = [
    { name: "Suresh Kumar", licenseNumber: "GJ01-2020-0045672", licenseCategory: "HMV" as const, licenseExpiryDate: new Date("2027-06-15"), contactNumber: "+91-9876543210", safetyScore: 92, status: "Available" as const },
    { name: "Ramesh Yadav", licenseNumber: "MH02-2019-0098234", licenseCategory: "HMV" as const, licenseExpiryDate: new Date("2027-03-20"), contactNumber: "+91-9876543211", safetyScore: 87, status: "Available" as const },
    { name: "Dinesh Prajapati", licenseNumber: "RJ14-2021-0034567", licenseCategory: "Transport" as const, licenseExpiryDate: new Date("2028-01-10"), contactNumber: "+91-9876543212", safetyScore: 95, status: "On_Trip" as const },
    { name: "Mahesh Joshi", licenseNumber: "GJ05-2018-0076543", licenseCategory: "LMV" as const, licenseExpiryDate: new Date("2025-09-30"), contactNumber: "+91-9876543213", safetyScore: 78, status: "Off_Duty" as const },
    { name: "Kamlesh Solanki", licenseNumber: "MH12-2022-0012345", licenseCategory: "HMV" as const, licenseExpiryDate: new Date("2028-11-05"), contactNumber: "+91-9876543214", safetyScore: 45, status: "Suspended" as const },
    { name: "Prakash Meena", licenseNumber: "DL08-2017-0054321", licenseCategory: "Transport" as const, licenseExpiryDate: new Date("2025-02-28"), contactNumber: "+91-9876543215", safetyScore: 82, status: "Available" as const },
  ];

  const drivers = await Promise.all(
    driversData.map((d) =>
      prisma.driver.upsert({
        where: { licenseNumber: d.licenseNumber },
        update: { status: d.status, safetyScore: d.safetyScore },
        create: d,
      })
    )
  );

  const drvMap = Object.fromEntries(drivers.map((d) => [d.name.split(" ")[0], d.id]));
  console.log(`✅ Drivers: ${drivers.length}`);

  // ─── Trips ───────────────────────────────────────────
  const dispatcherId = userMap["dispatch"];
  const fleetUserId = userMap["fleet"];

  const tripsData = [
    { tripCode: "TR-2026-001", vehicleId: vehMap["GJ-01-AB-1234"], driverId: drvMap["Suresh"], source: "Ahmedabad", destination: "Surat", cargoWeightKg: 600, plannedDistanceKm: 265, actualDistanceKm: 272, startOdometerKm: 44800, finalOdometerKm: 45072, fuelConsumedLiters: 28.5, revenue: 18500, status: "Completed" as const, dispatchedAt: new Date("2026-07-08T06:00:00Z"), completedAt: new Date("2026-07-08T14:30:00Z"), createdById: dispatcherId },
    { tripCode: "TR-2026-002", vehicleId: vehMap["MH-02-CD-5678"], driverId: drvMap["Ramesh"], source: "Mumbai", destination: "Pune", cargoWeightKg: 1200, plannedDistanceKm: 150, actualDistanceKm: 155, startOdometerKm: 78200, finalOdometerKm: 78355, fuelConsumedLiters: 22, revenue: 12000, status: "Completed" as const, dispatchedAt: new Date("2026-07-09T07:00:00Z"), completedAt: new Date("2026-07-09T12:00:00Z"), createdById: dispatcherId },
    { tripCode: "TR-2026-003", vehicleId: vehMap["GJ-05-GH-3456"], driverId: drvMap["Dinesh"], source: "Rajkot", destination: "Jamnagar", cargoWeightKg: 3800, plannedDistanceKm: 100, status: "Dispatched" as const, dispatchedAt: new Date("2026-07-12T05:00:00Z"), createdById: dispatcherId },
    { tripCode: "TR-2026-004", source: "Vadodara", destination: "Bharuch", cargoWeightKg: 900, plannedDistanceKm: 75, status: "Draft" as const, createdById: dispatcherId },
    { tripCode: "TR-2026-005", vehicleId: vehMap["RJ-14-EF-9012"], driverId: drvMap["Suresh"], source: "Jaipur", destination: "Jodhpur", cargoWeightKg: 1000, plannedDistanceKm: 340, status: "Cancelled" as const, cancelReason: "Client cancelled order", cancelledAt: new Date("2026-07-10T10:00:00Z"), createdById: dispatcherId },
  ];

  const trips = await Promise.all(
    tripsData.map((t) =>
      prisma.trip.upsert({ where: { tripCode: t.tripCode }, update: { status: t.status }, create: t })
    )
  );

  const tripMap = Object.fromEntries(trips.map((t) => [t.tripCode, t.id]));
  console.log(`✅ Trips: ${trips.length}`);

  // ─── Maintenance Logs ────────────────────────────────
  const maintenanceCount = await prisma.maintenanceLog.count();
  if (maintenanceCount === 0) {
    await prisma.maintenanceLog.createMany({
      data: [
        { vehicleId: vehMap["MH-12-IJ-7890"], serviceType: "Engine Overhaul", description: "Full engine inspection and oil seal replacement", cost: 45000, startDate: new Date("2026-07-11T09:00:00Z"), status: "Active", createdById: fleetUserId },
        { vehicleId: vehMap["GJ-01-AB-1234"], serviceType: "Brake Pad Replacement", description: "Front and rear brake pads replaced", cost: 8500, startDate: new Date("2026-06-20T08:00:00Z"), endDate: new Date("2026-06-21T16:00:00Z"), status: "Completed", createdById: fleetUserId },
        { vehicleId: vehMap["MH-02-CD-5678"], serviceType: "Tyre Rotation", description: "All four tyres rotated and balanced", cost: 3200, startDate: new Date("2026-06-15T10:00:00Z"), endDate: new Date("2026-06-15T14:00:00Z"), status: "Completed", createdById: fleetUserId },
      ],
    });
  }
  console.log(`✅ Maintenance Logs: 3`);

  // ─── Fuel Logs ───────────────────────────────────────
  const fuelCount = await prisma.fuelLog.count();
  if (fuelCount === 0) {
    await prisma.fuelLog.createMany({
      data: [
        { vehicleId: vehMap["GJ-01-AB-1234"], tripId: tripMap["TR-2026-001"], liters: 28.5, cost: 2850, logDate: new Date("2026-07-08T06:30:00Z"), odometerKm: 44830, createdById: dispatcherId },
        { vehicleId: vehMap["MH-02-CD-5678"], tripId: tripMap["TR-2026-002"], liters: 22, cost: 2200, logDate: new Date("2026-07-09T07:30:00Z"), odometerKm: 78230, createdById: dispatcherId },
        { vehicleId: vehMap["GJ-05-GH-3456"], tripId: tripMap["TR-2026-003"], liters: 15, cost: 1500, logDate: new Date("2026-07-12T05:30:00Z"), odometerKm: 124350, createdById: dispatcherId },
        { vehicleId: vehMap["GJ-03-MN-6789"], liters: 45, cost: 4500, logDate: new Date("2026-07-05T11:00:00Z"), odometerKm: 210000, createdById: fleetUserId },
        { vehicleId: vehMap["KA-01-OP-1122"], liters: 20, cost: 2000, logDate: new Date("2026-07-06T09:00:00Z"), odometerKm: 33500, createdById: fleetUserId },
      ],
    });
  }
  console.log(`✅ Fuel Logs: 5`);

  // ─── Expenses ────────────────────────────────────────
  const expenseCount = await prisma.expense.count();
  if (expenseCount === 0) {
    await prisma.expense.createMany({
      data: [
        { tripId: tripMap["TR-2026-001"], vehicleId: vehMap["GJ-01-AB-1234"], type: "Toll", description: "Ahmedabad-Surat highway toll", amount: 450, expenseDate: new Date("2026-07-08T08:00:00Z"), createdById: dispatcherId },
        { tripId: tripMap["TR-2026-002"], vehicleId: vehMap["MH-02-CD-5678"], type: "Toll", description: "Mumbai-Pune expressway toll", amount: 380, expenseDate: new Date("2026-07-09T08:00:00Z"), createdById: dispatcherId },
        { tripId: tripMap["TR-2026-001"], vehicleId: vehMap["GJ-01-AB-1234"], type: "Misc", description: "Driver meals and parking", amount: 650, expenseDate: new Date("2026-07-08T12:00:00Z"), createdById: dispatcherId },
        { vehicleId: vehMap["MH-12-IJ-7890"], type: "Maintenance", description: "Engine overhaul parts procurement", amount: 32000, expenseDate: new Date("2026-07-11T10:00:00Z"), createdById: fleetUserId },
        { tripId: tripMap["TR-2026-003"], vehicleId: vehMap["GJ-05-GH-3456"], type: "Toll", description: "Rajkot-Jamnagar toll", amount: 200, expenseDate: new Date("2026-07-12T06:00:00Z"), createdById: dispatcherId },
      ],
    });
  }
  console.log(`✅ Expenses: 5`);

  console.log("\n🎉 Seed complete!");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
