import type { Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import * as service from "./service.js";

export const kpis = asyncHandler(async (_req, res: Response) => res.json(await service.kpis()));
export const recentTrips = asyncHandler(async (_req, res: Response) => res.json({ items: await service.recentTrips() }));
export const vehicleStatusBreakdown = asyncHandler(async (_req, res: Response) => res.json({ items: await service.vehicleStatusBreakdown() }));
