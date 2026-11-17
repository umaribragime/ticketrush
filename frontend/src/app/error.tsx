"use client";

import { Zap } from "lucide-react";
import { useT } from "@/shared/i18n/use-t";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/misc";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT();
  return (
    <EmptyState
      icon={<Zap className="size-6" />}
      title={t("error.title")}
      description={t("error.desc")}
      action={<Button onClick={reset}>{t("common.retry")}</Button>}
    />
  );
}
