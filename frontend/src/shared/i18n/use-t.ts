"use client";

import { useCallback } from "react";
import { useMounted } from "@/shared/lib/use-mounted";
import { usePrefsStore, type Locale } from "@/shared/prefs/prefs-store";
import { en, type MessageKey } from "./en";
import { ko } from "./ko";

const MESSAGES: Record<Locale, Record<MessageKey, string>> = { en, ko };

export type Vars = Record<string, string | number>;
export type TFunction = (key: MessageKey | string, vars?: Vars) => string;

/** "Hi {name}" + { name: "Max" } → "Hi Max" */
function interpolate(text: string, vars?: Vars) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}

export function translate(locale: Locale, key: MessageKey | string, vars?: Vars): string {
  const table = MESSAGES[locale] as Record<string, string>;
  const text = table[key] ?? (en as Record<string, string>)[key] ?? key;
  return interpolate(text, vars);
}

/**
 * Current language. Server HTML and the first browser render always use English
 * (so they match); the saved choice is applied right after hydration.
 */
export function useLocale(): Locale {
  const mounted = useMounted();
  const locale = usePrefsStore((s) => s.locale);
  return mounted ? locale : "en";
}

/** const t = useT(); t("buy.left", { n: 3 }) → "3 left" / "3석 남음" */
export function useT(): TFunction {
  const locale = useLocale();
  return useCallback((key, vars) => translate(locale, key, vars), [locale]);
}
