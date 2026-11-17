"use client";

import { useState } from "react";
import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronRight, Receipt } from "lucide-react";
import { Poster } from "@/entities/event/ui";
import { myQueries } from "@/entities/ticket/api";
import { OrderStatusBadge } from "@/entities/ticket/ui";
import { errorMessage } from "@/shared/api/errors";
import { useFormat } from "@/shared/i18n/use-format";
import { useT } from "@/shared/i18n/use-t";
import { EmptyState, ErrorBox, PageHeader } from "@/shared/ui/misc";
import { Pager } from "@/shared/ui/pager";
import { PageSpinner } from "@/shared/ui/spinner";

export function MyOrdersView() {
  const t = useT();
  const f = useFormat();
  const [page, setPage] = useState(0);
  const { data, error, isPending } = useQuery({
    ...myQueries.orders(page),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <PageHeader title={t("my.orders")} />
      {isPending ? (
        <PageSpinner />
      ) : error ? (
        <ErrorBox message={errorMessage(error, t)} />
      ) : data.content.length === 0 ? (
        <EmptyState icon={<Receipt className="size-6" />} title={t("my.noOrders")} />
      ) : (
        <div className="flex flex-col gap-8">
          <ul className="flex flex-col gap-3">
            {data.content.map((order, i) => (
              <li key={order.id} className="animate-rise" style={{ animationDelay: `${i * 50}ms` }}>
                <Link
                  href={`/my/orders/${order.id}`}
                  className="group border-line bg-surface hover:border-ink/30 flex items-center gap-4 rounded-3xl border p-3 pr-5 transition"
                >
                  <Poster id={order.eventId} className="size-16 shrink-0 rounded-2xl" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                      <span className="text-muted text-xs">{f.dateTime(order.createdAt)}</span>
                    </div>
                    <p className="text-ink mt-1 truncate font-bold">{order.eventName}</p>
                  </div>
                  <span className="font-display text-ink text-xl font-bold tabular-nums">
                    {f.price(order.totalAmount)}
                  </span>
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
