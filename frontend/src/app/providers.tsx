"use client";

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { PrefsSync } from "@/shared/prefs/prefs-sync";

let browserQueryClient: QueryClient | undefined;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Don't retry 4xx (e.g. 404, 403): the answer will not change.
        retry: (count, error) =>
          !(axios.isAxiosError(error) && error.response && error.response.status < 500) &&
          count < 2,
      },
    },
  });
}

function getQueryClient() {
  // New client per server render; one shared client in the browser.
  if (typeof window === "undefined") return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <PrefsSync />
      {children}
    </QueryClientProvider>
  );
}
