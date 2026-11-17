"use client";

import { useState } from "react";
import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronRight, Plus, Rocket, Timer } from "lucide-react";
import { organizerEventQueries } from "@/entities/event/api";
import { EventStatusBadge, Poster } from "@/entities/event/ui";
import { errorMessage } from "@/shared/api/errors";
import { useFormat } from "@/shared/i18n/use-format";
import { useT } from "@/shared/i18n/use-t";
import { ButtonLink } from "@/shared/ui/button";
import { EmptyState, ErrorBox, PageHeader } from "@/shared/ui/misc";
import { Pager } from "@/shared/ui/pager";
import { PageSpinner } from "@/shared/ui/spinner";

export function OrganizerEventsView() {
  const t = useT();
  const f = useFormat();
  const [page, setPage] = useState(0);
  const { data, error, isPending } = useQuery({
    ...organizerEventQueries.list(page),
    placeholderData: keepPreviousData,
  });

  const newButton = (
    <ButtonLink href="/organizer/events/new" variant="volt">
      <Plus className="size-4" /> {t("org.new")}
    </ButtonLink>
  );

  return (
    <>
      <PageHeader
        kicker={t("nav.manage")}
        title={t("org.title")}
        description={t("org.subtitle")}
        action={newButton}
      />
      {isPending ? (
        <PageSpinner />
      ) : error ? (
        <ErrorBox message={errorMessage(error, t)} />
      ) : data.content.length === 0 ? (
        <EmptyState
          icon={<Rocket className="size-6" />}
          title={t("org.empty")}
          description={t("org.emptyDesc")}
          action={newButton}
        />
      ) : (
        <div className="flex flex-col gap-8">
          <ul className="flex flex-col gap-3">
            {data.content.map((e, i) => (
              <li key={e.id} className="animate-rise" style={{ animationDelay: `${i * 50}ms` }}>
                <Link
                  href={`/organizer/events/${e.id}`}
                  className="group border-line bg-surface hover:border-ink/30 flex items-center gap-4 rounded-3xl border p-3 pr-5 transition"
                >
                  <Poster
                    id={e.id}
                    className="flex size-16 shrink-0 items-center justify-center rounded-2xl"
                  >
                    <span className="font-display text-2xl font-bold">
                      {f.dateParts(e.startAt).day}
                    </span>
                  </Poster>
                  <div className="min-w-0 flex-1">
                    <EventStatusBadge status={e.status} />
                    <p className="text-ink mt-1 truncate text-lg font-bold">{e.name}</p>
                    <p className="text-muted flex flex-wrap gap-x-4 text-sm">
                      <span>{f.dateTime(e.startAt)}</span>
                      <span className="flex items-center gap-1">
                        <Timer className="size-3.5" /> {t("org.col.opens")}{" "}
                        {f.dateTime(e.salesStartAt)}
                      </span>
                    </p>
                  </div>
                  <ChevronRight className="text-muted size-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
          <Pager page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </div>
      )}
    </>
  );
}
