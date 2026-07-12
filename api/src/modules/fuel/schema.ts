import { z } from "zod";

export const fuelQuerySchema = z.object({
  vehicleId: z.string().uuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export const createFuelLogSchema = z.object({
  vehicleId: z.string().uuid(),
  tripId: z.string().uuid().nullable().optional(),
  liters: z.coerce.number().positive(),
  cost: z.coerce.number().nonnegative(),
  logDate: z.coerce.date(),
  odometerKm: z.coerce.number().int().nonnegative().nullable().optional(),
});
