/**
 * Container Routes - Manage OpenClaw containers per user
 */

import { Router } from "express";
import { dockerClient, UserContainerConfig } from "../lib/docker";
import { getUserById, addSkillPack, removeSkillPack } from "../lib/auth";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();

const createContainerSchema = z.object({
  skillPacks: z.array(z.string()).min(1),
  environment: z.record(z.string()).optional(),
  memoryLimit: z.string().optional(),
  cpuLimit: z.string().optional(),
});

/**
 * POST /containers
 * Create a new container for the authenticated user
 */
router.post("/", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const user = getUserById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const data = createContainerSchema.parse(req.body);

    // Update user's skill packs
    user.skillPacks = data.skillPacks;

    const config: UserContainerConfig = {
      userId: user.id,
      email: user.email,
      skillPacks: data.skillPacks,
      environment: data.environment || {},
      memoryLimit: data.memoryLimit,
      cpuLimit: data.cpuLimit,
    };

    const container = await dockerClient.createContainer(config);

    res.status(201).json({
      id: container.id,
      name: container.name,
      status: container.status,
      createdAt: container.createdAt,
    });
  } catch (error) {
    console.error("Create container error:", error);
    res.status(500).json({ error: "Failed to create container" });
  }
});

/**
 * GET /containers
 * List all containers for the authenticated user
 */
router.get("/", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const containers = await dockerClient.listContainers();
    const userContainers = containers.filter(
      (c) => c.name === `openclaw-${req.user!.id}`
    );

    res.json(userContainers);
  } catch (error) {
    console.error("List containers error:", error);
    res.status(500).json({ error: "Failed to list containers" });
  }
});

/**
 * GET /containers/:id
 * Get container info
 */
router.get("/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const container = await dockerClient.getContainer(req.user!.id);
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
 * POST /containers/:id/message
 * Send a message to the user's agent
 */
router.post("/:id/message", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message required" });
      return;
    }

    const response = await dockerClient.sendMessage(req.user!.id, message);
    res.json({ response });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

/**
 * POST /containers/:id/stop
 * Stop the container
 */
router.post("/:id/stop", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const success = await dockerClient.stopContainer(req.user!.id);
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
 * DELETE /containers/:id
 * Delete the container
 */
router.delete("/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const success = await dockerClient.deleteContainer(req.user!.id);
    if (!success) {
      res.status(404).json({ error: "Container not found" });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Delete container error:", error);
    res.status(500).json({ error: "Failed to delete container" });
  }
});

/**
 * GET /containers/:id/logs
 * Get container logs
 */
router.get("/:id/logs", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const tail = parseInt(req.query.tail as string) || 100;
    const logs = await dockerClient.getLogs(req.user!.id, tail);
    res.json({ logs });
  } catch (error) {
    console.error("Get logs error:", error);
    res.status(500).json({ error: "Failed to get logs" });
  }
});

/**
 * POST /containers/:id/skill-packs
 * Add skill packs to user's container
 */
router.post("/:id/skill-packs", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { packs } = req.body;
    if (!Array.isArray(packs)) {
      res.status(400).json({ error: "packs must be an array" });
      return;
    }

    packs.forEach((pack: string) => addSkillPack(req.user!.id, pack));
    
    res.json({ success: true, skillPacks: packs });
  } catch (error) {
    console.error("Add skill packs error:", error);
    res.status(500).json({ error: "Failed to add skill packs" });
  }
});

/**
 * DELETE /containers/:id/skill-packs/:packId
 * Remove a skill pack
 */
router.delete("/:id/skill-packs/:packId", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { packId } = req.params;
    removeSkillPack(req.user!.id, packId);
    res.json({ success: true });
  } catch (error) {
    console.error("Remove skill pack error:", error);
    res.status(500).json({ error: "Failed to remove skill pack" });
  }
});

export default router;
