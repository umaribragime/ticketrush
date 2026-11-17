"use client";

import { useQuery } from "@tanstack/react-query";
import { PartyPopper } from "lucide-react";
import { myQueries } from "@/entities/ticket/api";
import { OrderStatusBadge } from "@/entities/ticket/ui";
import { TicketCard } from "@/features/ticket/ticket-card";
import { errorMessage } from "@/shared/api/errors";
import { useFormat } from "@/shared/i18n/use-format";
import { useT } from "@/shared/i18n/use-t";
import { ButtonLink } from "@/shared/ui/button";
import { Card, ErrorBox } from "@/shared/ui/misc";
import { PageSpinner } from "@/shared/ui/spinner";

export function OrderDetailView({
  orderId,
  justOrdered,
}: {
  orderId: string;
  justOrdered: boolean;
}) {
  const t = useT();
  const f = useFormat();
  const { data: order, error, isPending } = useQuery(myQueries.order(orderId));

  if (isPending) return <PageSpinner />;
  if (error) return <ErrorBox message={errorMessage(error, t)} />;

  return (
    <div className="flex flex-col gap-8">
      {justOrdered && (
        <div className="bg-volt text-on-volt animate-pop relative overflow-hidden rounded-[2rem] p-8 sm:p-10">
          <PartyPopper className="absolute -right-4 -bottom-6 size-40 opacity-15" aria-hidden />
          <p className="font-display text-5xl font-bold tracking-tighter sm:text-6xl">
            {t("order.success")}
          </p>
          <p className="mt-2 text-lg font-medium opacity-80">{t("order.successDesc")}</p>
        </div>
      )}

      <Card className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <span className="text-muted text-sm">
              {t("order.placedAt", { date: f.dateTime(order.createdAt) })}
            </span>
          </div>
          <h1 className="font-display text-ink text-3xl font-bold tracking-tight">
            {order.eventName}
          </h1>
          <p className="text-muted font-mono text-xs">
            {t("order.number")} {order.id}
          </p>
        </div>
        <div className="text-right">
          <p className="text-muted text-sm font-semibold">
            {t("order.count", { n: order.tickets.length })}
          </p>
          <p className="font-display text-ink text-4xl font-bold tabular-nums">
            {f.price(order.totalAmount)}
          </p>
        </div>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {order.tickets.map((ticket, i) => (
          <TicketCard key={ticket.id} ticket={ticket} index={i} />
        ))}
      </div>

      <ButtonLink href="/my/tickets" variant="outline" className="self-center">
        {t("order.allTickets")}
      </ButtonLink>
    </div>
  );
}
