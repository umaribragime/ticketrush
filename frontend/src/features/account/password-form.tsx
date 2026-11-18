"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { meApi } from "@/entities/user/api";
import { errorMessage } from "@/shared/api/errors";
import { useT } from "@/shared/i18n/use-t";
import { Button } from "@/shared/ui/button";
import { Field, Input, invalidProps } from "@/shared/ui/field";
import { ErrorBox } from "@/shared/ui/misc";
import { passwordSchema, type PasswordForm as PasswordValues } from "./schemas";

export function PasswordForm() {
  const t = useT();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  const change = useMutation({
    mutationFn: (v: PasswordValues) => meApi.changePassword(v.currentPassword, v.newPassword),
    onSuccess: () => reset({ currentPassword: "", newPassword: "", confirmPassword: "" }),
  });

  return (
    <form
      onSubmit={handleSubmit((v) => change.mutate(v))}
      className="flex flex-col gap-5"
      noValidate
    >
      <Field
        label={t("account.currentPassword")}
        htmlFor="currentPassword"
        error={errors.currentPassword?.message}
      >
        <Input
          type="password"
          autoComplete="current-password"
          {...invalidProps("currentPassword", errors.currentPassword?.message)}
          {...register("currentPassword")}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={t("account.newPassword")}
          htmlFor="newPassword"
          error={errors.newPassword?.message}
          hint={t("auth.passwordHint")}
        >
          <Input
            type="password"
            autoComplete="new-password"
            {...invalidProps("newPassword", errors.newPassword?.message)}
            {...register("newPassword")}
          />
        </Field>
        <Field
          label={t("account.confirmPassword")}
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <Input
            type="password"
            autoComplete="new-password"
            {...invalidProps("confirmPassword", errors.confirmPassword?.message)}
            {...register("confirmPassword")}
          />
        </Field>
      </div>

      {change.isError && <ErrorBox message={errorMessage(change.error, t)} />}

      <div className="flex items-center justify-end gap-3">
        {change.isSuccess && (
          <span
            role="status"
            className="text-success flex items-center gap-1.5 text-sm font-semibold"
          >
            <Check className="size-4" /> {t("account.passwordChanged")}
          </span>
        )}
        <Button type="submit" variant="secondary" loading={change.isPending}>
          {t("account.changePassword")}
        </Button>
      </div>
    </form>
  );
}
