import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import * as service from "./service.js";

export const list = asyncHandler(async (req: Request, res: Response) => res.json(await service.list(req.query)));
export const get = asyncHandler(async (req: Request, res: Response) => res.json({ item: await service.get(req.params.id) }));
export const create = asyncHandler(async (req: Request, res: Response) => res.status(201).json({ item: await service.create(req.body, req.user!.id) }));
export const dispatch = asyncHandler(async (req: Request, res: Response) => res.json({ item: await service.dispatch(req.params.id) }));
export const complete = asyncHandler(async (req: Request, res: Response) => res.json({ item: await service.complete(req.params.id, req.body, req.user!.id) }));
export const cancel = asyncHandler(async (req: Request, res: Response) => res.json({ item: await service.cancel(req.params.id, req.body.reason) }));
