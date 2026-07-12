import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import * as service from "./service.js";

export const get = asyncHandler(async (_req, res: Response) => res.json(await service.get()));
export const update = asyncHandler(async (req: Request, res: Response) => res.json({ settings: await service.update(req.body) }));
