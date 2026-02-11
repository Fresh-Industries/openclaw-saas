/**
 * Container Routes - Manage OpenClaw containers per user
 */

import { Router, Request, Response } from "express";
import { dockerClient } from "../lib/docker";
import { prisma } from "../lib/db";
import { z } from "zod";

const router = Router();

const createContainerSchema = z.object({
  skillPacks: z.array(z.string()).min(1),
  environment: z.record(z.string()).optional(),
  memoryLimit: z.string().optional(),
  cpuLimit: z.string().optional(),
});

/**
 * GET /api/containers
 * List user's containers
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const containers = await dockerClient.listContainers();
    const userContainers = containers.filter(
      (c) => c.name.includes(req.query.userId as string || "")
    );

    res.json(userContainers);
  } catch (error) {
    console.error("List containers error:", error);
    res.status(500).json({ error: "Failed to list containers" });
  }
});

/**
 * POST /api/containers
 * Create a new container
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
