"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useT } from "@/shared/i18n/use-t";
import { Button } from "./button";

export function Pager({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const t = useT();
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3">
      <Button variant="outline" size="sm" disabled={page === 0} onClick={() => onChange(page - 1)}>
        <ArrowLeft className="size-4" /> {t("common.prev")}
      </Button>
      <span className="text-muted font-mono text-sm tabular-nums">
        {page + 1} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
      >
        {t("common.next")} <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
