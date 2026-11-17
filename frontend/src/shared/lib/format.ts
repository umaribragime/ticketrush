import type { Locale } from "@/shared/prefs/prefs-store";

/** Events happen in Seoul, so dates are always shown in Korea time — for every visitor. */
const TIME_ZONE = "Asia/Seoul";

const cache = new Map<string, Intl.DateTimeFormat>();
function dtf(locale: Locale, options: Intl.DateTimeFormatOptions) {
  const key = locale + JSON.stringify(options);
  let f = cache.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
      timeZone: TIME_ZONE,
      ...options,
    });
    cache.set(key, f);
  }
  return f;
}

/** "Thu, Dec 24, 19:00 KST" / "12월 24일 (목) 19:00" */
export function formatDateTime(iso: string, locale: Locale = "en"): string {
  const date = new Date(iso);
  if (locale === "ko") {
    return dtf("ko", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  }
  return `${dtf("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)} KST`;
}

/** Parts for the big date block on event cards: { month: "DEC", day: "24", weekday: "THU" } */
export function dateParts(iso: string, locale: Locale = "en") {
  const date = new Date(iso);
  const tag = locale === "ko" ? "ko" : "en";
  return {
    month: dtf(tag, { month: locale === "ko" ? "long" : "short" })
      .format(date)
      .toUpperCase(),
    day: dtf(tag, { day: "numeric" }).format(date).replace(/\D/g, ""),
    weekday: dtf(tag, { weekday: "short" }).format(date).toUpperCase(),
  };
}

/** "₩165,000" / "165,000원" */
export function formatPrice(amount: number, locale: Locale = "en"): string {
  const n = new Intl.NumberFormat(locale === "ko" ? "ko-KR" : "en-US").format(amount);
  return locale === "ko" ? `${n}원` : `₩${n}`;
}

export function formatNumber(n: number, locale: Locale = "en"): string {
  return new Intl.NumberFormat(locale === "ko" ? "ko-KR" : "en-US").format(n);
}

/** ISO (UTC) → value for <input type="datetime-local"> in Korean time. */
export function toKstInput(iso: string): string {
  const kst = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 16);
}

/** <input type="datetime-local"> value (Korean time) → ISO UTC string for the API. */
export function fromKstInput(local: string): string {
  return new Date(`${local}:00+09:00`).toISOString();
}

export type SaleState = "UPCOMING" | "ON_SALE" | "CLOSED";

export function saleState(
  event: { salesStartAt: string; salesEndAt: string },
  now: number,
): SaleState {
  if (now < Date.parse(event.salesStartAt)) return "UPCOMING";
  if (now < Date.parse(event.salesEndAt)) return "ON_SALE";
  return "CLOSED";
}

/** A stable, unique "poster" gradient per event (we have no images, so we make art from the id). */
const POSTERS = [
  ["#5b3df5", "#ff4f2e"],
  ["#ff4f2e", "#ffb020"],
  ["#0ea5a4", "#5b3df5"],
  ["#d946ef", "#5b3df5"],
  ["#16131d", "#5b3df5"],
  ["#ff3d7f", "#ff8a3d"],
  ["#2563eb", "#22d3ee"],
  ["#7c3aed", "#ec4899"],
] as const;

export function posterColors(id: string): readonly [string, string] {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return POSTERS[h % POSTERS.length];
}
