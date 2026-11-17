import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("border-line bg-surface rounded-3xl border p-6 sm:p-7", className)}>
      {children}
    </div>
  );
}

export type Tone = "accent" | "hot" | "volt" | "success" | "danger" | "warn" | "neutral";

const TONES: Record<Tone, string> = {
  accent: "bg-accent-soft text-accent-ink",
  hot: "bg-hot-soft text-hot",
  volt: "bg-volt text-on-volt",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warn: "bg-warn-soft text-warn",
  neutral: "bg-surface-2 text-muted",
};

export function Badge({
  tone = "neutral",
  dot = false,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase",
        TONES[tone],
      )}
    >
      {dot && <span className="size-1.5 animate-pulse rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function PageHeader({
  kicker,
  title,
  description,
  action,
}: {
  kicker?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="animate-rise mb-10 flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        {kicker && (
          <p className="text-accent-ink mb-2 text-xs font-bold tracking-[0.2em] uppercase">
            {kicker}
          </p>
        )}
        <h1 className="font-display text-ink text-3xl font-bold tracking-tight sm:text-5xl">
          {title}
        </h1>
        {description && <p className="text-muted mt-3 text-base sm:text-lg">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="border-line animate-pop flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed px-6 py-16 text-center">
      {icon && (
        <div className="bg-accent-soft text-accent-ink mb-1 flex size-14 items-center justify-center rounded-2xl">
          {icon}
        </div>
      )}
      <p className="font-display text-ink text-xl font-bold">{title}</p>
      {description && <p className="text-muted text-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="bg-danger-soft text-danger rounded-2xl px-4 py-3 text-sm font-medium"
    >
      {message}
    </div>
  );
}
