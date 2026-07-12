import { z } from "zod";

export const driverStatus = z.enum(["Available", "On Trip", "Off Duty", "Suspended"]);
export const licenseCategory = z.enum(["LMV", "HMV", "Transport", "Other"]);

export const driverQuerySchema = z.object({
  search: z.string().optional(),
  status: driverStatus.optional(),
  licenseCategory: licenseCategory.optional(),
  page: z.coerce.number().int().positive().default(1),
});

export const createDriverSchema = z.object({
  name: z.string().min(2).max(120).transform((value) => value.trim()),
  licenseNumber: z.string().min(2).max(40).transform((value) => value.trim().toUpperCase()),
  licenseCategory,
  licenseExpiryDate: z.coerce.date(),
  contactNumber: z.string().min(5).max(30).transform((value) => value.trim()),
  safetyScore: z.coerce.number().int().min(0).max(100),
});

export const updateDriverSchema = createDriverSchema.partial().extend({
  status: driverStatus.optional(),
});

export const setDriverStatusSchema = z.object({ status: driverStatus });
export const idParamsSchema = z.object({ id: z.string().uuid() });
