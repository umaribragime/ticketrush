"use client";

import { Sparkles } from "lucide-react";
import { useT } from "@/shared/i18n/use-t";

export function HomeHero() {
  const t = useT();
  const words = [t("home.marquee1"), t("home.marquee2"), t("home.marquee3"), t("home.marquee4")];

  return (
    <section className="flex flex-col gap-10">
      <div className="animate-rise max-w-4xl">
        <p className="border-line bg-surface text-ink mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold tracking-wider uppercase">
          <Sparkles className="text-accent size-3.5" />
          {t("home.kicker")}
        </p>
        <h1 className="font-display text-ink text-5xl leading-[0.95] font-bold tracking-tighter sm:text-7xl lg:text-8xl">
          {t("home.title1")}
          <br />
          <span className="relative inline-block">
            <span
              className="bg-volt absolute inset-x-[-0.1em] bottom-[0.08em] -z-10 h-[0.42em] -rotate-1 rounded-sm"
              aria-hidden
            />
            <span className="text-accent dark:text-ink">{t("home.title2")}</span>
          </span>
        </h1>
        <p className="text-muted mt-6 max-w-xl text-lg sm:text-xl">{t("home.subtitle")}</p>
      </div>

      {/* Full-bleed ticker strip. Duplicated content + translateX(-50%) = seamless loop. */}
      <div className="relative left-1/2 w-screen -translate-x-1/2 -rotate-1 overflow-hidden">
        <div className="bg-ink text-bg flex py-3">
          <div className="animate-marquee flex shrink-0 gap-8 pr-8" aria-hidden>
            {[0, 1].map((copy) =>
              Array.from({ length: 4 }).flatMap((_, round) =>
                words.map((w, i) => (
                  <span
                    key={`${copy}-${round}-${i}`}
                    className="font-display flex items-center gap-8 text-lg font-bold tracking-tight whitespace-nowrap uppercase"
                  >
                    {w}
                    <span className="text-volt">✦</span>
                  </span>
                )),
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
