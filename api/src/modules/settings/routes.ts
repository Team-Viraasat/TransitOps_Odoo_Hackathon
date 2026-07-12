import { Router } from "express";
import { requireRole } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as controller from "./controller.js";
import { updateSettingsSchema } from "./schema.js";

export const settingsRouter = Router();

settingsRouter.get("/", controller.get);
settingsRouter.patch("/", requireRole("Admin"), validate(updateSettingsSchema), controller.update);
