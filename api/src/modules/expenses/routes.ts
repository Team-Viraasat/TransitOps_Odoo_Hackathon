import { Router } from "express";
import { requireRole } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as controller from "./controller.js";
import { createExpenseSchema, expenseQuerySchema } from "./schema.js";

export const expenseRouter = Router();

expenseRouter.get("/", validate({ query: expenseQuerySchema }), controller.list);
expenseRouter.post("/", requireRole("Dispatcher", "Financial Analyst"), validate(createExpenseSchema), controller.create);
