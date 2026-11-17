import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Locale = "en" | "ko";
export type Theme = "light" | "dark" | "system";

export const PREFS_STORAGE_KEY = "ticketrush-prefs";

/** UI preferences, saved in localStorage. English + system theme by default. */
interface PrefsState {
  locale: Locale;
  theme: Theme;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: Theme) => void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      locale: "en",
      theme: "system",
      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: PREFS_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ locale: s.locale, theme: s.theme }),
    },
  ),
);

/**
 * Runs in <head> BEFORE React loads, so the page never flashes white in dark mode.
 * Kept as a plain string because it must be inline and tiny.
 */
export const PREFS_INIT_SCRIPT = `(function(){try{var s=JSON.parse(localStorage.getItem("${PREFS_STORAGE_KEY}")||"{}").state||{};var t=s.theme||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);if(s.locale)document.documentElement.lang=s.locale;}catch(e){}})();`;
