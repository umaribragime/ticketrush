"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "@/shared/session/session-store";

/** Log out: forget the token AND the previous user's cached data, then go home. */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useSessionStore((s) => s.logout);
  return () => {
    logout();
    queryClient.clear();
    router.push("/");
  };
}
