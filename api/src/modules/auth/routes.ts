import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as controller from "./controller.js";
import { loginSchema } from "./schema.js";

export const authRouter = Router();

authRouter.post("/login", controller.loginLimiter, validate(loginSchema), controller.login);
authRouter.post("/logout", controller.logout);
authRouter.get("/me", requireAuth, controller.me);
