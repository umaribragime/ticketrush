"use client";

import { useEffect } from "react";
import { usePrefsStore } from "./prefs-store";

/** Keeps <html class="dark"> and <html lang> in sync with the user's choice (and the OS theme). */
export function PrefsSync() {
  const theme = usePrefsStore((s) => s.theme);
  const locale = usePrefsStore((s) => s.locale);

  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && media.matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
