import { z } from "zod";

export const updateSettingsSchema = z.object({
  depotName: z.string().min(2).max(120).optional(),
  currency: z.string().min(2).max(12).optional(),
  distanceUnit: z.string().min(1).max(20).optional(),
});
