/**
 * Better Auth Express Handler
 */

import { auth } from "../lib/auth";
import { prisma } from "../lib/db";
import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string;
  };
}

/**
 * Create Better Auth request handler
 */
export function createAuthHandler() {
  return auth.handler;
}

/**
 * Middleware to require authentication
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Better Auth uses a different approach - we check the session
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }

  // For now, we'll use a simple auth check
  // Better Auth has its own middleware for Express
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // In production, use Better Auth's session validation
  next();
}

/**
 * Get current user from request
 */
export async function getCurrentUser(req: AuthenticatedRequest): Promise<{
  id: string;
  email: string;
  name?: string;
  image?: string;
} | null> {
  try {
    // Better Auth would handle this differently
    // This is a placeholder for the actual implementation
    return null;
  } catch {
    return null;
  }
}
