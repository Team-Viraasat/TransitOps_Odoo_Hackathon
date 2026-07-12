import type { RoleName } from "./types";

export type ModuleKey =
  | "Dashboard"
  | "Vehicles"
  | "Drivers"
  | "Trips"
  | "Maintenance"
  | "Fuel Logs"
  | "Expenses"
  | "Analytics"
  | "Settings/RBAC";

export type Access = "None" | "View" | "Limited" | "Create/View" | "Full";

export const PERMISSION_MATRIX: Record<ModuleKey, Record<RoleName, Access>> = {
  Dashboard: { "Fleet Manager": "View", Dispatcher: "View", "Safety Officer": "View", "Financial Analyst": "View", Admin: "View" },
  Vehicles: { "Fleet Manager": "Full", Dispatcher: "View", "Safety Officer": "View", "Financial Analyst": "View", Admin: "Full" },
  Drivers: { "Fleet Manager": "View", Dispatcher: "View", "Safety Officer": "Full", "Financial Analyst": "View", Admin: "Full" },
  Trips: { "Fleet Manager": "View", Dispatcher: "Full", "Safety Officer": "View", "Financial Analyst": "View", Admin: "Full" },
  Maintenance: { "Fleet Manager": "Full", Dispatcher: "View", "Safety Officer": "View", "Financial Analyst": "View", Admin: "Full" },
  "Fuel Logs": { "Fleet Manager": "View", Dispatcher: "Create/View", "Safety Officer": "View", "Financial Analyst": "Full", Admin: "Full" },
  Expenses: { "Fleet Manager": "View", Dispatcher: "Create/View", "Safety Officer": "View", "Financial Analyst": "Full", Admin: "Full" },
  Analytics: { "Fleet Manager": "View", Dispatcher: "Limited", "Safety Officer": "Limited", "Financial Analyst": "Full", Admin: "Full" },
  "Settings/RBAC": { "Fleet Manager": "None", Dispatcher: "None", "Safety Officer": "None", "Financial Analyst": "None", Admin: "Full" },
};

export const canWrite = (role: RoleName, mod: ModuleKey): boolean => {
  const a = PERMISSION_MATRIX[mod][role];
  return a === "Full" || a === "Create/View";
};

export const canView = (role: RoleName, mod: ModuleKey): boolean => {
  return PERMISSION_MATRIX[mod][role] !== "None";
};
