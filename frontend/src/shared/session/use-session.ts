"use client";

import { useMounted } from "@/shared/lib/use-mounted";
import type { Role } from "@/shared/api/types";
import { decodeToken, useSessionStore, type TokenClaims } from "./session-store";

export type Session =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "authenticated"; user: TokenClaims; hasRole: (role: Role) => boolean };

/**
 * "loading" until the browser has read localStorage, so server HTML never shows
 * a logged-in UI by mistake.
 */
export function useSession(): Session {
  const mounted = useMounted();
  const token = useSessionStore((s) => s.token);

  if (!mounted) return { status: "loading" };
  const claims = token ? decodeToken(token) : null;
  // Expired tokens are removed by the store itself (see session-store.ts).
  if (!claims) return { status: "anonymous" };
  return {
    status: "authenticated",
    user: claims,
    hasRole: (role) => claims.roles.includes(role),
  };
}
