import { Router } from "express";
import { requireRole } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as controller from "./controller.js";
import { createVehicleSchema, idParamsSchema, updateVehicleSchema, vehicleQuerySchema } from "./schema.js";

export const vehicleRouter = Router();

vehicleRouter.get("/", validate({ query: vehicleQuerySchema }), controller.list);
vehicleRouter.get("/available-for-dispatch", controller.available);
vehicleRouter.get("/:id", validate({ params: idParamsSchema }), controller.get);
vehicleRouter.post("/", requireRole("Fleet Manager"), validate(createVehicleSchema), controller.create);
vehicleRouter.patch("/:id", requireRole("Fleet Manager"), validate({ params: idParamsSchema, body: updateVehicleSchema }), controller.update);
vehicleRouter.patch("/:id/retire", requireRole("Fleet Manager"), validate({ params: idParamsSchema }), controller.retire);
