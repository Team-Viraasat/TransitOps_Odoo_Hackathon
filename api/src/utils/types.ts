export type RoleName =
  | "Fleet Manager"
  | "Dispatcher"
  | "Safety Officer"
  | "Financial Analyst"
  | "Admin";

export const roles = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst", "Admin"] as const;
