import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import * as service from "./service.js";

export const summary = asyncHandler(async (req: Request, res: Response) => res.json(await service.summary(req.query.dateFrom as Date | undefined, req.query.dateTo as Date | undefined)));
export const fuelEfficiency = asyncHandler(async (_req, res: Response) => res.json({ items: await service.fuelEfficiency() }));
export const fleetUtilization = asyncHandler(async (_req, res: Response) => res.json({ items: await service.fleetUtilization() }));
export const operationalCost = asyncHandler(async (_req, res: Response) => res.json(await service.operationalCost()));
export const vehicleRoi = asyncHandler(async (_req, res: Response) => res.json({ items: await service.vehicleRoi() }));
export const exportCsv = asyncHandler(async (_req, res: Response) => {
  res.header("Content-Type", "text/csv");
  res.attachment("transitops-analytics.csv");
  res.send(await service.exportCsv());
});
