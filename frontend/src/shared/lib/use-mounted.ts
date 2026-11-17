import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * false on the server and during hydration, true afterwards.
 * Use it before showing anything that depends on localStorage (like the login state),
 * so server HTML and the first browser render always match.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
