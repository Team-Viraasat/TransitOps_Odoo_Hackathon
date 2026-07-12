import { Router } from "express";
import { requireRole } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as controller from "./controller.js";
import { createDriverSchema, driverQuerySchema, idParamsSchema, setDriverStatusSchema, updateDriverSchema } from "./schema.js";

export const driverRouter = Router();

driverRouter.get("/", validate({ query: driverQuerySchema }), controller.list);
driverRouter.get("/available-for-dispatch", controller.available);
driverRouter.get("/:id", validate({ params: idParamsSchema }), controller.get);
driverRouter.post("/", requireRole("Safety Officer"), validate(createDriverSchema), controller.create);
driverRouter.patch("/:id", requireRole("Safety Officer"), validate({ params: idParamsSchema, body: updateDriverSchema }), controller.update);
driverRouter.patch("/:id/status", requireRole("Safety Officer"), validate({ params: idParamsSchema, body: setDriverStatusSchema }), controller.setStatus);
