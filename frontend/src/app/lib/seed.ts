import type {
  User,
  Vehicle,
  Driver,
  Trip,
  MaintenanceLog,
  FuelLog,
  Expense,
  Settings,
} from "./types";

const daysFromNow = (d: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  return dt.toISOString().slice(0, 10);
};

export const seedUsers: User[] = [
  { id: "u1", name: "Priya Nair", email: "fleet@transitops.local", password: "password123", role: "Fleet Manager", status: "Active" },
  { id: "u2", name: "Arjun Mehta", email: "dispatch@transitops.local", password: "password123", role: "Dispatcher", status: "Active" },
  { id: "u3", name: "Sana Kapoor", email: "safety@transitops.local", password: "password123", role: "Safety Officer", status: "Active" },
  { id: "u4", name: "Rahul Desai", email: "finance@transitops.local", password: "password123", role: "Financial Analyst", status: "Active" },
  { id: "u5", name: "Admin", email: "admin@transitops.local", password: "password123", role: "Admin", status: "Active" },
];

export const seedVehicles: Vehicle[] = [
  { id: "v1", registrationNumber: "MH12AB1001", nameModel: "Tata Ace Gold", type: "Mini", maxLoadKg: 750, odometerKm: 48200, acquisitionCost: 620000, region: "West", status: "Available" },
  { id: "v2", registrationNumber: "MH14CD2045", nameModel: "Ashok Leyland Dost", type: "Van", maxLoadKg: 1250, odometerKm: 91300, acquisitionCost: 890000, region: "West", status: "On Trip" },
  { id: "v3", registrationNumber: "DL01EF3300", nameModel: "Tata 407 LPT", type: "Truck", maxLoadKg: 2500, odometerKm: 152000, acquisitionCost: 1450000, region: "North", status: "In Shop" },
  { id: "v4", registrationNumber: "KA05GH4120", nameModel: "Eicher Pro 2049", type: "Truck", maxLoadKg: 4000, odometerKm: 63400, acquisitionCost: 1980000, region: "South", status: "Available" },
  { id: "v5", registrationNumber: "TN09IJ5560", nameModel: "BharatBenz 1617", type: "Container", maxLoadKg: 9000, odometerKm: 210500, acquisitionCost: 3800000, region: "South", status: "Retired" },
  { id: "v6", registrationNumber: "GJ01KL6789", nameModel: "Mahindra Bolero Pik-Up", type: "Van", maxLoadKg: 1500, odometerKm: 33100, acquisitionCost: 940000, region: "West", status: "Available" },
];

export const seedDrivers: Driver[] = [
  { id: "d1", name: "Vikram Singh", licenseNumber: "MH-DL-77012", licenseCategory: "HMV", licenseExpiryDate: daysFromNow(420), contactNumber: "+91 98200 11223", safetyScore: 92, status: "Available" },
  { id: "d2", name: "Imran Sheikh", licenseNumber: "MH-DL-88234", licenseCategory: "Transport", licenseExpiryDate: daysFromNow(120), contactNumber: "+91 98330 44556", safetyScore: 84, status: "On Trip" },
  { id: "d3", name: "Manoj Kumar", licenseNumber: "DL-DL-33110", licenseCategory: "HMV", licenseExpiryDate: daysFromNow(-15), contactNumber: "+91 99100 77889", safetyScore: 71, status: "Available" },
  { id: "d4", name: "Suresh Rao", licenseNumber: "KA-DL-55221", licenseCategory: "LMV", licenseExpiryDate: daysFromNow(260), contactNumber: "+91 90080 22334", safetyScore: 58, status: "Suspended" },
  { id: "d5", name: "Deepak Yadav", licenseNumber: "GJ-DL-66445", licenseCategory: "Transport", licenseExpiryDate: daysFromNow(75), contactNumber: "+91 97250 66778", safetyScore: 88, status: "Off Duty" },
  { id: "d6", name: "Ravi Pillai", licenseNumber: "TN-DL-99001", licenseCategory: "HMV", licenseExpiryDate: daysFromNow(540), contactNumber: "+91 94440 33221", safetyScore: 95, status: "Available" },
];

