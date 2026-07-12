import { Router } from "express";
import { requireRole } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as controller from "./controller.js";
import { cancelTripSchema, completeTripSchema, createTripSchema, idParamsSchema, tripQuerySchema } from "./schema.js";

export const tripRouter = Router();

tripRouter.get("/", validate({ query: tripQuerySchema }), controller.list);
tripRouter.get("/:id", validate({ params: idParamsSchema }), controller.get);
tripRouter.post("/", requireRole("Dispatcher"), validate(createTripSchema), controller.create);
tripRouter.post("/:id/dispatch", requireRole("Dispatcher"), validate({ params: idParamsSchema }), controller.dispatch);
tripRouter.post("/:id/complete", requireRole("Dispatcher"), validate({ params: idParamsSchema, body: completeTripSchema }), controller.complete);
tripRouter.post("/:id/cancel", requireRole("Dispatcher"), validate({ params: idParamsSchema, body: cancelTripSchema }), controller.cancel);
