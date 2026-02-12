/**
 * Auth Client - Better Auth React Hooks
 */

"use client";

import { type ReactNode } from "react";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
});

export const { signIn, signUp, signOut, useSession } = authClient;

export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useAuth() {
  const { data: session, isPending } = useSession();
  return {
    session,
    isLoading: isPending,
    isAuthenticated: !!session,
  };
}
