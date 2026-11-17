"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarClock, Hourglass, MapPin, Timer } from "lucide-react";
import { EventStatusBadge, Poster, SaleStateBadge } from "@/entities/event/ui";
import { BuyPanel } from "@/features/order/buy-panel";
import type { EventDetail } from "@/shared/api/types";
import { useFormat } from "@/shared/i18n/use-format";
import { useT } from "@/shared/i18n/use-t";
import { saleState } from "@/shared/lib/format";

export function EventDetailView({ event, serverNow }: { event: EventDetail; serverNow: number }) {
  const t = useT();
  const f = useFormat();
  const d = f.dateParts(event.startAt);
  const minPrice = Math.min(...event.ticketTypes.map((tt) => tt.price));

  return (
    <div className="flex flex-col gap-10">
      <Link
        href="/"
        className="text-muted hover:text-ink inline-flex w-fit items-center gap-2 text-sm font-semibold"
      >
        <ArrowLeft className="size-4" /> {t("event.backToList")}
      </Link>

      <Poster id={event.id} className="animate-rise rounded-[2rem] p-7 sm:p-10">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {event.status === "CANCELLED" ? (
                <EventStatusBadge status="CANCELLED" />
              ) : (
                <SaleStateBadge state={saleState(event, serverNow)} />
              )}
            </div>
            <h1 className="font-display max-w-3xl text-4xl leading-[0.95] font-bold tracking-tighter sm:text-6xl">
              {event.name}
            </h1>
            <p className="flex items-center gap-2 text-base font-medium opacity-90">
              <MapPin className="size-4" /> {event.venue}
            </p>
          </div>
          <div className="shrink-0 rounded-2xl bg-black/20 px-5 py-4 text-center backdrop-blur-sm">
            <p className="text-xs font-bold tracking-widest opacity-80">{d.month}</p>
            <p className="font-display text-6xl leading-none font-bold">{d.day}</p>
            <p className="text-xs font-bold tracking-widest opacity-80">{d.weekday}</p>
          </div>
        </div>
      </Poster>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <article className="flex flex-col gap-8">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Info
              icon={<CalendarClock />}
              label={t("event.time")}
              value={f.dateTime(event.startAt)}
            />
            <Info icon={<MapPin />} label={t("event.venue")} value={event.venue} />
            <Info
              icon={<Timer />}
              label={t("event.opens")}
              value={f.dateTime(event.salesStartAt)}
              highlight
            />
            <Info
              icon={<Hourglass />}
              label={t("event.salesEnd")}
              value={f.dateTime(event.salesEndAt)}
            />
          </dl>

          {Number.isFinite(minPrice) && (
            <p className="font-display text-ink text-2xl font-bold">
              {t("event.from", { price: f.price(minPrice) })}
            </p>
          )}

          {event.description && (
            <section>
              <h2 className="font-display text-ink mb-3 text-2xl font-bold">{t("event.about")}</h2>
              <p className="text-muted text-lg leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </section>
          )}
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BuyPanel event={event} serverNow={serverNow} />
        </aside>
      </div>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
  highlight,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="border-line bg-surface flex items-start gap-3 rounded-2xl border p-4">
      <span
        className={
          highlight
            ? "bg-hot-soft text-hot flex size-10 shrink-0 items-center justify-center rounded-xl [&>svg]:size-5"
            : "bg-surface-2 text-ink flex size-10 shrink-0 items-center justify-center rounded-xl [&>svg]:size-5"
        }
      >
        {icon}
      </span>
      <div>
        <dt className="text-muted text-xs font-bold tracking-wider uppercase">{label}</dt>
        <dd
          className={highlight ? "text-hot mt-0.5 font-semibold" : "text-ink mt-0.5 font-semibold"}
        >
          {value}
        </dd>
      </div>
    </div>
  );
}
