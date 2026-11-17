"use client";

import { TicketX } from "lucide-react";
import { useT } from "@/shared/i18n/use-t";
import { ButtonLink } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/misc";

export default function EventNotFound() {
  const t = useT();
  return (
    <EmptyState
      icon={<TicketX className="size-6" />}
      title={t("event.notFound")}
      description={t("event.notFoundDesc")}
      action={<ButtonLink href="/">{t("event.backToList")}</ButtonLink>}
    />
  );
}
