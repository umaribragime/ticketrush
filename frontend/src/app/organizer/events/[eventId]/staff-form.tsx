"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { z } from "zod";
import { organizerEventApi } from "@/entities/event/api";
import { errorMessage } from "@/shared/api/errors";
import { useT } from "@/shared/i18n/use-t";
import { Button } from "@/shared/ui/button";
import { Field, Input, invalidProps } from "@/shared/ui/field";
import { Card, ErrorBox } from "@/shared/ui/misc";

const schema = z.object({ email: z.email("v.email") });

export function StaffForm({ eventId }: { eventId: string }) {
  const t = useT();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const addStaff = useMutation({
    mutationFn: (email: string) => organizerEventApi.addStaff(eventId, email),
    onSuccess: () => reset(),
  });

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="bg-accent-soft text-accent-ink flex size-10 items-center justify-center rounded-xl">
          <UserPlus className="size-5" />
        </span>
        <h2 className="font-display text-ink text-xl font-bold">{t("staff.title")}</h2>
      </div>
      <p className="text-muted text-sm">{t("staff.desc")}</p>
      <form
        onSubmit={handleSubmit((v) => addStaff.mutate(v.email))}
        className="flex flex-col gap-3"
        noValidate
      >
        <Field label={t("staff.email")} htmlFor="staff-email" error={errors.email?.message}>
          <Input
            type="email"
            {...invalidProps("staff-email", errors.email?.message)}
            {...register("email")}
          />
        </Field>
        {addStaff.isError && <ErrorBox message={errorMessage(addStaff.error, t)} />}
        {addStaff.isSuccess && (
          <p
            role="status"
            className="bg-success-soft text-success rounded-2xl px-4 py-3 text-sm font-medium"
          >
            {t("staff.added")}
          </p>
        )}
        <Button type="submit" variant="secondary" loading={addStaff.isPending}>
          {t("staff.add")}
        </Button>
      </form>
    </Card>
  );
}
