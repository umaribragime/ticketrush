"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { errorMessage } from "@/shared/api/errors";
import { useT } from "@/shared/i18n/use-t";
import { useSessionStore } from "@/shared/session/session-store";
import { Button } from "@/shared/ui/button";
import { Field, Input, invalidProps } from "@/shared/ui/field";
import { ErrorBox } from "@/shared/ui/misc";
import { authApi } from "./api";
import { loginSchema, type LoginForm as LoginValues } from "./schemas";

/**
 * Where to go after login: "?next=/my/tickets".
 * Only paths inside our own site are allowed (stops "open redirect" attacks).
 */
export function safeRedirect(next: string | null | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export function LoginForm() {
  const t = useT();
  const router = useRouter();
  const saveToken = useSessionStore((s) => s.login);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      saveToken(res.accessToken);
      router.replace(safeRedirect(new URLSearchParams(window.location.search).get("next")));
    },
  });

  return (
    <form
      onSubmit={handleSubmit((v) => login.mutate(v))}
      className="flex flex-col gap-5"
      noValidate
    >
      <Field label={t("auth.email")} htmlFor="email" error={errors.email?.message}>
        <Input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...invalidProps("email", errors.email?.message)}
          {...register("email")}
        />
      </Field>
      <Field label={t("auth.password")} htmlFor="password" error={errors.password?.message}>
        <Input
          type="password"
          autoComplete="current-password"
          {...invalidProps("password", errors.password?.message)}
          {...register("password")}
        />
      </Field>

      {login.isError && <ErrorBox message={errorMessage(login.error, t)} />}

      <Button type="submit" size="lg" fullWidth loading={login.isPending}>
        {t("auth.login")} <ArrowRight className="size-5" />
      </Button>
      <p className="text-muted text-center text-sm">
        {t("auth.noAccount")}{" "}
        <Link href="/signup" className="text-accent-ink font-bold hover:underline">
          {t("nav.signup")}
        </Link>
      </p>
    </form>
  );
}
