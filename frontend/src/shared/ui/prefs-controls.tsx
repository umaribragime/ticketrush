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

const THEME_ORDER: Theme[] = ["light", "dark", "system"];
const THEME_ICON = { light: Sun, dark: Moon, system: Monitor };

/** One button that cycles light → dark → system. */
export function ThemeToggle({ className }: { className?: string }) {
  const t = useT();
  const mounted = useMounted();
  const theme = usePrefsStore((s) => s.theme);
  const setTheme = usePrefsStore((s) => s.setTheme);
  const current: Theme = mounted ? theme : "system";
  const next = THEME_ORDER[(THEME_ORDER.indexOf(current) + 1) % THEME_ORDER.length];
  const Icon = THEME_ICON[current];
  const label = `${t("nav.theme")}: ${t(`nav.theme.${current}`)}`;

  return (
    <button
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
      className={cn(
        "border-line bg-surface text-ink hover:border-ink/40 flex size-9 items-center justify-center rounded-full border transition",
        className,
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}
