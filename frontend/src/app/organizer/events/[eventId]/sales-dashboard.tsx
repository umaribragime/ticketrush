"use client";

import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "lucide-react";
import { organizerEventQueries } from "@/entities/event/api";
import { errorMessage } from "@/shared/api/errors";
import { useFormat } from "@/shared/i18n/use-format";
import { useT } from "@/shared/i18n/use-t";
import { cn } from "@/shared/lib/cn";
import { Card, ErrorBox } from "@/shared/ui/misc";
import { Spinner } from "@/shared/ui/spinner";

/** Sales numbers from the backend's GROUP BY query. Refreshes every 10 seconds. */
export function SalesDashboard({ eventId }: { eventId: string }) {
  const t = useT();
  const f = useFormat();
  const { data, error, isPending, isFetching } = useQuery(organizerEventQueries.sales(eventId));

  if (isPending)
    return (
      <Card className="flex justify-center">
        <Spinner />
      </Card>
    );
  if (error) return <ErrorBox message={errorMessage(error, t)} />;

  const rate = data.totalCapacity ? Math.round((data.totalSold / data.totalCapacity) * 100) : 0;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-ink flex items-center gap-2 text-2xl font-bold">
          <Activity className="text-accent size-6" /> {t("sales.title")}
        </h2>
        <span className="text-muted flex items-center gap-2 text-xs font-semibold">
          <span className={cn("bg-success size-2 rounded-full", isFetching && "animate-ping")} />
          {t("sales.auto")}
        </span>
      </div>

      {/* bento grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label={t("sales.revenue")}
          value={f.price(data.totalRevenue)}
          className="bg-volt text-on-volt col-span-2 lg:col-span-1"
        />
        <Stat label={t("sales.sold")} value={f.number(data.totalSold)} />
        <Stat label={t("sales.checkedIn")} value={f.number(data.checkedIn)} />
        <div className="border-line bg-surface col-span-2 flex items-center gap-4 rounded-3xl border p-5 lg:col-span-1">
          <Ring percent={rate} />
          <div>
            <p className="text-muted text-xs font-bold tracking-wider uppercase">
              {t("sales.rate")}
            </p>
            <p className="text-muted text-sm">
              {f.number(data.totalSold)} / {f.number(data.totalCapacity)}
            </p>
          </div>
        </div>
      </div>

      <Card className="flex flex-col gap-5">
        {data.ticketTypes.map((tt) => {
          const r = Math.round((tt.sold / tt.totalAvailable) * 100);
          return (
            <div key={tt.ticketTypeId} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <span className="text-ink font-bold">
                  {tt.name} <span className="text-muted font-normal">{f.price(tt.price)}</span>
                </span>
                <span className="text-muted font-mono tabular-nums">
                  {t("sales.row", {
                    sold: f.number(tt.sold),
                    total: f.number(tt.totalAvailable),
                    rate: r,
                  })}
                </span>
              </div>
              <div
                className="bg-surface-2 h-3 overflow-hidden rounded-full"
                role="progressbar"
                aria-valuenow={r}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t("sales.rateAria", { name: tt.name })}
              >
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--hot))] transition-all duration-700"
                  style={{ width: `${r}%` }}
                />
              </div>
            </div>
          );
        })}
      </Card>
    </section>
  );
}

function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-line bg-surface text-ink rounded-3xl border p-5", className)}>
      <p className="text-xs font-bold tracking-wider uppercase opacity-70">{label}</p>
      <p className="font-display mt-2 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
    </div>
  );
}

/** Small SVG donut for the sell-through %. */
function Ring({ percent }: { percent: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 64 64" className="size-16 shrink-0 -rotate-90" aria-hidden>
      <circle cx="32" cy="32" r={r} fill="none" strokeWidth="8" className="stroke-surface-2" />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        className="stroke-accent transition-all duration-700"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - Math.min(percent, 100) / 100)}
      />
      <text
        x="32"
        y="32"
        className="fill-ink font-display text-[15px] font-bold"
        textAnchor="middle"
        dominantBaseline="central"
        transform="rotate(90 32 32)"
      >
        {percent}%
      </text>
    </svg>
  );
}
