"use client";

import type { ReactNode } from "react";
import { Ticket } from "lucide-react";
import { useT } from "@/shared/i18n/use-t";

/** Two-column frame for login/signup: a loud visual panel + the form. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const t = useT();
  return (
    <div className="border-line bg-surface animate-pop mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border lg:grid-cols-2">
      <div className="relative isolate hidden flex-col justify-between overflow-hidden bg-[linear-gradient(140deg,var(--accent),var(--hot))] p-10 text-white lg:flex">
        <div
          className="absolute -top-24 -right-24 -z-10 size-72 rounded-full bg-white/15"
          aria-hidden
        />
        <div
          className="absolute bottom-10 -left-16 -z-10 size-56 rounded-full bg-black/15"
          aria-hidden
        />

        {/* floating tickets */}
        <div className="relative h-56" aria-hidden>
          <FakeTicket
            className="absolute top-6 left-4 -rotate-12"
            code="A-17"
            admit={t("ticket.admit")}
          />
          <FakeTicket
            className="absolute top-20 left-36 rotate-6"
            code="VIP"
            volt
            admit={t("ticket.admit")}
          />
        </div>

        <div>
          <p className="font-display text-4xl leading-tight font-bold tracking-tight">
            {t("auth.sideTitle")}
          </p>
          <p className="mt-3 text-white/80">{t("auth.sideText")}</p>
        </div>
      </div>

      <div className="flex flex-col justify-center p-7 sm:p-12">
        <h1 className="font-display text-ink text-4xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted mt-2 mb-8">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

function FakeTicket({
  className,
  code,
  volt,
  admit,
}: {
  className?: string;
  code: string;
  volt?: boolean;
  admit: string;
}) {
  return (
    <div
      className={`${className} flex w-52 items-center gap-3 rounded-2xl p-4 shadow-2xl ${
        volt ? "bg-volt text-on-volt" : "bg-white text-[#16131d]"
      }`}
    >
      <Ticket className="size-8 shrink-0" />
      <div className="border-l-2 border-dashed border-current/30 pl-3">
        <p className="text-[10px] font-bold tracking-widest opacity-60">{admit}</p>
        <p className="font-display text-2xl font-bold">{code}</p>
      </div>
    </div>
  );
}
