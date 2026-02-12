import { createMiddleware } from "better-auth/express";

export const authMiddleware = createMiddleware({
  provider: "email-password",
});

export const optionalAuth = createMiddleware({
  provider: "email-password",
  optional: true,
});
