import { z } from "zod";

export const maintenanceQuerySchema = z.object({
  vehicleId: z.string().uuid().optional(),
  status: z.enum(["Active", "Completed"]).optional(),
  page: z.coerce.number().int().positive().default(1),
});

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().uuid(),
  serviceType: z.string().min(2).max(120).transform((value) => value.trim()),
  description: z.string().max(500).default(""),
  cost: z.coerce.number().nonnegative(),
  startDate: z.coerce.date().optional(),
});

export const updateMaintenanceSchema = z.object({
  serviceType: z.string().min(2).max(120).transform((value) => value.trim()).optional(),
  description: z.string().max(500).optional(),
  cost: z.coerce.number().nonnegative().optional(),
});

export const idParamsSchema = z.object({ id: z.string().uuid() });
