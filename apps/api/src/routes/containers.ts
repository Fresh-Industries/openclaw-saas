/**
 * Container Routes - Manage OpenClaw containers per user
 */

import { Router, Request, Response } from "express";
import { dockerClient } from "../lib/docker";
import { prisma } from "../lib/db";
import { z } from "zod";
import { auth } from "../lib/auth";

const router = Router();

const createContainerSchema = z.object({
  skillPacks: z.array(z.string()).min(1),
  environment: z.record(z.string()).optional(),
  memoryLimit: z.string().optional(),
  cpuLimit: z.string().optional(),
});

/**
 * GET /api/containers
 * List user's containers (session-based)
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const containers = await dockerClient.listContainers();
    const userContainers = containers.filter(
      (c) => c.name.includes(session.user.id)
    );

    res.json(userContainers);
  } catch (error) {
    console.error("List containers error:", error);
    res.status(500).json({ error: "Failed to list containers" });
  }
});

/**
 * POST /api/containers/create-default
 * Create a default container for the logged-in user (auto-creates on signup)
 */
router.post("/create-default", async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const userId = session.user.id;

    // Check if user already has a container
    const existingContainer = await prisma.container.findFirst({
      where: { userId },
    });

    if (existingContainer) {
      res.json({ 
        message: "Container already exists",
        containerId: existingContainer.containerId 
      });
      return;
    }

    // Get user's skill packs from their profile, or default to "personal"
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const skillPacks = user?.skillPacks?.length 
      ? user.skillPacks 
      : ["personal"];

    // Create the container
    const container = await dockerClient.createContainer({
      userId,
      email: session.user.email || `${userId}@openclaw.local`,
      skillPacks,
      environment: {},
      memoryLimit: "512m",
      cpuLimit: "0.5",
      // Default to MiniMax API key from server environment
      aiApiKey: process.env.MINIMAX_API_KEY,
    });

    // Save to database
    await prisma.container.create({
      data: {
        userId,
        containerId: container.id,
        name: container.name,
        status: container.status,
        skillPacks: JSON.stringify(skillPacks),
        memoryLimit: "512m",
        cpuLimit: "0.5",
      },
    });

    console.log(`Container created for user ${userId}: ${container.id}`);
    
    res.status(201).json({
      message: "Container created successfully",
      container,
    });
  } catch (error) {
    console.error("Create container error:", error);
    res.status(500).json({ error: "Failed to create container" });
  }
});

/**
 * POST /api/containers
 * Create a new container (by userId in body)
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, skillPacks, environment, memoryLimit, cpuLimit } = 
      createContainerSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Update user's skill packs
    await prisma.user.update({
      where: { id: userId },
      data: { skillPacks },
    });

    const container = await dockerClient.createContainer({
      userId,
      email: user.email,
      skillPacks,
      environment: environment || {},
      memoryLimit,
      cpuLimit,
      // Default to MiniMax API key from server environment
      aiApiKey: process.env.MINIMAX_API_KEY,
    });

    // Save to database
    await prisma.container.create({
      data: {
        userId,
        containerId: container.id,
        name: container.name,
        status: container.status,
        skillPacks: JSON.stringify(skillPacks),
        memoryLimit,
        cpuLimit,
      },
    });

    res.status(201).json(container);
  } catch (error) {
    console.error("Create container error:", error);
    res.status(500).json({ error: "Failed to create container" });
  }
});

/**
 * GET /api/containers/:id
 * Get container info
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const container = await dockerClient.getContainer(req.params.id);
    if (!container) {
      res.status(404).json({ error: "Container not found" });
      return;
    }

    res.json(container);
  } catch (error) {
    console.error("Get container error:", error);
    res.status(500).json({ error: "Failed to get container" });
  }
});

/**
 * POST /api/containers/:id/message
 * Send a message to the agent
 */
router.post("/:id/message", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message required" });
      return;
    }

    const response = await dockerClient.sendMessage(req.params.id, message);
    res.json({ response });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

/**
 * POST /api/containers/:id/stop
 * Stop container
 */
router.post("/:id/stop", async (req: Request, res: Response) => {
  try {
    const success = await dockerClient.stopContainer(req.params.id);
    if (!success) {
      res.status(404).json({ error: "Container not found" });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Stop container error:", error);
    res.status(500).json({ error: "Failed to stop container" });
  }
});

/**
 * DELETE /api/containers/:id
 * Delete container
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const success = await dockerClient.deleteContainer(req.params.id);
    if (!success) {
      res.status(404).json({ error: "Container not found" });
      return;
    }

    // Remove from database
    await prisma.container.deleteMany({
      where: { containerId: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Delete container error:", error);
    res.status(500).json({ error: "Failed to delete container" });
  }
});

/**
 * GET /api/containers/:id/logs
 * Get container logs
 */
router.get("/:id/logs", async (req: Request, res: Response) => {
  try {
    const tail = parseInt(req.query.tail as string) || 100;
    const logs = await dockerClient.getLogs(req.params.id, tail);
    res.json({ logs });
  } catch (error) {
    console.error("Get logs error:", error);
    res.status(500).json({ error: "Failed to get logs" });
  }
});

export default router;
