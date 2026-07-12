import { Router } from "express";
import { requireRole } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as controller from "./controller.js";
import { createFuelLogSchema, fuelQuerySchema } from "./schema.js";

export const fuelRouter = Router();

fuelRouter.get("/", validate({ query: fuelQuerySchema }), controller.list);
fuelRouter.post("/", requireRole("Dispatcher", "Financial Analyst"), validate(createFuelLogSchema), controller.create);
