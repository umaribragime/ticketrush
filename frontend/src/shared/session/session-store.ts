import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Role } from "@/shared/api/types";

/**
 * Client state = only the login token (Zustand).
 * Server state (events, tickets...) lives in TanStack Query, not here.
 */
interface SessionState {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

let expiryTimer: ReturnType<typeof setTimeout> | undefined;

/** Log out automatically the moment the token expires. */
function scheduleExpiry(token: string | null, logout: () => void) {
  clearTimeout(expiryTimer);
  const exp = token ? decodeToken(token)?.exp : undefined;
  if (!exp) return;
  const msLeft = exp * 1000 - Date.now();
  if (msLeft <= 0) logout();
  else expiryTimer = setTimeout(logout, Math.min(msLeft, 2_147_483_647));
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      token: null,
      login: (token) => {
        set({ token });
        scheduleExpiry(token, get().logout);
      },
      logout: () => {
        clearTimeout(expiryTimer);
        set({ token: null });
      },
    }),
    {
      name: "ticketrush-session",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
      // After reading localStorage: drop an expired token, or set the timer.
      onRehydrateStorage: () => (state) => {
        if (state) scheduleExpiry(state.token, state.logout);
      },
    },
  ),
);

export interface TokenClaims {
  sub: string;
  name: string;
  email: string;
  roles: Role[];
  exp: number;
}

/** Reads the JWT payload. (Only for display — the backend always re-checks the signature.) */
export function decodeToken(token: string): TokenClaims | null {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = new TextDecoder().decode(Uint8Array.from(atob(payload), (c) => c.charCodeAt(0)));
    return JSON.parse(json) as TokenClaims;
  } catch {
    return null;
  }
}
