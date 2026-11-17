import { connection } from "next/server";
import type { EventDetail, EventSummary, PageResponse } from "./types";

/**
 * Server-side calls (Server Components). They talk to Spring Boot directly, so the
 * first HTML already contains the data: fast first paint and good SEO for event pages.
 * Only public endpoints are called here — no user token on the server.
 */
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

export class BackendUnavailableError extends Error {}

async function get<T>(path: string): Promise<T | null> {
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/api/v1${path}`, { headers: { Accept: "application/json" } });
  } catch {
    throw new BackendUnavailableError("Cannot reach the backend server.");
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Backend error ${res.status} for ${path}`);
  return (await res.json()) as T;
}

export async function fetchPublishedEvents(params: { q?: string; page?: number }) {
  const search = new URLSearchParams({ page: String(params.page ?? 0), size: "12" });
  if (params.q) search.set("q", params.q);
  const page = await get<PageResponse<EventSummary>>(`/events?${search}`);
  return page!;
}

export function fetchEvent(eventId: string) {
  return get<EventDetail>(`/events/${encodeURIComponent(eventId)}`);
}

/**
 * "Now" for a server render. connection() marks the render as per-request (never cached),
 * so the time and the stock numbers are always fresh.
 */
export async function requestTime(): Promise<number> {
  await connection();
  return Date.now();
}