export const seedTrips: Trip[] = [
  { id: "t1", tripCode: "TRP-1001", source: "Mumbai", destination: "Pune", vehicleId: "v2", driverId: "d2", cargoWeightKg: 1100, plannedDistanceKm: 150, actualDistanceKm: null, startOdometerKm: 91300, finalOdometerKm: null, fuelConsumedLiters: null, revenue: 18000, status: "Dispatched", createdAt: daysFromNow(-1) },
  { id: "t2", tripCode: "TRP-1002", source: "Bengaluru", destination: "Chennai", vehicleId: "v4", driverId: "d6", cargoWeightKg: 3200, plannedDistanceKm: 350, actualDistanceKm: 358, startOdometerKm: 62000, finalOdometerKm: 62358, fuelConsumedLiters: 92, revenue: 42000, status: "Completed", createdAt: daysFromNow(-6) },
  { id: "t3", tripCode: "TRP-1003", source: "Ahmedabad", destination: "Surat", vehicleId: null, driverId: null, cargoWeightKg: 900, plannedDistanceKm: 265, actualDistanceKm: null, startOdometerKm: null, finalOdometerKm: null, fuelConsumedLiters: null, revenue: 15000, status: "Draft", createdAt: daysFromNow(0) },
  { id: "t4", tripCode: "TRP-1004", source: "Delhi", destination: "Jaipur", vehicleId: null, driverId: null, cargoWeightKg: 2100, plannedDistanceKm: 280, actualDistanceKm: null, startOdometerKm: null, finalOdometerKm: null, fuelConsumedLiters: null, revenue: 26000, status: "Cancelled", cancelReason: "Customer postponed shipment", createdAt: daysFromNow(-3) },
];

export const seedMaintenance: MaintenanceLog[] = [
  { id: "m1", vehicleId: "v3", serviceType: "Engine Overhaul", description: "Coolant leak and gasket replacement", cost: 42000, startDate: daysFromNow(-2), endDate: null, status: "Active" },
  { id: "m2", vehicleId: "v1", serviceType: "Tyre Replacement", description: "4 tyres rotated and replaced", cost: 28000, startDate: daysFromNow(-30), endDate: daysFromNow(-28), status: "Completed" },
  { id: "m3", vehicleId: "v4", serviceType: "Periodic Service", description: "Oil, filters, brakes inspection", cost: 9500, startDate: daysFromNow(-20), endDate: daysFromNow(-20), status: "Completed" },
];

export const seedFuelLogs: FuelLog[] = [
  { id: "f1", vehicleId: "v4", tripId: "t2", liters: 92, cost: 8740, logDate: daysFromNow(-6), odometerKm: 62358 },
  { id: "f2", vehicleId: "v2", tripId: "t1", liters: 40, cost: 3800, logDate: daysFromNow(-1), odometerKm: 91300 },
  { id: "f3", vehicleId: "v1", tripId: null, liters: 25, cost: 2375, logDate: daysFromNow(-10), odometerKm: 48000 },
  { id: "f4", vehicleId: "v6", tripId: null, liters: 30, cost: 2850, logDate: daysFromNow(-4), odometerKm: 33000 },
];

export const seedExpenses: Expense[] = [
  { id: "e1", tripId: "t2", vehicleId: "v4", type: "Toll", description: "NH44 toll plazas", amount: 1450, expenseDate: daysFromNow(-6) },
  { id: "e2", tripId: "t1", vehicleId: "v2", type: "Misc", description: "Loading labour charges", amount: 900, expenseDate: daysFromNow(-1) },
  { id: "e3", tripId: null, vehicleId: "v6", type: "Maintenance", description: "Wiper and bulb replacement", amount: 650, expenseDate: daysFromNow(-4) },
];

export const seedSettings: Settings = {
  depotName: "TransitOps Central Depot",
  currency: "INR",
  distanceUnit: "km",
};
