import type { NextFunction, Request, Response } from "express";
import type { RoleName } from "../utils/types.js";
import { AppError } from "../utils/http.js";

export const requireRole =
  (...roles: RoleName[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError(401, "Authentication required", "AUTH_REQUIRED"));
    if (req.user.role === "Admin" || roles.includes(req.user.role as RoleName)) return next();
    return next(new AppError(403, "You do not have permission for this action", "FORBIDDEN"));
  };
