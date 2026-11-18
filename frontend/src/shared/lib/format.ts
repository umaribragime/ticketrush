import type { Locale } from "@/shared/prefs/prefs-store";

/**
 * Dates are always shown in Korea time (events happen in Seoul), and they are built by hand.
 *
 * Why not Intl.DateTimeFormat? Node.js (server) and each browser ship different ICU versions, so the
 * same call can give "Dec 24, 2026, 19:00" on the server and "Dec 24, 2026 at 19:00" in the browser.
 * That text difference breaks hydration. Korea has no daylight saving time, so UTC+9 is always right.
 */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

const EN_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const EN_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const KO_WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const pad = (n: number) => String(n).padStart(2, "0");

/** The wall-clock time in Seoul for an ISO instant. */
function kst(iso: string) {
  const d = new Date(new Date(iso).getTime() + KST_OFFSET_MS);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth(), // 0-11
    day: d.getUTCDate(),
    weekday: d.getUTCDay(), // 0 = Sunday
    hh: pad(d.getUTCHours()),
    mm: pad(d.getUTCMinutes()),
  };
}

/** "Thu, Dec 24, 2026 · 19:00 KST" / "2026년 12월 24일 (목) 19:00" */
export function formatDateTime(iso: string, locale: Locale = "en"): string {
  const k = kst(iso);
  if (locale === "ko") {
    return `${k.year}년 ${k.month + 1}월 ${k.day}일 (${KO_WEEKDAYS[k.weekday]}) ${k.hh}:${k.mm}`;
  }
  return `${EN_WEEKDAYS[k.weekday]}, ${EN_MONTHS[k.month]} ${k.day}, ${k.year} · ${k.hh}:${k.mm} KST`;
}

/** "Nov 18, 2026" / "2026년 11월 18일" */
export function formatDate(iso: string, locale: Locale = "en"): string {
  const k = kst(iso);
  return locale === "ko"
    ? `${k.year}년 ${k.month + 1}월 ${k.day}일`
    : `${EN_MONTHS[k.month]} ${k.day}, ${k.year}`;
}

/** Parts for the big date block on event cards: { month: "DEC", day: "24", weekday: "THU" } */
export function dateParts(iso: string, locale: Locale = "en") {
  const k = kst(iso);
  return locale === "ko"
    ? { month: `${k.month + 1}월`, day: String(k.day), weekday: KO_WEEKDAYS[k.weekday] }
    : {
        month: EN_MONTHS[k.month].toUpperCase(),
        day: String(k.day),
        weekday: EN_WEEKDAYS[k.weekday].toUpperCase(),
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
