import { Router } from "express";
import { requireRole } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as controller from "./controller.js";
import { analyticsQuerySchema } from "./schema.js";

export const analyticsRouter = Router();

analyticsRouter.get("/summary", requireRole("Financial Analyst", "Fleet Manager", "Dispatcher", "Safety Officer"), validate({ query: analyticsQuerySchema }), controller.summary);
analyticsRouter.get("/fuel-efficiency", controller.fuelEfficiency);
analyticsRouter.get("/fleet-utilization", controller.fleetUtilization);
analyticsRouter.get("/operational-cost", controller.operationalCost);
analyticsRouter.get("/vehicle-roi", controller.vehicleRoi);
analyticsRouter.get("/export.csv", requireRole("Financial Analyst"), controller.exportCsv);
