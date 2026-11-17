"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { organizerEventApi, organizerEventKeys, organizerEventQueries } from "@/entities/event/api";
import { EventForm } from "@/features/event-form/event-form";
import { toEventInput, toFormValues } from "@/features/event-form/schema";
import { errorMessage } from "@/shared/api/errors";
import type { EventInput } from "@/shared/api/types";
import { useT } from "@/shared/i18n/use-t";
import { ButtonLink } from "@/shared/ui/button";
import { EmptyState, ErrorBox, PageHeader } from "@/shared/ui/misc";
import { PageSpinner } from "@/shared/ui/spinner";

export function EditEventView({ eventId }: { eventId: string }) {
  const t = useT();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: event, error, isPending } = useQuery(organizerEventQueries.detail(eventId));
  const update = useMutation({
    mutationFn: (input: EventInput) => organizerEventApi.update(eventId, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(organizerEventKeys.detail(eventId), updated);
      queryClient.invalidateQueries({ queryKey: organizerEventKeys.all });
      router.push(`/organizer/events/${eventId}`);
    },
  });

  if (isPending) return <PageSpinner />;
  if (error) return <ErrorBox message={errorMessage(error, t)} />;
  if (event.status !== "DRAFT") {
    return (
      <EmptyState
        icon={<Lock className="size-6" />}
        title={t("org.notEditable")}
        description={t("org.notEditableDesc")}
        action={<ButtonLink href={`/organizer/events/${eventId}`}>{t("common.back")}</ButtonLink>}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader kicker={t("nav.manage")} title={t("org.editTitle")} description={event.name} />
      <EventForm
        defaultValues={toFormValues(event)}
        submitLabel={t("common.save")}
        onSubmit={(v) => update.mutate(toEventInput(v))}
        isSubmitting={update.isPending}
        submitError={update.error}
      />
    </div>
  );
}
