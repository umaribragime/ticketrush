"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/shared/i18n/use-t";

export function MyTabs() {
  const t = useT();
  const pathname = usePathname();
  const tabs = [
    { href: "/my/tickets", label: t("my.tickets") },
    { href: "/my/orders", label: t("my.orders") },
  ];
  return (
    <nav
      className="border-line bg-surface mb-10 inline-flex rounded-full border p-1"
      aria-label="My page"
    >
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className="text-muted hover:text-ink aria-[current=page]:bg-ink aria-[current=page]:text-bg rounded-full px-5 py-2 text-sm font-bold transition-colors"
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
