import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { requireAuth, requireCsrf } from "./http/auth";
import { errorHandler, notFoundHandler } from "./http/errors";
import { sanitizeRequest } from "./http/sanitize";
import { availableResourcesRouter } from "./modules/available-resources/available-resources.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes";
import { inventoryRouter } from "./modules/inventory/inventory.routes";
import { privacyRouter } from "./modules/privacy/privacy.routes";
import { reportsRouter } from "./modules/reports/reports.routes";
import { usersRouter } from "./modules/users/users.routes";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.WEB_ORIGIN,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(sanitizeRequest);
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/health", (_request, response) => {
  response.json({ data: { status: "ok", service: "inventario-ti-api" } });
});

app.use("/api/auth", authRouter);
app.use("/api/privacy", privacyRouter);
app.use("/api", requireAuth, requireCsrf);
app.use("/api/users", usersRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/resources", availableResourcesRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/reports", reportsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
