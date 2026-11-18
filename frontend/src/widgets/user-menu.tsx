"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Receipt,
  ScanLine,
  Ticket,
  UserRound,
} from "lucide-react";
import { meQueries } from "@/entities/user/api";
import { Avatar } from "@/shared/ui/avatar";
import { useLogout } from "@/features/auth/use-logout";
import { useT } from "@/shared/i18n/use-t";
import type { TokenClaims } from "@/shared/session/session-store";

/**
 * Avatar button + dropdown, like on any real site.
 * Name comes from /users/me (fresh after renaming), with the token as a fallback.
 */
export function UserMenu({ claims }: { claims: TokenClaims }) {
  const t = useT();
  const logout = useLogout();
  const { data: me } = useQuery(meQueries.profile());
  const name = me?.name ?? claims.name;
  const roles = me?.roles ?? claims.roles;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = [
    { href: "/my/tickets", label: t("nav.myTickets"), Icon: Ticket, show: true },
    { href: "/my/orders", label: t("nav.orders"), Icon: Receipt, show: true },
    {
      href: "/organizer",
      label: t("nav.manage"),
      Icon: LayoutDashboard,
      show: roles.includes("ORGANIZER"),
    },
    {
      href: "/check-in",
      label: t("nav.checkIn"),
      Icon: ScanLine,
      show: roles.includes("STAFF") || roles.includes("ORGANIZER"),
    },
    { href: "/account", label: t("nav.account"), Icon: UserRound, show: true },
  ].filter((i) => i.show);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t("nav.userMenu")}
        className="border-line bg-surface hover:border-ink/40 flex items-center gap-2 rounded-full border py-1 pr-2.5 pl-1 transition"
      >
        <Avatar name={name} />
        <span className="text-ink hidden max-w-32 truncate text-sm font-semibold lg:inline">
          {name}
        </span>
        <ChevronDown
          className={`text-muted size-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="border-line bg-surface animate-pop absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-2xl border shadow-2xl"
        >
          <div className="border-line flex items-center gap-3 border-b p-4">
            <Avatar name={name} size="lg" />
            <div className="min-w-0">
              <p className="text-ink truncate font-bold">{name}</p>
              <p className="text-muted truncate text-xs">{me?.email ?? claims.email}</p>
            </div>
          </div>
          <div className="p-1.5">
            {items.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="text-ink hover:bg-surface-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium"
              >
                <Icon className="text-muted size-4" /> {label}
              </Link>
            ))}
          </div>
          <div className="border-line border-t p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="text-danger hover:bg-danger-soft flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold"
            >
              <LogOut className="size-4" /> {t("nav.logout")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
