import { z } from "zod";
import type { EventDetail, EventInput } from "@/shared/api/types";
import { fromKstInput, toKstInput } from "@/shared/lib/format";

/** Messages are translation keys; <Field> shows them in the current language. */
const required = () => z.string().min(1, "v.required");

export const eventFormSchema = z
  .object({
    name: required().max(200),
    description: z.string().max(4000).optional(),
    venue: required().max(200),
    salesStartAt: required(),
    salesEndAt: required(),
    startAt: required(),
    endAt: required(),
    ticketTypes: z
      .array(
        z.object({
          name: required().max(100),
          price: z.number({ error: "v.number" }).min(0, "v.priceMin"),
          totalAvailable: z
            .number({ error: "v.number" })
            .int("v.int")
            .min(1, "v.qtyMin")
            .max(1_000_000),
        }),
      )
      .min(1, "v.ticketTypesMin")
      .max(20),
  })
  // Same rule as Event.java: salesStart < salesEnd <= start < end
  // (datetime-local strings in the same format compare correctly as text)
  .refine((v) => v.salesStartAt < v.salesEndAt, { path: ["salesEndAt"], message: "v.salesEnd" })
  .refine((v) => v.salesEndAt <= v.startAt, { path: ["startAt"], message: "v.start" })
  .refine((v) => v.startAt < v.endAt, { path: ["endAt"], message: "v.end" });

export type EventFormValues = z.infer<typeof eventFormSchema>;

export function toEventInput(v: EventFormValues): EventInput {
  return {
    name: v.name.trim(),
    description: v.description?.trim() || undefined,
    venue: v.venue.trim(),
    salesStartAt: fromKstInput(v.salesStartAt),
    salesEndAt: fromKstInput(v.salesEndAt),
    startAt: fromKstInput(v.startAt),
    endAt: fromKstInput(v.endAt),
    ticketTypes: v.ticketTypes.map((t) => ({ ...t, name: t.name.trim() })),
  };
}

export function toFormValues(e: EventDetail): EventFormValues {
  return {
    name: e.name,
    description: e.description ?? "",
    venue: e.venue,
    salesStartAt: toKstInput(e.salesStartAt),
    salesEndAt: toKstInput(e.salesEndAt),
    startAt: toKstInput(e.startAt),
    endAt: toKstInput(e.endAt),
    ticketTypes: e.ticketTypes.map((t) => ({
      name: t.name,
      price: t.price,
      totalAvailable: t.totalAvailable,
    })),
  };
}

export const EMPTY_EVENT_FORM: EventFormValues = {
  name: "",
  description: "",
  venue: "",
  salesStartAt: "",
  salesEndAt: "",
  startAt: "",
  endAt: "",
  ticketTypes: [{ name: "General", price: 99000, totalAvailable: 100 }],
};
