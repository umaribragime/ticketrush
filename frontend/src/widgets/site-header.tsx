"use client";

import { Suspense, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useT } from "@/shared/i18n/use-t";
import { useSession } from "@/shared/session/use-session";
import { useSessionStore } from "@/shared/session/session-store";
import { buttonClass } from "@/shared/ui/button";
import { Logo } from "@/shared/ui/logo";
import { LocaleSwitch, ThemeSwitch } from "@/shared/ui/prefs-controls";

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
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useSessionStore((s) => s.logout);
  const [open, setOpen] = useState(false);

  const links: { href: string; label: string }[] = [{ href: "/", label: t("nav.events") }];
  if (session.status === "authenticated") {
    if (session.hasRole("ORGANIZER")) links.push({ href: "/organizer", label: t("nav.manage") });
    if (session.hasRole("STAFF") || session.hasRole("ORGANIZER"))
      links.push({ href: "/check-in", label: t("nav.checkIn") });
    links.push({ href: "/my/tickets", label: t("nav.myTickets") });
  }
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" || pathname.startsWith("/events") : pathname.startsWith(href);

  const handleLogout = () => {
    setOpen(false);
    logout();
    queryClient.clear(); // forget the previous user's cached data
    router.push("/");
  };

  const authArea =
    session.status === "authenticated" ? (
      <>
        <span className="text-muted hidden text-sm lg:inline">
          {t("nav.greeting", { name: session.user.name })}
        </span>
        <button onClick={handleLogout} className={buttonClass("outline", "sm")}>
          <LogOut className="size-4" />
          {t("nav.logout")}
        </button>
      </>
    ) : session.status === "anonymous" ? (
      <>
        <Link href="/login" onClick={() => setOpen(false)} className={buttonClass("ghost", "sm")}>
          {t("nav.login")}
        </Link>
        <Link
          href="/signup"
          onClick={() => setOpen(false)}
          className={buttonClass("primary", "sm")}
        >
          {t("nav.signup")}
        </Link>
      </>
    ) : (
      <span className="h-9 w-40" aria-hidden />
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
          {authArea}
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
          className="border-line bg-bg animate-rise absolute inset-x-0 top-16 border-b px-4 pt-3 pb-6 shadow-xl md:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label={t("a11y.main")}>
            {links.map((l) => (
              <NavLink
                key={l.href}
                href={l.href}
                active={isActive(l.href)}
                onClick={() => setOpen(false)}
                big
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="border-line mt-4 flex flex-col gap-4 border-t pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <LocaleSwitch />
              <ThemeSwitch withLabels />
            </div>
            <div className="flex items-center justify-end gap-2">{authArea}</div>
          </div>
        </div>
      )}
    </>
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
