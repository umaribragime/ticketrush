import { describe, expect, it } from "vitest";
import { initials } from "@/shared/ui/avatar";
import { passwordSchema, profileSchema } from "./schemas";

describe("account schemas", () => {
  it("needs a name", () => {
    expect(profileSchema.safeParse({ name: "   " }).success).toBe(false);
    expect(profileSchema.safeParse({ name: "Min-ji" }).success).toBe(true);
  });

  it("checks the new password", () => {
    const short = passwordSchema.safeParse({
      currentPassword: "x",
      newPassword: "short",
      confirmPassword: "short",
    });
    expect(short.error?.issues[0].message).toBe("v.passwordMin");

    const mismatch = passwordSchema.safeParse({
      currentPassword: "x",
      newPassword: "long-enough-1",
      confirmPassword: "long-enough-2",
    });
    expect(mismatch.error?.issues[0].path).toEqual(["confirmPassword"]);
  });
});

describe("initials", () => {
  it("uses first + last word, works with Korean", () => {
    expect(initials("Kim Min ji")).toBe("KJ");
    expect(initials("민지")).toBe("민");
    expect(initials("  ")).toBe("?");
  });
});
