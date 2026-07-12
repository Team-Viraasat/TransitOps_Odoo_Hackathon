import { Router } from "express";
import { requireRole } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as controller from "./controller.js";
import { createMaintenanceSchema, idParamsSchema, maintenanceQuerySchema, updateMaintenanceSchema } from "./schema.js";

export const maintenanceRouter = Router();

maintenanceRouter.get("/", validate({ query: maintenanceQuerySchema }), controller.list);
maintenanceRouter.post("/", requireRole("Fleet Manager"), validate(createMaintenanceSchema), controller.create);
maintenanceRouter.patch("/:id", requireRole("Fleet Manager"), validate({ params: idParamsSchema, body: updateMaintenanceSchema }), controller.update);
maintenanceRouter.post("/:id/close", requireRole("Fleet Manager"), validate({ params: idParamsSchema }), controller.close);
