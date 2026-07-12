import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { requireAuth } from "./middleware/auth.middleware.js";
import { authRouter } from "./modules/auth/routes.js";
import { vehicleRouter } from "./modules/vehicles/routes.js";
import { driverRouter } from "./modules/drivers/routes.js";
import { tripRouter } from "./modules/trips/routes.js";
import { maintenanceRouter } from "./modules/maintenance/routes.js";
import { fuelRouter } from "./modules/fuel/routes.js";
import { expenseRouter } from "./modules/expenses/routes.js";
import { dashboardRouter } from "./modules/dashboard/routes.js";
import { analyticsRouter } from "./modules/analytics/routes.js";
import { settingsRouter } from "./modules/settings/routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use(morgan("dev"));

  app.get("/api/health", (_req, res) => res.json({ ok: true, service: "transitops-api" }));
  app.use("/api/auth", authRouter);

  app.use("/api", requireAuth);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/vehicles", vehicleRouter);
  app.use("/api/drivers", driverRouter);
  app.use("/api/trips", tripRouter);
  app.use("/api/maintenance", maintenanceRouter);
  app.use("/api/fuel-logs", fuelRouter);
  app.use("/api/expenses", expenseRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/settings", settingsRouter);

  app.use(errorMiddleware);
  return app;
}
