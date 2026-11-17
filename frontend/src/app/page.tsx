import { Suspense } from "react";
import {
  BackendUnavailableError,
  fetchPublishedEvents,
  requestTime,
} from "@/shared/api/server-api";
import { BackendDown, EventGrid } from "./event-grid";
import { HomeHero } from "./home-hero";

/**
 * Public event list. The data is fetched on the server (Server Component):
 * the HTML arrives with events already inside → fast first paint + SEO.
 */
export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <div className="flex flex-col gap-20">
      <HomeHero />
      <Suspense fallback={<ListSkeleton />}>
        <EventList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function EventList({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const page = Math.max(0, Number(params.page ?? 0) || 0);

  const now = await requestTime(); // always fresh: stock changes every second on ticket-open day
  let result;
  try {
    result = await fetchPublishedEvents({ q, page });
  } catch (e) {
    if (e instanceof BackendUnavailableError) return <BackendDown />;
    throw e;
  }
  // JSX outside try/catch: rendering errors belong to error boundaries (error.tsx), not here.
  return <EventGrid result={result} q={q} page={page} now={now} />;
}

function ListSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="bg-surface-2 h-80 animate-pulse rounded-3xl" />
      ))}
    </div>
  );
}
