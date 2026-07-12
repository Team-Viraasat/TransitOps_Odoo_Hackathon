import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { asyncHandler } from "../../utils/async-handler.js";
import * as authService from "./service.js";

export const loginLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body.email, req.body.password);
  res.cookie("accessToken", result.token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 8 * 60 * 60 * 1000,
  });
  res.json({ user: result.user });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.json({ ok: true });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  res.json({ user: await authService.getMe(req.user!.id) });
});
