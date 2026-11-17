import { describe, expect, it } from "vitest";
import { eventFormSchema, toEventInput, type EventFormValues } from "./schema";

const valid: EventFormValues = {
  name: "Rush Live",
  description: "",
  venue: "KSPO DOME",
  salesStartAt: "2026-12-01T20:00",
  salesEndAt: "2026-12-20T23:59",
  startAt: "2026-12-24T19:00",
  endAt: "2026-12-24T22:00",
  ticketTypes: [{ name: "VIP", price: 165000, totalAvailable: 100 }],
};

describe("eventFormSchema", () => {
  it("accepts a valid event", () => {
    expect(eventFormSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects sales that end before they start (same rule as the backend)", () => {
    const result = eventFormSchema.safeParse({ ...valid, salesEndAt: "2026-11-30T00:00" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["salesEndAt"]);
  });

  it("needs at least one ticket type", () => {
    expect(eventFormSchema.safeParse({ ...valid, ticketTypes: [] }).success).toBe(false);
  });

  it("converts Korean time to UTC for the API", () => {
    expect(toEventInput(valid).startAt).toBe("2026-12-24T10:00:00.000Z");
    expect(toEventInput(valid).description).toBeUndefined();
  });
});
