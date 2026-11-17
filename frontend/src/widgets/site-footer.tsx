"use client";

import { useT } from "@/shared/i18n/use-t";
import { Logo } from "@/shared/ui/logo";

export function SiteFooter() {
  const t = useT();
  return (
    <footer className="border-line mt-24 border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="text-muted max-w-xs text-sm">{t("footer.tagline")}</p>
        </div>
        <p className="text-muted text-xs">{t("footer.stack")}</p>
      </div>
    </footer>
  );
}
