"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Megaphone, PartyPopper } from "lucide-react";
import { errorMessage } from "@/shared/api/errors";
import { useT } from "@/shared/i18n/use-t";
import { useSessionStore } from "@/shared/session/session-store";
import { Button } from "@/shared/ui/button";
import { Field, Input, invalidProps } from "@/shared/ui/field";
import { ErrorBox } from "@/shared/ui/misc";
import { authApi } from "./api";
import { signupSchema, type SignupForm as SignupValues } from "./schemas";

const ACCOUNT_TYPES = [
  {
    value: "ATTENDEE",
    title: "auth.attendee",
    description: "auth.attendeeDesc",
    Icon: PartyPopper,
  },
  {
    value: "ORGANIZER",
    title: "auth.organizer",
    description: "auth.organizerDesc",
    Icon: Megaphone,
  },
] as const;

export function SignupForm() {
  const t = useT();
  const router = useRouter();
  const saveToken = useSessionStore((s) => s.login);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { accountType: "ATTENDEE" },
  });

  // Sign up, then log in right away — one less step for the user.
  const signup = useMutation({
    mutationFn: async (values: SignupValues) => {
      await authApi.signup(values);
      return authApi.login({ email: values.email, password: values.password });
    },
    onSuccess: (res, values) => {
      saveToken(res.accessToken);
      router.replace(values.accountType === "ORGANIZER" ? "/organizer" : "/");
    },
  });

  return (
    <form
      onSubmit={handleSubmit((v) => signup.mutate(v))}
      className="flex flex-col gap-5"
      noValidate
    >
      <fieldset className="grid grid-cols-2 gap-3">
        <legend className="text-ink/80 mb-2 text-sm font-semibold">{t("auth.accountType")}</legend>
        {ACCOUNT_TYPES.map(({ value, title, description, Icon }) => (
          // Styled from the radio's real state with CSS (has-checked:), so look and value always match.
          <label
            key={value}
            className="border-line hover:border-ink/30 has-checked:border-accent has-checked:bg-accent-soft has-focus-visible:ring-accent/30 cursor-pointer rounded-2xl border-2 p-4 transition has-focus-visible:ring-4"
          >
            <input
              type="radio"
              value={value}
              className="peer sr-only"
              {...register("accountType")}
            />
            <Icon className="text-muted peer-checked:text-accent-ink mb-2 size-6" />
            <span className="text-ink block font-bold">{t(title)}</span>
            <span className="text-muted mt-0.5 block text-xs">{t(description)}</span>
          </label>
        ))}
      </fieldset>

      <Field label={t("auth.name")} htmlFor="name" error={errors.name?.message}>
        <Input
          autoComplete="name"
          {...invalidProps("name", errors.name?.message)}
          {...register("name")}
        />
      </Field>
      <Field label={t("auth.email")} htmlFor="email" error={errors.email?.message}>
        <Input
          type="email"
          autoComplete="email"
          {...invalidProps("email", errors.email?.message)}
          {...register("email")}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={t("auth.password")}
          htmlFor="password"
          error={errors.password?.message}
          hint={t("auth.passwordHint")}
        >
          <Input
            type="password"
            autoComplete="new-password"
            {...invalidProps("password", errors.password?.message)}
            {...register("password")}
          />
        </Field>
        <Field
          label={t("auth.passwordConfirm")}
          htmlFor="passwordConfirm"
          error={errors.passwordConfirm?.message}
        >
          <Input
            type="password"
            autoComplete="new-password"
            {...invalidProps("passwordConfirm", errors.passwordConfirm?.message)}
            {...register("passwordConfirm")}
          />
        </Field>
      </div>

      {signup.isError && <ErrorBox message={errorMessage(signup.error, t)} />}

      <Button type="submit" size="lg" fullWidth loading={signup.isPending}>
        {t("auth.signup")}
      </Button>
      <p className="text-muted text-center text-sm">
        {t("auth.haveAccount")}{" "}
        <Link href="/login" className="text-accent-ink font-bold hover:underline">
          {t("nav.login")}
        </Link>
      </p>
    </form>
  );
}
