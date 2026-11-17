"use client";

import { useRouter } from "next/navigation";
import { useTransition, type FormEvent } from "react";
import { Search } from "lucide-react";
import { useT } from "@/shared/i18n/use-t";
import { cn } from "@/shared/lib/cn";

/** The search box is the only interactive part of the list, so only it is a Client Component. */
export function EventSearch({ defaultValue }: { defaultValue: string }) {
  const t = useT();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
    startTransition(() => router.push(q ? `/?q=${encodeURIComponent(q)}` : "/"));
  };

  return (
    <form onSubmit={onSubmit} role="search" className="relative w-full sm:w-80">
      <label htmlFor="q" className="sr-only">
        {t("home.search")}
      </label>
      <Search className="text-muted pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />
      <input
        id="q"
        name="q"
        type="search"
        placeholder={t("home.searchPlaceholder")}
        defaultValue={defaultValue}
        className={cn(
          "border-line bg-surface text-ink placeholder:text-muted/70 focus:border-accent focus:ring-accent/15 h-12 w-full rounded-full border pr-4 pl-11 text-[15px] transition outline-none focus:ring-4",
          isPending && "opacity-60",
        )}
      />
    </form>
  );
}
