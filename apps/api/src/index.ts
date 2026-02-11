/**
 * OpenClaw SaaS API Server
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import containerRoutes from "./routes/containers";
import billingRoutes from "./routes/billing";
import { dockerClient } from "./lib/docker";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/containers", containerRoutes);
app.use("/api/billing", billingRoutes);

// Admin routes (example)
app.get("/api/admin/stats", async (req, res) => {
  try {
    const containers = await dockerClient.listContainers();
    res.json({
      totalContainers: containers.length,
      runningContainers: containers.filter((c) => c.status === "running").length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
async function start() {
  try {
    await dockerClient.init();
    console.log("Docker client initialized");
  } catch (error) {
    console.warn("Docker not available:", error);
  }

  app.listen(PORT, () => {
    console.log(`🚀 OpenClaw SaaS API running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   API:   http://localhost:${PORT}/api`);
  });
}

start().catch(console.error);
