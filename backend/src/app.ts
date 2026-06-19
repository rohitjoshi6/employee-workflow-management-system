import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import adminRoutes from "./routes/admin.js";
import approvalsRoutes from "./routes/approvals.js";
import requestRoutes from "./routes/requests.js";

dotenv.config();

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173" }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "employee-workflow-management-system" });
  });

  app.get("/api/auth/me", async (req, res, next) => {
    const { authenticate } = await import("./middleware/auth.js");
    return authenticate(req, res, next);
  }, (req, res) => {
    res.json({ user: (req as typeof req & { user: unknown }).user });
  });

  app.use("/api/requests", requestRoutes);
  app.use("/api/approvals", approvalsRoutes);
  app.use("/api/admin", adminRoutes);

  app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  return app;
}

