"use client";

import { useT } from "@/shared/i18n/use-t";
import { AuthShell } from "./auth-shell";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";

export function LoginScreen() {
  const t = useT();
  return (
    <AuthShell title={t("auth.loginTitle")} subtitle={t("auth.loginSub")}>
      <LoginForm />
    </AuthShell>
  );
}

export function SignupScreen() {
  const t = useT();
  return (
    <AuthShell title={t("auth.signupTitle")} subtitle={t("auth.signupSub")}>
      <SignupForm />
    </AuthShell>
  );
}
