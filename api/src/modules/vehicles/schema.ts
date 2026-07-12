import { z } from "zod";

export const vehicleStatus = z.enum(["Available", "On Trip", "In Shop", "Retired"]);
export const vehicleType = z.enum(["Van", "Truck", "Mini", "Container", "Other"]);

export const vehicleQuerySchema = z.object({
  search: z.string().optional(),
  type: vehicleType.optional(),
  status: vehicleStatus.optional(),
  region: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
});

export const createVehicleSchema = z.object({
  registrationNumber: z.string().min(2).max(20).transform((value) => value.trim().toUpperCase()),
  nameModel: z.string().min(2).max(120).transform((value) => value.trim()),
  type: vehicleType,
  maxLoadKg: z.coerce.number().positive(),
  odometerKm: z.coerce.number().int().nonnegative(),
  acquisitionCost: z.coerce.number().nonnegative(),
  region: z.string().min(1).max(80).transform((value) => value.trim()),
});

export const updateVehicleSchema = createVehicleSchema.partial().extend({
  status: vehicleStatus.optional(),
});

export const idParamsSchema = z.object({ id: z.string().uuid() });
