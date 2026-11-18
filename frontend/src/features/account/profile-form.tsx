"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { meApi, meKeys } from "@/entities/user/api";
import { errorMessage } from "@/shared/api/errors";
import type { User } from "@/shared/api/types";
import { useT } from "@/shared/i18n/use-t";
import { Button } from "@/shared/ui/button";
import { Field, Input, invalidProps } from "@/shared/ui/field";
import { ErrorBox } from "@/shared/ui/misc";
import { profileSchema, type ProfileForm as ProfileValues } from "./schemas";

export function ProfileForm({ user }: { user: User }) {
  const t = useT();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name },
  });

  const save = useMutation({
    mutationFn: (v: ProfileValues) => meApi.rename(v.name),
    onSuccess: (updated) => {
      queryClient.setQueryData(meKeys.profile(), updated); // header + menu update instantly
      reset({ name: updated.name });
    },
  });

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))} className="flex flex-col gap-5" noValidate>
      <Field label={t("account.name")} htmlFor="name" error={errors.name?.message}>
        <Input
          autoComplete="name"
          {...invalidProps("name", errors.name?.message)}
          {...register("name")}
        />
      </Field>
      <Field label={t("account.email")} htmlFor="email" hint={t("account.emailHint")}>
        <Input
          id="email"
          type="email"
          value={user.email}
          readOnly
          disabled
          className="opacity-70"
        />
      </Field>

      {save.isError && <ErrorBox message={errorMessage(save.error, t)} />}

      <div className="flex items-center justify-end gap-3">
        {save.isSuccess && !isDirty && (
          <span
            role="status"
            className="text-success flex items-center gap-1.5 text-sm font-semibold"
          >
            <Check className="size-4" /> {t("account.saved")}
          </span>
        )}
        <Button type="submit" loading={save.isPending} disabled={!isDirty}>
          {t("account.saveProfile")}
        </Button>
      </div>
    </form>
  );
}
