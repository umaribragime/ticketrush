import { describe, expect, it } from "vitest";
import type { TicketType } from "@/shared/api/types";
import { canIncrease, changeQuantity, toOrderItems, totalPrice, totalQuantity } from "./cart";

const vip: TicketType = { id: "vip", name: "VIP", price: 165000, totalAvailable: 10, remaining: 2 };
const r: TicketType = { id: "r", name: "R", price: 99000, totalAvailable: 100, remaining: 100 };

describe("cart", () => {
  it("adds up quantity and price", () => {
    const q = { vip: 1, r: 2 };
    expect(totalQuantity(q)).toBe(3);
    expect(totalPrice(q, [vip, r])).toBe(165000 + 2 * 99000);
  });

  it("never goes above remaining stock", () => {
    let q = {};
    q = changeQuantity(q, vip, 1);
    q = changeQuantity(q, vip, 1);
    q = changeQuantity(q, vip, 1); // only 2 left
    expect(q).toEqual({ vip: 2 });
    expect(canIncrease(q, vip)).toBe(false);
  });

  it("never goes above 4 tickets per order", () => {
    const q = { r: 4 };
    expect(canIncrease(q, r)).toBe(false);
    expect(changeQuantity(q, r, 1)).toBe(q);
  });

  it("never goes below zero", () => {
    expect(changeQuantity({}, r, -1)).toEqual({ r: 0 });
  });

  it("sends only types with quantity > 0", () => {
    expect(toOrderItems({ vip: 0, r: 2 })).toEqual([{ ticketTypeId: "r", quantity: 2 }]);
  });
});
