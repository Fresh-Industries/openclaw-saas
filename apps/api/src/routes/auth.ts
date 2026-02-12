/**
 * Auth Routes - Express handlers for Better Auth
 */

import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth";

const router = Router();
const authHandler = toNodeHandler(auth);

// Delegate every /api/auth/* request to Better Auth's handler.
router.all("*", async (req, res, next) => {
  try {
    await authHandler(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
