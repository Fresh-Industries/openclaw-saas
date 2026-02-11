/**
 * OpenClaw SaaS API Server
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

// Routes
import authRoutes from "./routes/auth";
import containerRoutes from "./routes/containers";
import billingRoutes from "./routes/billing";
import aiRoutes from "./routes/ai";

// Lib
import { dockerClient } from "./lib/docker";
import { prisma } from "./lib/db";
import { auth } from "./lib/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Better Auth endpoint (mounted at /api/auth)
app.use("/api/auth", authRoutes);

// API Routes
app.use("/api/containers", containerRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/ai", aiRoutes);

// Admin stats
app.get("/api/admin/stats", async (_req, res) => {
  try {
    const containers = await dockerClient.listContainers();
    const userCount = await prisma.user.count();

    res.json({
      totalContainers: containers.length,
      runningContainers: containers.filter((c) => c.status === "running").length,
      totalUsers: userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
async function start() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connected");

    // Initialize Docker (non-blocking)
    await dockerClient.init().catch(() => {});
    console.log("✅ Docker client initialized");
  } catch (error) {
    console.warn("Initialization warning:", error);
  }

  app.listen(PORT, () => {
    console.log(`
🚀 OpenClaw SaaS API running on http://localhost:${PORT}
   Health:    http://localhost:${PORT}/health
   Auth:      http://localhost:${PORT}/api/auth/*
   Containers: http://localhost:${PORT}/api/containers/*
   Billing:   http://localhost:${PORT}/api/billing/*
   AI:        http://localhost:${PORT}/api/ai/*
`);
  });
}

start().catch(console.error);
