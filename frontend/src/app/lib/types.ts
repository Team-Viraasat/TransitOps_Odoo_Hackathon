export type RoleName =
  | "Fleet Manager"
  | "Dispatcher"
  | "Safety Officer"
  | "Financial Analyst"
  | "Admin";

export type VehicleStatus = "Available" | "On Trip" | "In Shop" | "Retired";
export type VehicleType = "Van" | "Truck" | "Mini" | "Container" | "Other";

export type DriverStatus = "Available" | "On Trip" | "Off Duty" | "Suspended";
export type LicenseCategory = "LMV" | "HMV" | "Transport" | "Other";

export type TripStatus = "Draft" | "Dispatched" | "Completed" | "Cancelled";
export type MaintenanceStatus = "Active" | "Completed";
export type ExpenseType = "Toll" | "Maintenance" | "Misc";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: RoleName;
  status: "Active" | "Locked" | "Disabled";
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  nameModel: string;
  type: VehicleType;
  maxLoadKg: number;
  odometerKm: number;
  acquisitionCost: number;
  region: string;
  status: VehicleStatus;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: LicenseCategory;
  licenseExpiryDate: string; // ISO date
  contactNumber: string;
  safetyScore: number;
  status: DriverStatus;
}

export interface Trip {
  id: string;
  tripCode: string;
  source: string;
  destination: string;
  vehicleId: string | null;
  driverId: string | null;
  cargoWeightKg: number;
  plannedDistanceKm: number;
  actualDistanceKm: number | null;
  startOdometerKm: number | null;
  finalOdometerKm: number | null;
  fuelConsumedLiters: number | null;
  revenue: number;
  status: TripStatus;
  cancelReason?: string;
  createdAt: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  serviceType: string;
  description: string;
  cost: number;
  startDate: string;
  endDate: string | null;
  status: MaintenanceStatus;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  tripId: string | null;
  liters: number;
  cost: number;
  logDate: string;
  odometerKm: number | null;
}

export interface Expense {
  id: string;
  tripId: string | null;
  vehicleId: string | null;
  type: ExpenseType;
  description: string;
  amount: number;
  expenseDate: string;
}

export interface Settings {
  depotName: string;
  currency: string;
  distanceUnit: string;
}
