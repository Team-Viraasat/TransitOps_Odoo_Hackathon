import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../db/prisma.js";
import { AppError } from "../utils/http.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.accessToken;
  if (!token) return next(new AppError(401, "Authentication required", "AUTH_REQUIRED"));

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { role: true } });
    if (!user || user.status !== "Active") {
      return next(new AppError(401, "Authentication required", "AUTH_REQUIRED"));
    }
    req.user = { id: user.id, email: user.email, role: user.role.name };
    return next();
  } catch {
    return next(new AppError(401, "Authentication required", "AUTH_REQUIRED"));
  }
}
