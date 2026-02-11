/**
 * Auth Routes - Express handlers for Better Auth
 */

import { Router, Request, Response } from "express";
import { auth } from "../lib/auth";

const router = Router();

// Better Auth handles all auth endpoints
// Just mount it on /api/auth/*

router.get("/sign-up", async (req: Request, res: Response) => {
  // Better Auth handles this
  res.json({ message: "Use POST /api/auth/sign-up" });
});

router.post("/sign-up", async (req: Request, res: Response) => {
  try {
    const result = await auth.api.signUp({
      body: req.body,
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Sign up failed" });
  }
});

router.post("/sign-in", async (req: Request, res: Response) => {
  try {
    const result = await auth.api.signIn({
      body: req.body,
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Sign in failed" });
  }
});

router.get("/session", async (req: Request, res: Response) => {
  try {
    const result = await auth.api.getSession({
      headers: req.headers,
    });
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message || "No session" });
  }
});

router.post("/sign-out", async (req: Request, res: Response) => {
  try {
    const result = await auth.api.signOut({
      headers: req.headers,
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Sign out failed" });
  }
});

router.get("/verify-session", async (req: Request, res: Response) => {
  try {
    const result = await auth.api.verifySession({
      headers: req.headers,
    });
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ valid: false });
  }
});

export default router;
