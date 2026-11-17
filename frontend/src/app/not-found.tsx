"use client";

import { useT } from "@/shared/i18n/use-t";
import { ButtonLink } from "@/shared/ui/button";

export default function NotFound() {
  const t = useT();
  return (
    <div className="animate-pop flex flex-col items-center gap-4 py-16 text-center">
      <p className="font-display text-accent text-[9rem] leading-none font-bold tracking-tighter sm:text-[12rem]">
        4<span className="text-hot">0</span>4
      </p>
      <p className="font-display text-ink text-2xl font-bold">{t("notFound.title")}</p>
      <p className="text-muted">{t("notFound.desc")}</p>
      <ButtonLink href="/" className="mt-2">
        {t("common.home")}
      </ButtonLink>
    </div>
  );
}
