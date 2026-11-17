"use client";

import { cn } from "@/shared/lib/cn";
import { useT } from "@/shared/i18n/use-t";

export function Spinner({ className }: { className?: string }) {
  const t = useT();
  return (
    <span
      role="status"
      aria-label={t("common.loading")}
      className={cn(
        "inline-block size-5 animate-spin rounded-full border-2 border-current border-r-transparent",
        className,
      )}
    />
  );
}

/** Three bouncing bars — an "equalizer" loader that fits the concert theme. */
export function PageSpinner() {
  const t = useT();
  return (
    <div role="status" aria-label={t("common.loading")} className="flex justify-center py-28">
      <div className="flex h-8 items-end gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="bg-accent w-1.5 animate-bounce rounded-full"
            style={{ height: `${14 + (i % 2) * 14}px`, animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>
    </div>
  );
}
