import { describe, expect, it } from "vitest";
import {
  dateParts,
  formatDate,
  formatDateTime,
  formatPrice,
  fromKstInput,
  posterColors,
  saleState,
  toKstInput,
} from "./format";
import { countdownParts } from "./use-now";

describe("format", () => {
  it("formats prices per language", () => {
    expect(formatPrice(165000, "en")).toBe("₩165,000");
    expect(formatPrice(165000, "ko")).toBe("165,000원");
  });

  it("formats date-times the same way everywhere (no Intl → no hydration mismatch)", () => {
    expect(formatDateTime("2026-12-24T10:00:00Z", "en")).toBe("Thu, Dec 24, 2026 · 19:00 KST");
    expect(formatDateTime("2026-12-24T10:00:00Z", "ko")).toBe("2026년 12월 24일 (목) 19:00");
    expect(formatDate("2026-11-17T15:30:00Z", "en")).toBe("Nov 18, 2026"); // already the 18th in Seoul
    expect(formatDateTime("2026-12-31T15:00:00Z", "en")).toBe("Fri, Jan 1, 2027 · 00:00 KST"); // never "24:00"
  });

  it("shows dates in Korea time for everyone", () => {
    // 15:30 UTC = 00:30 the next day in Seoul
    expect(dateParts("2026-12-24T15:30:00Z", "en")).toEqual({
      month: "DEC",
      day: "25",
      weekday: "FRI",
    });
  });

  it("converts between KST input and UTC ISO", () => {
    expect(fromKstInput("2026-12-24T19:00")).toBe("2026-12-24T10:00:00.000Z");
    expect(toKstInput("2026-12-24T10:00:00Z")).toBe("2026-12-24T19:00");
  });

  it("knows the sale state", () => {
    const event = { salesStartAt: "2026-12-01T00:00:00Z", salesEndAt: "2026-12-10T00:00:00Z" };
    expect(saleState(event, Date.parse("2026-11-30T23:59:59Z"))).toBe("UPCOMING");
    expect(saleState(event, Date.parse("2026-12-01T00:00:00Z"))).toBe("ON_SALE");
    expect(saleState(event, Date.parse("2026-12-10T00:00:00Z"))).toBe("CLOSED");
  });

  it("splits a countdown and never goes negative", () => {
    expect(countdownParts(90_061_000)).toEqual({ days: 1, h: "01", m: "01", s: "01" });
    expect(countdownParts(-5)).toEqual({ days: 0, h: "00", m: "00", s: "00" });
  });

  it("gives each event a stable poster", () => {
    expect(posterColors("abc")).toBe(posterColors("abc"));
  });
});
