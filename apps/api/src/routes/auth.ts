/**
 * Auth Routes
 */

import { Router } from "express";
import { authenticateUser, createUser, getUserById, updateUser } from "../lib/auth";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

/**
 * POST /auth/register
 */
router.post("/register", async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const { user, token } = await createUser(data.email, data.password, data.name);
    
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        skillPacks: user.skillPacks,
        subscriptionTier: user.subscriptionTier,
      },
      token,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "User already exists") {
      res.status(409).json({ error: "User already exists" });
      return;
    }
    res.status(400).json({ error: "Invalid request" });
  }
});

/**
 * POST /auth/login
 */
router.post("/login", async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authenticateUser(data.email, data.password);
    
    if (!result) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    res.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        skillPacks: result.user.skillPacks,
        subscriptionTier: result.user.subscriptionTier,
      },
      token: result.token,
    });
  } catch {
    res.status(400).json({ error: "Invalid request" });
  }
});

/**
 * GET /auth/me
 */
router.get("/me", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const user = getUserById(req.user!.id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    skillPacks: user.skillPacks,
    subscriptionTier: user.subscriptionTier,
    createdAt: user.createdAt,
  });
});

/**
 * PUT /auth/me
 */
router.put("/me", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const user = updateUser(req.user!.id, req.body);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    skillPacks: user.skillPacks,
    subscriptionTier: user.subscriptionTier,
  });
});

export default router;
