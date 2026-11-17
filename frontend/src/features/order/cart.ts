import type { TicketType } from "@/shared/api/types";

/** Pure functions for the ticket picker — easy to unit test. */

export const MAX_TICKETS_PER_ORDER = 4;

export type Quantities = Record<string, number>;

export function totalQuantity(q: Quantities): number {
  return Object.values(q).reduce((sum, n) => sum + n, 0);
}

export function totalPrice(q: Quantities, types: TicketType[]): number {
  return types.reduce((sum, t) => sum + (q[t.id] ?? 0) * t.price, 0);
}

/** Can we add one more of this type? (stock left and under the per-order limit) */
export function canIncrease(q: Quantities, type: TicketType): boolean {
  return (q[type.id] ?? 0) < type.remaining && totalQuantity(q) < MAX_TICKETS_PER_ORDER;
}

export function changeQuantity(q: Quantities, type: TicketType, delta: 1 | -1): Quantities {
  if (delta === 1 && !canIncrease(q, type)) return q;
  const next = Math.max(0, (q[type.id] ?? 0) + delta);
  return { ...q, [type.id]: next };
}

export function toOrderItems(q: Quantities) {
  return Object.entries(q)
    .filter(([, quantity]) => quantity > 0)
    .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity }));
}
