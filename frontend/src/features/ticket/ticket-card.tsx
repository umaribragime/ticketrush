"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MapPin, QrCode } from "lucide-react";
import { Poster } from "@/entities/event/ui";
import { myQueries } from "@/entities/ticket/api";
import { TicketStatusBadge } from "@/entities/ticket/ui";
import type { Ticket } from "@/shared/api/types";
import { useFormat } from "@/shared/i18n/use-format";
import { useT } from "@/shared/i18n/use-t";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

const POSTER_H = 150;

/** A mobile ticket: poster stub on top, tear line with notches, QR loaded only when opened. */
export function TicketCard({ ticket, index = 0 }: { ticket: Ticket; index?: number }) {
  const t = useT();
  const f = useFormat();
  const [showQr, setShowQr] = useState(false);
  const usable = ticket.status === "ACTIVE";
  const d = f.dateParts(ticket.eventStartAt);

  return (
    <div
      className="animate-rise drop-shadow-[0_18px_30px_rgba(22,19,29,0.10)] dark:drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <article
        className="ticket-notch bg-surface overflow-hidden rounded-3xl"
        style={{ "--notch-y": `${POSTER_H}px` } as CSSProperties}
      >
        <Poster
          id={ticket.eventId}
          className={`flex flex-col justify-between p-5 ${usable ? "" : "grayscale"}`}
          style={{ height: POSTER_H }}
        >
          <div className="flex items-start justify-between gap-3">
            <Link
              href={`/events/${ticket.eventId}`}
              className="font-display text-2xl leading-tight font-bold hover:underline"
            >
              {ticket.eventName}
            </Link>
            <div className="shrink-0 text-right leading-none">
              <p className="font-display text-4xl font-bold">{d.day}</p>
              <p className="text-[10px] font-bold tracking-widest opacity-80">{d.month}</p>
            </div>
          </div>
          <p className="flex items-center gap-1.5 text-sm opacity-90">
            <MapPin className="size-3.5" /> {ticket.venue}
          </p>
        </Poster>

        <div className="border-line mx-5 border-t-2 border-dashed" />

        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-muted text-[10px] font-bold tracking-[0.2em]">
                {t("ticket.admit")}
              </p>
              <p className="font-display text-ink text-3xl font-bold">{ticket.ticketTypeName}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <TicketStatusBadge status={ticket.status} />
              <span className="text-muted text-sm">{f.price(ticket.price)}</span>
            </div>
          </div>
          <p className="text-muted text-sm">{f.dateTime(ticket.eventStartAt)}</p>

          {showQr && <QrImage ticketId={ticket.id} dimmed={!usable} />}

          <Button
            variant={showQr ? "outline" : "secondary"}
            fullWidth
            disabled={!usable && !showQr}
            onClick={() => setShowQr((s) => !s)}
            aria-expanded={showQr}
          >
            <QrCode className="size-4" />
            {!usable ? t("ticket.unusable") : showQr ? t("ticket.hideQr") : t("ticket.showQr")}
          </Button>
        </div>
      </article>
    </div>
  );
}

function QrImage({ ticketId, dimmed }: { ticketId: string; dimmed: boolean }) {
  const t = useT();
  const { data: url, isPending, isError } = useQuery(myQueries.ticketQr(ticketId));

  if (isError) return <p className="text-danger text-center text-sm">{t("ticket.qrError")}</p>;
  return (
    <div className="animate-pop flex justify-center rounded-2xl bg-white p-4">
      {isPending ? (
        <Spinner className="my-20 size-8 text-[#5b3df5]" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- data: URL, next/image cannot optimize it
        <img
          src={url}
          alt={t("ticket.qrAlt")}
          width={208}
          height={208}
          className={dimmed ? "opacity-30 grayscale" : undefined}
        />
      )}
    </div>
  );
}
