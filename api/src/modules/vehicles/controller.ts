import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import * as service from "./service.js";

export const list = asyncHandler(async (req: Request, res: Response) => res.json(await service.list(req.query)));
export const available = asyncHandler(async (_req: Request, res: Response) => res.json({ items: await service.availableForDispatch() }));
export const get = asyncHandler(async (req: Request, res: Response) => res.json({ item: await service.get(req.params.id) }));
export const create = asyncHandler(async (req: Request, res: Response) => res.status(201).json({ item: await service.create(req.body) }));
export const update = asyncHandler(async (req: Request, res: Response) => res.json({ item: await service.update(req.params.id, req.body) }));
export const retire = asyncHandler(async (req: Request, res: Response) => res.json({ item: await service.retire(req.params.id) }));
