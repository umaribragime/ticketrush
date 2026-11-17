"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { organizerEventApi, organizerEventKeys } from "@/entities/event/api";
import { EventForm } from "@/features/event-form/event-form";
import { EMPTY_EVENT_FORM, toEventInput } from "@/features/event-form/schema";
import { useT } from "@/shared/i18n/use-t";
import { PageHeader } from "@/shared/ui/misc";

export default function NewEventPage() {
  const t = useT();
  const router = useRouter();
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: organizerEventApi.create,
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: organizerEventKeys.all });
      router.push(`/organizer/events/${event.id}`);
    },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        kicker={t("nav.manage")}
        title={t("org.newTitle")}
        description={t("org.newSub")}
      />
      <EventForm
        defaultValues={EMPTY_EVENT_FORM}
        submitLabel={t("org.saveDraft")}
        onSubmit={(v) => create.mutate(toEventInput(v))}
        isSubmitting={create.isPending}
        submitError={create.error}
      />
    </div>
  );
}
