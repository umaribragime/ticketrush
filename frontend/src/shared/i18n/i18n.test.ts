import { describe, expect, it } from "vitest";
import { en } from "./en";
import { ko } from "./ko";
import { translate } from "./use-t";

describe("i18n", () => {
  it("Korean has exactly the same keys as English", () => {
    expect(Object.keys(ko).sort()).toEqual(Object.keys(en).sort());
  });

  it("fills in variables", () => {
    expect(translate("en", "buy.left", { n: 3 })).toBe("3 left");
    expect(translate("ko", "buy.left", { n: 3 })).toBe("3석 남음");
  });

  it("falls back to the key for unknown text", () => {
    expect(translate("ko", "no.such.key")).toBe("no.such.key");
  });
});
