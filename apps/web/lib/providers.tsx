"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAuthClient } from "better-auth/react";
import { useState } from "react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <authClient.provider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </authClient.provider>
  );
}
