"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Zap } from "lucide-react";
import { myKeys, orderApi } from "@/entities/ticket/api";
import { errorMessage } from "@/shared/api/errors";
import type { EventDetail, TicketType } from "@/shared/api/types";
import { useFormat } from "@/shared/i18n/use-format";
import { useT } from "@/shared/i18n/use-t";
import { cn } from "@/shared/lib/cn";
import { saleState } from "@/shared/lib/format";
import { countdownParts, useNow } from "@/shared/lib/use-now";
import { useSession } from "@/shared/session/use-session";
import { Button, ButtonLink } from "@/shared/ui/button";
import { ErrorBox } from "@/shared/ui/misc";
import {
  canIncrease,
  changeQuantity,
  MAX_TICKETS_PER_ORDER,
  toOrderItems,
  totalPrice,
  totalQuantity,
  type Quantities,
} from "./cart";

export function BuyPanel({ event, serverNow }: { event: EventDetail; serverNow: number }) {
  const t = useT();
  const f = useFormat();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const session = useSession();
  const now = useNow(serverNow);
  const [quantities, setQuantities] = useState<Quantities>({});

  const state = event.status === "CANCELLED" ? "CANCELLED" : saleState(event, now);
  const count = totalQuantity(quantities);
  const total = totalPrice(quantities, event.ticketTypes);

  const order = useMutation({
    mutationFn: () => orderApi.place({ eventId: event.id, items: toOrderItems(quantities) }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: myKeys.all });
      router.push(`/my/orders/${created.id}?new=1`);
    },
    // Sold out while we were choosing → reload stock from the server.
    onError: () => router.refresh(),
  });

  const label = {
    ON_SALE: count === 0 ? t("buy.choose") : t("buy.cta", { price: f.price(total) }),
    UPCOMING: t("buy.upcoming"),
    CLOSED: t("buy.closed"),
    CANCELLED: t("buy.cancelled"),
  }[state];

  return (
    <div className="border-line bg-surface overflow-hidden rounded-[2rem] border shadow-[0_30px_60px_-30px] shadow-black/25">
      <div className="flex items-center justify-between px-6 pt-6">
        <h2 className="font-display text-ink text-2xl font-bold">{t("buy.title")}</h2>
        <span className="text-muted text-xs font-semibold">
          {t("buy.max", { n: MAX_TICKETS_PER_ORDER })}
        </span>
      </div>

      {state === "UPCOMING" && <Countdown ms={Date.parse(event.salesStartAt) - now} />}

      <ul className="flex flex-col gap-2 p-4">
        {event.ticketTypes.map((type) => (
          <TicketTypeRow
            key={type.id}
            type={type}
            quantity={quantities[type.id] ?? 0}
            disabled={state !== "ON_SALE"}
            canAdd={canIncrease(quantities, type)}
            onChange={(delta) => setQuantities((q) => changeQuantity(q, type, delta))}
          />
        ))}
      </ul>

      <div className="bg-surface-2/60 flex flex-col gap-4 p-6">
        <div className="flex items-baseline justify-between">
          <span className="text-muted text-sm font-semibold">{t("buy.total", { n: count })}</span>
          <span className="font-display text-ink text-3xl font-bold tabular-nums">
            {f.price(total)}
          </span>
        </div>

        {order.isError && <ErrorBox message={errorMessage(order.error, t)} />}

        {state === "ON_SALE" && session.status === "anonymous" ? (
          <ButtonLink
            href={`/login?next=${encodeURIComponent(pathname)}`}
            variant="volt"
            size="lg"
            className="w-full"
          >
            {t("buy.loginCta")}
          </ButtonLink>
        ) : (
          <Button
            variant="volt"
            size="lg"
            fullWidth
            disabled={state !== "ON_SALE" || count === 0 || session.status !== "authenticated"}
            loading={order.isPending}
            onClick={() => order.mutate()}
          >
            {state === "ON_SALE" && count > 0 && <Zap className="size-5" />}
            {label}
          </Button>
        )}
      </div>
    </div>
  );
}

function Countdown({ ms }: { ms: number }) {
  const t = useT();
  const p = countdownParts(ms);
  const cells = [
    ...(p.days > 0 ? [{ v: String(p.days), l: t("buy.unit.d") }] : []),
    { v: p.h, l: t("buy.unit.h") },
    { v: p.m, l: t("buy.unit.m") },
    { v: p.s, l: t("buy.unit.s") },
  ];
  return (
    <div className="bg-hot mx-4 mt-4 rounded-2xl p-4 text-white">
      <p className="text-xs font-bold tracking-widest uppercase opacity-90">{t("buy.opensIn")}</p>
      <div className="mt-2 flex gap-2" role="timer" aria-live="off">
        {cells.map((c) => (
          <div key={c.l} className="flex-1 rounded-xl bg-black/15 py-2 text-center">
            <span className="font-display block text-3xl leading-none font-bold tabular-nums">
              {c.v}
            </span>
            <span className="text-[10px] font-bold opacity-80">{c.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TicketTypeRow({
  type,
  quantity,
  disabled,
  canAdd,
  onChange,
}: {
  type: TicketType;
  quantity: number;
  disabled: boolean;
  canAdd: boolean;
  onChange: (delta: 1 | -1) => void;
}) {
  const t = useT();
  const f = useFormat();
  const soldOut = type.remaining === 0;
  const low = !soldOut && type.remaining <= 10;
  const pct = Math.round((type.remaining / type.totalAvailable) * 100);

  return (
    <li
      className={cn(
        "flex items-center justify-between gap-3 rounded-2xl border-2 p-4 transition-colors",
        quantity > 0 ? "border-accent bg-accent-soft/50" : "border-transparent",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className={cn("text-ink font-bold", soldOut && "text-muted line-through")}>
          {type.name}
        </p>
        <p className="text-muted text-sm">{f.price(type.price)}</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="bg-surface-2 h-1.5 w-20 overflow-hidden rounded-full">
            <div
              className={cn(
                "h-full rounded-full",
                soldOut ? "bg-muted" : low ? "bg-hot" : "bg-success",
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span
            className={cn(
              "text-xs font-bold",
              soldOut ? "text-danger" : low ? "text-hot" : "text-muted",
            )}
          >
            {soldOut ? t("buy.soldOut") : t("buy.left", { n: f.number(type.remaining) })}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <StepButton
          label={t("buy.remove", { name: type.name })}
          disabled={disabled || quantity === 0}
          onClick={() => onChange(-1)}
        >
          <Minus className="size-4" />
        </StepButton>
        <span
          className="font-display text-ink w-8 text-center text-xl font-bold tabular-nums"
          aria-live="polite"
        >
          {quantity}
        </span>
        <StepButton
          label={t("buy.add", { name: type.name })}
          disabled={disabled || !canAdd}
          onClick={() => onChange(1)}
          primary
        >
          <Plus className="size-4" />
        </StepButton>
      </div>
    </li>
  );
}

function StepButton({
  label,
  disabled,
  onClick,
  primary,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  primary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-10 items-center justify-center rounded-full transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-30",
        primary
          ? "bg-ink text-bg hover:opacity-85"
          : "border-line text-ink hover:bg-surface-2 border",
      )}
    >
      {children}
    </button>
  );
}
