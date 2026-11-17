"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useT } from "@/shared/i18n/use-t";
import { useMounted } from "@/shared/lib/use-mounted";
import { usePrefsStore, type Locale, type Theme } from "@/shared/prefs/prefs-store";

/** EN | KO switch. */
export function LocaleSwitch({ className }: { className?: string }) {
  const t = useT();
  const mounted = useMounted();
  const locale = usePrefsStore((s) => s.locale);
  const setLocale = usePrefsStore((s) => s.setLocale);
  const current = mounted ? locale : "en";
  const options: { value: Locale; label: string }[] = [
    { value: "en", label: "EN" },
    { value: "ko", label: "KO" },
  ];

  return (
    <div
      role="radiogroup"
      aria-label={t("nav.language")}
      className={cn("border-line bg-surface flex rounded-full border p-0.5", className)}
    >
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={current === o.value}
          onClick={() => setLocale(o.value)}
          className="text-muted aria-checked:bg-ink aria-checked:text-bg rounded-full px-2.5 py-1 text-xs font-bold transition-colors"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const THEMES: { value: Theme; Icon: typeof Sun }[] = [
  { value: "light", Icon: Sun },
  { value: "dark", Icon: Moon },
  { value: "system", Icon: Monitor },
];

/**
 * Light | Dark | System switch. Every option is visible, so it's obvious what it does.
 * `withLabels` shows the words too (used in the mobile menu).
 */
export function ThemeSwitch({
  className,
  withLabels = false,
}: {
  className?: string;
  withLabels?: boolean;
}) {
  const t = useT();
  const mounted = useMounted();
  const theme = usePrefsStore((s) => s.theme);
  const setTheme = usePrefsStore((s) => s.setTheme);
  const current: Theme = mounted ? theme : "system";

  return (
    <div
      role="radiogroup"
      aria-label={t("nav.theme")}
      className={cn("border-line bg-surface flex rounded-full border p-0.5", className)}
    >
      {THEMES.map(({ value, Icon }) => {
        const label = t(`nav.theme.${value}`);
        return (
          <button
            key={value}
            role="radio"
            aria-checked={current === value}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "text-muted hover:text-ink aria-checked:bg-ink aria-checked:text-bg flex items-center gap-1.5 rounded-full text-xs font-bold transition-colors",
              withLabels ? "px-3 py-1.5" : "size-7 justify-center",
            )}
          >
            <Icon className="size-3.5" />
            {withLabels && label}
          </button>
        );
      })}
    </div>
  );
}
