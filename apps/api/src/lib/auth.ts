/**
 * Better Auth Configuration
 */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite", // Change to "postgresql" for production
  }),
  secret: process.env.BETTER_AUTH_SECRET || "your-secret-change-in-production",
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",") || ["http://localhost:3000"],
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  plugins: [
    // Add plugins here (e.g., email, oauth, etc.)
  ],
  // Optional: Configure sign up / sign in
  advanced: {
    cookiePrefix: "openclaw",
  },
});

export default auth;
