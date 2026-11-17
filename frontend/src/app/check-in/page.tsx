"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useT } from "@/shared/i18n/use-t";
import { Button } from "@/shared/ui/button";
import { Field, Input } from "@/shared/ui/field";
import { Card, PageHeader } from "@/shared/ui/misc";

/** Staff enter the event id the organizer shared with them. */
export default function CheckInStartPage() {
  const t = useT();
  const router = useRouter();
  const [eventId, setEventId] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (eventId.trim()) router.push(`/check-in/${encodeURIComponent(eventId.trim())}`);
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <PageHeader kicker={t("nav.checkIn")} title={t("ci.title")} description={t("ci.startDesc")} />
      <Card>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Field label={t("gate.eventId")} htmlFor="eventId">
            <Input
              id="eventId"
              className="font-mono"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
            />
          </Field>
          <Button type="submit" size="lg" disabled={!eventId.trim()}>
            {t("ci.start")} <ArrowRight className="size-5" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
