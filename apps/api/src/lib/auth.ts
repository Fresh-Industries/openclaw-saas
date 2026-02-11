/**
 * Auth Library - JWT-based authentication
 */

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

export interface UserPayload {
  id: string;
  email: string;
  role: "user" | "admin";
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  skillPacks: string[];
  subscriptionTier: "free" | "personal" | "professional" | "business";
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory store (replace with PostgreSQL in production)
const users: Map<string, User> = new Map();

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

/**
 * Create user
 */
export async function createUser(
  email: string,
  password: string,
  name?: string
): Promise<{ user: User; token: string }> {
  const existingUser = Array.from(users.values()).find((u) => u.email === email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const passwordHash = await hashPassword(password);
  const user: User = {
    id: uuidv4(),
    email,
    passwordHash,
    name,
    skillPacks: [],
    subscriptionTier: "free",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  users.set(user.id, user);

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: "user",
  });

  return { user, token };
}

/**
 * Authenticate user
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: User; token: string } | null> {
  const user = Array.from(users.values()).find((u) => u.email === email);
  if (!user) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return { user, token };
}

/**
 * Get user by ID
 */
export function getUserById(id: string): User | null {
  return users.get(id) || null;
}

/**
 * Get user by email
 */
export function getUserByEmail(email: string): User | null {
  return Array.from(users.values()).find((u) => u.email === email) || null;
}

/**
 * Update user
 */
export function updateUser(id: string, updates: Partial<User>): User | null {
  const user = users.get(id);
  if (!user) return null;

  const updated = {
    ...user,
    ...updates,
    updatedAt: new Date(),
  };
  users.set(id, updated);
  return updated;
}

/**
 * Add skill pack to user
 */
export function addSkillPack(userId: string, packId: string): boolean {
  const user = users.get(userId);
  if (!user) return false;

  if (!user.skillPacks.includes(packId)) {
    user.skillPacks.push(packId);
    users.set(userId, user);
  }
  return true;
}

/**
 * Remove skill pack from user
 */
export function removeSkillPack(userId: string, packId: string): boolean {
  const user = users.get(userId);
  if (!user) return false;

  user.skillPacks = user.skillPacks.filter((p) => p !== packId);
  users.set(userId, user);
  return true;
}

/**
 * Get all users (admin only)
 */
export function getAllUsers(): User[] {
  return Array.from(users.values());
}

/**
 * Delete user
 */
export function deleteUser(id: string): boolean {
  return users.delete(id);
}
