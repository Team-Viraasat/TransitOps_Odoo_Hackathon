import { Router } from "express";
import * as controller from "./controller.js";

export const dashboardRouter = Router();

dashboardRouter.get("/kpis", controller.kpis);
dashboardRouter.get("/recent-trips", controller.recentTrips);
dashboardRouter.get("/vehicle-status-breakdown", controller.vehicleStatusBreakdown);
