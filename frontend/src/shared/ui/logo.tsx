"use client";

import Link from "next/link";
import { Ticket } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useT } from "@/shared/i18n/use-t";

/** Wordmark: a tilted volt ticket + "TicketRush". */
export function Logo({ className }: { className?: string }) {
  const t = useT();
  return (
    <Link
      href="/"
      className={cn("group flex shrink-0 items-center gap-2", className)}
      aria-label={t("a11y.home")}
    >
      <span className="bg-volt text-on-volt flex size-8 -rotate-12 items-center justify-center rounded-lg shadow-sm transition-transform group-hover:rotate-0">
        <Ticket className="size-4.5" strokeWidth={2.5} />
      </span>
      <span className="font-display text-ink text-lg font-bold tracking-tight">
        Ticket<span className="text-accent">Rush</span>
      </span>
    </Link>
  );
}
