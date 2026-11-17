import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePrefsStore } from "@/shared/prefs/prefs-store";
import { LoginForm, safeRedirect } from "./login-form";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }));

function renderForm() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <LoginForm />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  act(() => usePrefsStore.getState().setLocale("en"));
});

describe("LoginForm", () => {
  it("shows validation errors in English by default and does not call the API", async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText("Email"), "not-an-email");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Enter a valid email.")).toBeInTheDocument();
    expect(screen.getByText("Enter your password.")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });

  it("switches to Korean", async () => {
    act(() => usePrefsStore.getState().setLocale("ko"));
    renderForm();
    await userEvent.click(screen.getByRole("button", { name: "로그인" }));

    expect(await screen.findByText("올바른 이메일 형식이 아닙니다.")).toBeInTheDocument();
    expect(screen.getByLabelText("이메일")).toBeInTheDocument();
  });
});

describe("safeRedirect", () => {
  it("only allows paths on our own site", () => {
    expect(safeRedirect("/my/tickets")).toBe("/my/tickets");
    expect(safeRedirect("https://evil.com")).toBe("/");
    expect(safeRedirect("//evil.com")).toBe("/");
    expect(safeRedirect(null)).toBe("/");
  });
});
