"use client";

import { useT } from "@/shared/i18n/use-t";
import { PageHeader } from "@/shared/ui/misc";

export function CheckInHeader() {
  const t = useT();
  return <PageHeader kicker={t("nav.checkIn")} title={t("ci.title")} description={t("ci.desc")} />;
}
