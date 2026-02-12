/**
 * Auth Client - Better Auth React Hooks
 */

"use client";

import { createContext, useContext, ReactNode } from "react";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
});

export const { signIn, signUp, signOut, useSession } = authClient;

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <authClient.provider>
      {children}
    </authClient.provider>
  );
}

export function useAuth() {
  const { data: session, isLoading } = useSession();
  return {
    session,
    isLoading,
    isAuthenticated: !!session,
  };
}
