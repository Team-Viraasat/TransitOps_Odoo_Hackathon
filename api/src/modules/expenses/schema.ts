import { z } from "zod";

export const expenseQuerySchema = z.object({
  vehicleId: z.string().uuid().optional(),
  tripId: z.string().uuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export const createExpenseSchema = z.object({
  tripId: z.string().uuid().nullable().optional(),
  vehicleId: z.string().uuid().nullable().optional(),
  type: z.enum(["Toll", "Maintenance", "Misc"]),
  description: z.string().max(500).default(""),
  amount: z.coerce.number().nonnegative(),
  expenseDate: z.coerce.date(),
});
