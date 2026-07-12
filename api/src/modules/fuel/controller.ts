import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import * as service from "./service.js";

export const list = asyncHandler(async (req: Request, res: Response) => res.json(await service.list(req.query)));
export const create = asyncHandler(async (req: Request, res: Response) => res.status(201).json({ item: await service.create(req.body, req.user!.id) }));
