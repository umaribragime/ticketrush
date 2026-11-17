"use client";

import Link from "next/link";
import { SearchX, ServerCrash } from "lucide-react";
import { EventCard } from "@/entities/event/ui";
import type { EventSummary, PageResponse } from "@/shared/api/types";
import { useT } from "@/shared/i18n/use-t";
import { EmptyState } from "@/shared/ui/misc";
import { EventSearch } from "./event-search";

/** Receives server-fetched data; only adds language-aware text and layout. */
export function EventGrid({
  result,
  q,
  page,
  now,
}: {
  result: PageResponse<EventSummary>;
  q: string;
  page: number;
  now: number;
}) {
  const t = useT();
  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-ink text-3xl font-bold tracking-tight sm:text-4xl">
            {q ? t("home.results", { q }) : t("home.all")}
          </h2>
          <p className="text-muted mt-1 text-sm">{t("home.count", { n: result.totalElements })}</p>
        </div>
        <EventSearch defaultValue={q} />
      </div>

      {result.content.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-6" />}
          title={t("home.empty")}
          description={t("home.emptyDesc")}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.content.map((event, i) => (
            <EventCard key={event.id} event={event} now={now} index={i} />
          ))}
        </div>
      )}

      {result.totalPages > 1 && (
        <nav className="flex justify-center gap-2" aria-label="Pages">
          {Array.from({ length: result.totalPages }, (_, i) => (
            <Link
              key={i}
              href={{ pathname: "/", query: { ...(q && { q }), page: i } }}
              aria-current={i === page ? "page" : undefined}
              className="text-muted hover:bg-surface-2 aria-[current=page]:bg-ink aria-[current=page]:text-bg flex size-10 items-center justify-center rounded-full font-mono text-sm font-semibold"
            >
              {i + 1}
            </Link>
          ))}
        </nav>
      )}
    </section>
  );
}

export function BackendDown() {
  const t = useT();
  return <EmptyState icon={<ServerCrash className="size-6" />} title={t("home.backendDown")} />;
}
