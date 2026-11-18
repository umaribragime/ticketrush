"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/shared/i18n/use-t";
import { useSession } from "@/shared/session/use-session";
import { AuthShell } from "./auth-shell";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";

/**
 * Already logged in when you ARRIVE on /login or /signup? → go home.
 * Decided once, so it never fights the form's own redirect right after a successful login.
 */
function useRedirectIfLoggedInOnArrival() {
  const session = useSession();
  const router = useRouter();
  const decided = useRef(false);
  useEffect(() => {
    if (decided.current || session.status === "loading") return;
    decided.current = true;
    if (session.status === "authenticated") router.replace("/");
  }, [session.status, router]);
}

export function LoginScreen() {
  const t = useT();
  useRedirectIfLoggedInOnArrival();
  return (
    <AuthShell title={t("auth.loginTitle")} subtitle={t("auth.loginSub")}>
      <LoginForm />
    </AuthShell>
  );
}

export function SignupScreen() {
  const t = useT();
  useRedirectIfLoggedInOnArrival();
  return (
    <AuthShell title={t("auth.signupTitle")} subtitle={t("auth.signupSub")}>
      <SignupForm />
    </AuthShell>
  );
}
