"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Ticket } from "lucide-react";
import { myQueries } from "@/entities/ticket/api";
import { TicketCard } from "@/features/ticket/ticket-card";
import { errorMessage } from "@/shared/api/errors";
import { useT } from "@/shared/i18n/use-t";
import { ButtonLink } from "@/shared/ui/button";
import { EmptyState, ErrorBox, PageHeader } from "@/shared/ui/misc";
import { Pager } from "@/shared/ui/pager";
import { PageSpinner } from "@/shared/ui/spinner";

export function MyTicketsView() {
  const t = useT();
  const [page, setPage] = useState(0);
  const { data, error, isPending } = useQuery({
    ...myQueries.tickets(page),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <PageHeader title={t("my.tickets")} />
      {isPending ? (
        <PageSpinner />
      ) : error ? (
        <ErrorBox message={errorMessage(error, t)} />
      ) : data.content.length === 0 ? (
        <EmptyState
          icon={<Ticket className="size-6" />}
          title={t("my.noTickets")}
          description={t("my.noTicketsDesc")}
          action={<ButtonLink href="/">{t("my.browse")}</ButtonLink>}
        />
      ) : (
        <div className="flex flex-col gap-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.content.map((ticket, i) => (
              <TicketCard key={ticket.id} ticket={ticket} index={i} />
            ))}
          </div>
          <Pager page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </div>
      )}
    </>
  );
}
