import type { Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense } from "./types";

export function computeKpis(vehicles: Vehicle[], drivers: Driver[], trips: Trip[]) {
  const activeVehicles = vehicles.filter((v) => v.status !== "Retired");
  const available = vehicles.filter((v) => v.status === "Available").length;
  const onTrip = vehicles.filter((v) => v.status === "On Trip").length;
  const inShop = vehicles.filter((v) => v.status === "In Shop").length;
  const activeTrips = trips.filter((t) => t.status === "Dispatched").length;
  const pendingTrips = trips.filter((t) => t.status === "Draft").length;
  const driversOnDuty = drivers.filter((d) => d.status === "Available" || d.status === "On Trip").length;
  const utilization = activeVehicles.length ? Math.round((onTrip / activeVehicles.length) * 100) : 0;
  return { available, onTrip, inShop, activeTrips, pendingTrips, driversOnDuty, utilization, activeVehicleCount: activeVehicles.length };
}

export function vehicleStatusBreakdown(vehicles: Vehicle[]) {
  const counts: Record<string, number> = { Available: 0, "On Trip": 0, "In Shop": 0, Retired: 0 };
  vehicles.forEach((v) => (counts[v.status] = (counts[v.status] ?? 0) + 1));
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export const STATUS_COLORS: Record<string, string> = {
  Available: "#36b26a",
  "On Trip": "#4a90e2",
  "In Shop": "#f59e0b",
  Retired: "#ef5350",
};

export function operationalCost(fuelLogs: FuelLog[], maintenance: MaintenanceLog[], expenses: Expense[]) {
  const fuel = fuelLogs.reduce((s, f) => s + f.cost, 0);
  const maint = maintenance.reduce((s, m) => s + m.cost, 0);
  const other = expenses.reduce((s, e) => s + e.amount, 0);
  return { fuel, maint, other, requiredTotal: fuel + maint, grandTotal: fuel + maint + other };
}

export function fuelEfficiency(trips: Trip[]) {
  const completed = trips.filter((t) => t.status === "Completed" && t.fuelConsumedLiters && t.actualDistanceKm);
  const dist = completed.reduce((s, t) => s + (t.actualDistanceKm ?? 0), 0);
  const fuel = completed.reduce((s, t) => s + (t.fuelConsumedLiters ?? 0), 0);
  return fuel ? dist / fuel : 0;
}

export function vehicleRoi(vehicles: Vehicle[], trips: Trip[], fuelLogs: FuelLog[], maintenance: MaintenanceLog[]) {
  return vehicles
    .filter((v) => v.status !== "Retired")
    .map((v) => {
      const revenue = trips.filter((t) => t.vehicleId === v.id && t.status === "Completed").reduce((s, t) => s + t.revenue, 0);
      const fuel = fuelLogs.filter((f) => f.vehicleId === v.id).reduce((s, f) => s + f.cost, 0);
      const maint = maintenance.filter((m) => m.vehicleId === v.id).reduce((s, m) => s + m.cost, 0);
      const cost = fuel + maint;
      const roi = v.acquisitionCost ? ((revenue - cost) / v.acquisitionCost) * 100 : 0;
      return { vehicle: v, revenue, cost, roi };
    });
}

export const fmtMoney = (n: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
