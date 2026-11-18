"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarCheck,
  ChevronRight,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Receipt,
  ScanLine,
  Settings2,
  Ticket,
  UserRound,
} from "lucide-react";
import { meQueries } from "@/entities/user/api";
import { useLogout } from "@/features/auth/use-logout";
import { errorMessage } from "@/shared/api/errors";
import type { Role } from "@/shared/api/types";
import { useFormat } from "@/shared/i18n/use-format";
import { useT } from "@/shared/i18n/use-t";
import { Button } from "@/shared/ui/button";
import { Badge, Card, ErrorBox, PageHeader, type Tone } from "@/shared/ui/misc";
import { LocaleSwitch, ThemeSwitch } from "@/shared/ui/prefs-controls";
import { PageSpinner } from "@/shared/ui/spinner";
import { Avatar } from "@/shared/ui/avatar";
import { PasswordForm } from "./password-form";
import { ProfileForm } from "./profile-form";

const ROLE_TONE: Record<Role, Tone> = { ATTENDEE: "accent", ORGANIZER: "hot", STAFF: "success" };

export function AccountView() {
  const t = useT();
  const f = useFormat();
  const logout = useLogout();
  const { data: me, error, isPending } = useQuery(meQueries.profile());
  const { data: summary } = useQuery(meQueries.summary());

  if (isPending) return <PageSpinner />;
  if (error) return <ErrorBox message={errorMessage(error, t)} />;

  const isOrganizer = me.roles.includes("ORGANIZER");
  const isStaff = me.roles.includes("STAFF") || isOrganizer;

  const stats = [
    {
      label: t("account.stats.upcoming"),
      value: summary?.upcomingTicketCount,
      Icon: CalendarCheck,
      href: "/my/tickets",
    },
    {
      label: t("account.stats.tickets"),
      value: summary?.ticketCount,
      Icon: Ticket,
      href: "/my/tickets",
    },
    {
      label: t("account.stats.orders"),
      value: summary?.orderCount,
      Icon: Receipt,
      href: "/my/orders",
    },
    ...(isOrganizer
      ? [
          {
            label: t("account.stats.events"),
            value: summary?.organizedEventCount,
            Icon: LayoutDashboard,
            href: "/organizer",
          },
        ]
      : []),
  ];

  const shortcuts = [
    { href: "/my/tickets", label: t("nav.myTickets"), Icon: Ticket, show: true },
    { href: "/my/orders", label: t("nav.orders"), Icon: Receipt, show: true },
    { href: "/organizer", label: t("nav.manage"), Icon: LayoutDashboard, show: isOrganizer },
    { href: "/check-in", label: t("nav.checkIn"), Icon: ScanLine, show: isStaff },
  ].filter((s) => s.show);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader title={t("account.title")} description={t("account.subtitle")} />

      {/* identity */}
      <Card className="animate-rise flex flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar name={me.name} size="xl" />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-ink truncate text-3xl font-bold tracking-tight">
            {me.name}
          </h2>
          <p className="text-muted truncate">{me.email}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {[...me.roles].sort().map((r) => (
              <Badge key={r} tone={ROLE_TONE[r]}>
                {t(`account.role.${r}`)}
              </Badge>
            ))}
            <span className="text-muted text-xs">
              {t("account.memberSince", { date: f.date(me.createdAt) })}
            </span>
          </div>
        </div>
      </Card>

      {/* numbers */}
      <div
        className={`grid grid-cols-2 gap-4 ${stats.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
      >
        {stats.map(({ label, value, Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="border-line bg-surface hover:border-ink/30 group rounded-3xl border p-5 transition"
          >
            <Icon className="text-accent size-5" />
            <p className="font-display text-ink mt-3 text-3xl font-bold tabular-nums">
              {value === undefined ? "–" : f.number(value)}
            </p>
            <p className="text-muted text-sm font-medium">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-6">
          <Section
            icon={<UserRound />}
            title={t("account.profile")}
            description={t("account.profileDesc")}
          >
            <ProfileForm user={me} />
          </Section>
          <Section
            icon={<KeyRound />}
            title={t("account.security")}
            description={t("account.securityDesc")}
          >
            <PasswordForm />
          </Section>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="p-3 sm:p-3">
            <p className="text-muted px-3 pt-2 pb-1 text-xs font-bold tracking-wider uppercase">
              {t("account.quick")}
            </p>
            {shortcuts.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="text-ink hover:bg-surface-2 group flex items-center gap-3 rounded-2xl px-3 py-3 font-semibold"
              >
                <Icon className="text-muted size-5" />
                <span className="flex-1">{label}</span>
                <ChevronRight className="text-muted size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </Card>

          <Section icon={<Settings2 />} title={t("account.preferences")}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-ink/80 text-sm font-semibold">{t("account.language")}</span>
                <LocaleSwitch className="w-fit" />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-ink/80 text-sm font-semibold">{t("account.theme")}</span>
                <ThemeSwitch withLabels className="w-fit" />
              </div>
            </div>
          </Section>

          <Card className="flex flex-col gap-3">
            <p className="text-muted text-sm">{t("account.signOutDesc")}</p>
            <Button variant="danger" onClick={logout}>
              <LogOut className="size-4" /> {t("account.signOut")}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <span className="bg-accent-soft text-accent-ink flex size-10 shrink-0 items-center justify-center rounded-xl [&>svg]:size-5">
          {icon}
        </span>
        <div>
          <h2 className="font-display text-ink text-xl font-bold">{title}</h2>
          {description && <p className="text-muted text-sm">{description}</p>}
        </div>
      </div>
      {children}
    </Card>
  );
}
