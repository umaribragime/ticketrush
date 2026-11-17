"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarClock, MapPin, Timer } from "lucide-react";
import type { EventStatus, EventSummary } from "@/shared/api/types";
import { useFormat } from "@/shared/i18n/use-format";
import { useT } from "@/shared/i18n/use-t";
import { cn } from "@/shared/lib/cn";
import { posterColors, saleState, type SaleState } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/misc";

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const t = useT();
  const tone = status === "PUBLISHED" ? "success" : status === "CANCELLED" ? "danger" : "neutral";
  return <Badge tone={tone}>{t(`event.status.${status}`)}</Badge>;
}

export function SaleStateBadge({ state }: { state: SaleState }) {
  const t = useT();
  if (state === "ON_SALE")
    return (
      <Badge tone="volt" dot>
        {t("event.sale.ON_SALE")}
      </Badge>
    );
  if (state === "UPCOMING") return <Badge tone="hot">{t("event.sale.UPCOMING")}</Badge>;
  return <Badge tone="neutral">{t("event.sale.CLOSED")}</Badge>;
}

/**
 * Generated "poster" art: a gradient picked from the event id, plus soft shapes.
 * Every event gets its own look without needing image uploads.
 */
export function Poster({
  id,
  className,
  style,
  children,
}: {
  id: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const [from, to] = posterColors(id);
  return (
    <div
      className={cn("relative isolate overflow-hidden text-white", className)}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})`, ...style }}
    >
      <div
        className="absolute -top-16 -right-10 -z-10 size-48 rounded-full bg-white/15 blur-sm"
        aria-hidden
      />
      <div
        className="absolute -bottom-20 -left-8 -z-10 size-40 rounded-full bg-black/15"
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 opacity-25 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, rgba(255,255,255,.35) 0 2px, transparent 2px 14px)",
        }}
        aria-hidden
      />
      {children}
    </div>
  );
}

const POSTER_H = 168;

/** Event card shaped like a ticket stub: poster on top, notches at the tear line, details below. */
export function EventCard({
  event,
  now,
  index = 0,
}: {
  event: EventSummary;
  now: number;
  index?: number;
}) {
  const t = useT();
  const f = useFormat();
  const state = saleState(event, now);
  const d = f.dateParts(event.startAt);

  return (
    <Link
      href={`/events/${event.id}`}
      className="group animate-rise focus-visible:ring-accent/40 block rounded-3xl drop-shadow-[0_18px_30px_rgba(22,19,29,0.10)] transition-transform duration-300 hover:-translate-y-1.5 focus-visible:ring-4 focus-visible:outline-none dark:drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <article
        className="ticket-notch bg-surface flex h-full flex-col overflow-hidden rounded-3xl"
        style={{ "--notch-y": `${POSTER_H}px` } as CSSProperties}
      >
        <Poster
          id={event.id}
          className="flex flex-col justify-between p-5"
          style={{ height: POSTER_H }}
        >
          <div className="flex items-start justify-between">
            <div className="leading-none">
              <p className="text-xs font-bold tracking-widest opacity-80">
                {d.month} · {d.weekday}
              </p>
              <p className="font-display mt-1 text-6xl font-bold tracking-tighter">{d.day}</p>
            </div>
            {event.status === "CANCELLED" ? (
              <EventStatusBadge status="CANCELLED" />
            ) : (
              <SaleStateBadge state={state} />
            )}
          </div>
          <ArrowUpRight className="size-6 self-end opacity-70 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
        </Poster>

        <div className="border-line mx-5 border-t-2 border-dashed" />

        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="font-display text-ink group-hover:text-accent-ink text-xl leading-tight font-bold transition-colors">
            {event.name}
          </h3>
          <ul className="text-muted mt-auto flex flex-col gap-1.5 text-sm">
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </li>
            <li className="flex items-center gap-2">
              <CalendarClock className="size-4 shrink-0" />
              {f.dateTime(event.startAt)}
            </li>
            {state === "UPCOMING" && (
              <li className="text-hot flex items-center gap-2 font-semibold">
                <Timer className="size-4 shrink-0" />
                {t("event.opens")} · {f.dateTime(event.salesStartAt)}
              </li>
            )}
          </ul>
        </div>
      </article>
    </Link>
  );
}
