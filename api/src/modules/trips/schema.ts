import { z } from "zod";

export const tripStatus = z.enum(["Draft", "Dispatched", "Completed", "Cancelled"]);

export const tripQuerySchema = z.object({
  status: tripStatus.optional(),
  vehicleId: z.string().uuid().optional(),
  driverId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
});

export const createTripSchema = z.object({
  source: z.string().min(2).max(120).transform((value) => value.trim()),
  destination: z.string().min(2).max(120).transform((value) => value.trim()),
  vehicleId: z.string().uuid().nullable().optional(),
  driverId: z.string().uuid().nullable().optional(),
  cargoWeightKg: z.coerce.number().positive(),
  plannedDistanceKm: z.coerce.number().positive(),
  revenue: z.coerce.number().nonnegative().default(0),
}).refine((data) => data.source.toLowerCase() !== data.destination.toLowerCase(), {
  message: "Source and destination cannot be identical",
  path: ["destination"],
});

export const completeTripSchema = z.object({
  finalOdometerKm: z.coerce.number().int().positive(),
  actualDistanceKm: z.coerce.number().positive(),
  fuelConsumedLiters: z.coerce.number().nonnegative().default(0),
  revenue: z.coerce.number().nonnegative().default(0),
});

export const cancelTripSchema = z.object({
  reason: z.string().min(2).max(240).transform((value) => value.trim()),
});

export const idParamsSchema = z.object({ id: z.string().uuid() });
