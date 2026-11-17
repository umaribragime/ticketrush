"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, Check, Copy, ExternalLink, Pencil, Rocket, ScanLine } from "lucide-react";
import { organizerEventApi, organizerEventKeys, organizerEventQueries } from "@/entities/event/api";
import { EventStatusBadge, Poster } from "@/entities/event/ui";
import { errorMessage } from "@/shared/api/errors";
import type { EventDetail } from "@/shared/api/types";
import { useFormat } from "@/shared/i18n/use-format";
import { useT } from "@/shared/i18n/use-t";
import { Button, ButtonLink } from "@/shared/ui/button";
import { Card, ErrorBox } from "@/shared/ui/misc";
import { PageSpinner } from "@/shared/ui/spinner";
import { SalesDashboard } from "./sales-dashboard";
import { StaffForm } from "./staff-form";

export function ManageEventView({ eventId }: { eventId: string }) {
  const t = useT();
  const f = useFormat();
  const { data: event, error, isPending } = useQuery(organizerEventQueries.detail(eventId));

  if (isPending) return <PageSpinner />;
  if (error) return <ErrorBox message={errorMessage(error, t)} />;

  return (
    <div className="flex flex-col gap-6">
      <Poster id={event.id} className="animate-rise rounded-[2rem] p-7 sm:p-9">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3">
            <EventStatusBadge status={event.status} />
            <h1 className="font-display text-4xl leading-none font-bold tracking-tighter sm:text-5xl">
              {event.name}
            </h1>
            <p className="opacity-90">
              {event.venue} · {f.dateTime(event.startAt)}
            </p>
            <p className="text-sm opacity-80">
              {t("event.opens")} {f.dateTime(event.salesStartAt)} → {t("event.salesEnd")}{" "}
              {f.dateTime(event.salesEndAt)}
            </p>
          </div>
          <StatusActions event={event} />
        </div>
      </Poster>

      <SalesDashboard eventId={event.id} />

      <div className="grid gap-6 md:grid-cols-2">
        <StaffForm eventId={event.id} />
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="bg-hot-soft text-hot flex size-10 items-center justify-center rounded-xl">
              <ScanLine className="size-5" />
            </span>
            <h2 className="font-display text-ink text-xl font-bold">{t("gate.cardTitle")}</h2>
          </div>
          <p className="text-muted text-sm">{t("gate.cardDesc")}</p>
          <CopyEventId eventId={event.id} />
          <ButtonLink href={`/check-in/${event.id}`} variant="outline" className="mt-auto">
            <ScanLine className="size-4" /> {t("gate.open")}
          </ButtonLink>
        </Card>
      </div>
    </div>
  );
}

function StatusActions({ event }: { event: EventDetail }) {
  const t = useT();
  const queryClient = useQueryClient();
  const onSuccess = (updated: EventDetail) => {
    queryClient.setQueryData(organizerEventKeys.detail(event.id), updated);
    queryClient.invalidateQueries({ queryKey: organizerEventKeys.all });
  };
  const publish = useMutation({ mutationFn: () => organizerEventApi.publish(event.id), onSuccess });
  const cancel = useMutation({ mutationFn: () => organizerEventApi.cancel(event.id), onSuccess });
  const actionError = publish.error ?? cancel.error;

  return (
    <div className="flex flex-col gap-2 lg:items-end">
      <div className="flex flex-wrap gap-2">
        {event.status !== "DRAFT" && (
          <ButtonLink href={`/events/${event.id}`} variant="secondary" size="sm">
            <ExternalLink className="size-4" /> {t("manage.viewPage")}
          </ButtonLink>
        )}
        {event.status === "DRAFT" && (
          <>
            <ButtonLink href={`/organizer/events/${event.id}/edit`} variant="secondary" size="sm">
              <Pencil className="size-4" /> {t("manage.edit")}
            </ButtonLink>
            <Button
              variant="volt"
              size="sm"
              loading={publish.isPending}
              onClick={() => {
                if (confirm(t("manage.confirmPublish"))) publish.mutate();
              }}
            >
              <Rocket className="size-4" /> {t("manage.publish")}
            </Button>
          </>
        )}
        {event.status !== "CANCELLED" && (
          <Button
            variant="secondary"
            size="sm"
            loading={cancel.isPending}
            onClick={() => {
              if (confirm(t("manage.confirmCancel"))) cancel.mutate();
            }}
          >
            <Ban className="size-4" /> {t("manage.cancel")}
          </Button>
        )}
      </div>
      {actionError && <ErrorBox message={errorMessage(actionError, t)} />}
    </div>
  );
}

/** Staff type this id on the check-in start page. */
function CopyEventId({ eventId }: { eventId: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  return (
    <div className="bg-surface-2 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm">
      <span className="text-muted shrink-0 text-xs font-bold tracking-wider uppercase">
        {t("gate.eventId")}
      </span>
      <code className="text-ink flex-1 truncate font-mono">{eventId}</code>
      <button
        type="button"
        className="text-accent-ink flex shrink-0 items-center gap-1 font-bold hover:underline"
        onClick={async () => {
          await navigator.clipboard.writeText(eventId);
          setCopied(true);
        }}
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? t("common.copied") : t("common.copy")}
      </button>
    </div>
  );
}
