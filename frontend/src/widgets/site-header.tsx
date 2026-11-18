"use client";

import { Suspense, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Menu, X } from "lucide-react";
import { meQueries } from "@/entities/user/api";
import { useLogout } from "@/features/auth/use-logout";
import { cn } from "@/shared/lib/cn";
import { useT } from "@/shared/i18n/use-t";
import { useSession } from "@/shared/session/use-session";
import { buttonClass } from "@/shared/ui/button";
import { Logo } from "@/shared/ui/logo";
import { LocaleSwitch, ThemeSwitch } from "@/shared/ui/prefs-controls";
import { Avatar } from "@/shared/ui/avatar";
import { UserMenu } from "./user-menu";

export function SiteHeader() {
  return (
    <header className="border-line/70 bg-bg/75 sticky top-0 z-30 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Logo />
        {/* usePathname() is runtime URL data → keep it inside Suspense */}
        <Suspense fallback={<div className="flex-1" />}>
          <Nav />
        </Suspense>
      </div>
    </header>
  );
}

function Nav() {
  const t = useT();
  const session = useSession();
  const pathname = usePathname();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const authed = session.status === "authenticated";

  // main links (top bar); personal pages live in the user menu
  const links: { href: string; label: string }[] = [{ href: "/", label: t("nav.events") }];
  if (authed) {
    links.push({ href: "/my/tickets", label: t("nav.myTickets") });
    if (session.hasRole("ORGANIZER")) links.push({ href: "/organizer", label: t("nav.manage") });
    if (session.hasRole("STAFF") || session.hasRole("ORGANIZER"))
      links.push({ href: "/check-in", label: t("nav.checkIn") });
  }
  // the mobile panel also lists the personal pages
  const mobileLinks = authed
    ? [
        ...links,
        { href: "/my/orders", label: t("nav.orders") },
        { href: "/account", label: t("nav.account") },
      ]
    : links;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" || pathname.startsWith("/events") : pathname.startsWith(href);
  const close = () => setOpen(false);

  const guestButtons = (
    <>
      <Link href="/login" onClick={close} className={buttonClass("ghost", "sm")}>
        {t("nav.login")}
      </Link>
      <Link href="/signup" onClick={close} className={buttonClass("primary", "sm")}>
        {t("nav.signup")}
      </Link>
    </>
  );

  return (
    <>
      {/* desktop */}
      <nav className="hidden flex-1 items-center gap-1 md:flex" aria-label={t("a11y.main")}>
        <div className="ml-6 flex flex-1 items-center gap-1">
          {links.map((l) => (
            <NavLink key={l.href} href={l.href} active={isActive(l.href)}>
              {l.label}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <LocaleSwitch />
          <ThemeSwitch />
          {authed ? (
            <UserMenu claims={session.user} />
          ) : session.status === "anonymous" ? (
            guestButtons
          ) : (
            <span className="h-9 w-40" aria-hidden />
          )}
        </div>
      </nav>

      {/* mobile */}
      <div className="ml-auto flex items-center gap-2 md:hidden">
        <ThemeSwitch />
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={t("a11y.menu")}
          className="border-line bg-surface flex size-9 items-center justify-center rounded-full border"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>
      {open && (
        <div
          id="mobile-menu"
          className="border-line bg-bg animate-rise absolute inset-x-0 top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b px-4 pt-3 pb-6 shadow-xl md:hidden"
        >
          {authed && (
            <MobileUserCard fallbackName={session.user.name} fallbackEmail={session.user.email} />
          )}
          <nav className="flex flex-col gap-1" aria-label={t("a11y.main")}>
            {mobileLinks.map((l) => (
              <NavLink key={l.href} href={l.href} active={isActive(l.href)} onClick={close} big>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="border-line mt-4 flex flex-col gap-4 border-t pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <LocaleSwitch />
              <ThemeSwitch withLabels />
            </div>
            <div className="flex items-center justify-end gap-2">
              {authed ? (
                <button
                  onClick={() => {
                    close();
                    logout();
                  }}
                  className={buttonClass("outline", "sm", "text-danger")}
                >
                  <LogOut className="size-4" /> {t("nav.logout")}
                </button>
              ) : (
                guestButtons
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MobileUserCard({
  fallbackName,
  fallbackEmail,
}: {
  fallbackName: string;
  fallbackEmail: string;
}) {
  const { data: me } = useQuery(meQueries.profile());
  const name = me?.name ?? fallbackName;
  return (
    <div className="bg-surface border-line mb-3 flex items-center gap-3 rounded-2xl border p-3">
      <Avatar name={name} size="lg" />
      <div className="min-w-0">
        <p className="text-ink truncate font-bold">{name}</p>
        <p className="text-muted truncate text-xs">{me?.email ?? fallbackEmail}</p>
      </div>
    </div>
  );
}

function NavLink({
  href,
  active,
  onClick,
  big,
  children,
}: {
  href: string;
  active: boolean;
  onClick?: () => void;
  big?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-full px-4 font-semibold transition-colors",
        big ? "py-3 text-lg" : "py-2 text-sm",
        active ? "bg-ink text-bg" : "text-muted hover:bg-surface-2 hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}
