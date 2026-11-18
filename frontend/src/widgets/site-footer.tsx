"use client";

import Link from "next/link";
import { useT } from "@/shared/i18n/use-t";
import { useSession } from "@/shared/session/use-session";
import { Logo } from "@/shared/ui/logo";

const YEAR = 2026;

export function SiteFooter() {
  const t = useT();
  const session = useSession();
  const authed = session.status === "authenticated";
  const isOrganizer = authed && session.hasRole("ORGANIZER");

  const columns = [
    {
      title: t("footer.explore"),
      links: [
        { href: "/", label: t("footer.allEvents") },
        { href: isOrganizer ? "/organizer" : "/signup", label: t("footer.sell") },
      ],
    },
    {
      title: t("footer.yourAccount"),
      links: authed
        ? [
            { href: "/my/tickets", label: t("nav.myTickets") },
            { href: "/my/orders", label: t("nav.orders") },
            { href: "/account", label: t("nav.account") },
          ]
        : [
            { href: "/login", label: t("nav.login") },
            { href: "/signup", label: t("nav.signup") },
          ],
    },
  ];

  return (
    <footer className="border-line bg-surface/60 mt-24 border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-[1.5fr_1fr_1fr] sm:px-6">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="text-muted max-w-xs text-sm">{t("footer.tagline")}</p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title} className="flex flex-col gap-3">
            <p className="text-ink text-xs font-bold tracking-wider uppercase">{col.title}</p>
            {col.links.map((l) => (
              <Link
                key={l.href + l.label}
                href={l.href}
                className="text-muted hover:text-ink w-fit text-sm"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="border-line border-t">
        <div className="text-muted mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs sm:flex-row sm:justify-between sm:px-6">
          <span>{t("footer.rights", { year: YEAR })}</span>
          <span>{t("footer.kst")}</span>
        </div>
      </div>
    </footer>
  );
}
