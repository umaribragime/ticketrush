import { useEffect, useState } from "react";

/**
 * Current time that ticks every `intervalMs`.
 * Starts from the server's time so the first browser render matches the server HTML.
 */
export function useNow(serverNow: number, intervalMs = 1000): number {
  const [now, setNow] = useState(serverNow);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** 3725000 ms → { days: 0, h: "01", m: "02", s: "05" } (never negative). */
export function countdownParts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    h: String(Math.floor((total % 86400) / 3600)).padStart(2, "0"),
    m: String(Math.floor((total % 3600) / 60)).padStart(2, "0"),
    s: String(total % 60).padStart(2, "0"),
  };
}
