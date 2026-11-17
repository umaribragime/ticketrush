"use client";

import type { ReactNode } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarRange, Plus, Sparkles, Tags, Trash2 } from "lucide-react";
import { errorMessage } from "@/shared/api/errors";
import { useT } from "@/shared/i18n/use-t";
import { Button } from "@/shared/ui/button";
import { Field, Input, invalidProps, Textarea } from "@/shared/ui/field";
import { Card, ErrorBox } from "@/shared/ui/misc";
import { eventFormSchema, type EventFormValues } from "./schema";

interface EventFormProps {
  defaultValues: EventFormValues;
  submitLabel: string;
  onSubmit: (values: EventFormValues) => void;
  isSubmitting: boolean;
  submitError: unknown;
}

/** One form for "create" and "edit". Ticket types are a dynamic list (useFieldArray). */
export function EventForm({
  defaultValues,
  submitLabel,
  onSubmit,
  isSubmitting,
  submitError,
}: EventFormProps) {
  const t = useT();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({ resolver: zodResolver(eventFormSchema), defaultValues });
  const ticketTypes = useFieldArray({ control, name: "ticketTypes" });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      <Section icon={<Sparkles />} title={t("form.basics")}>
        <Field label={t("form.name")} htmlFor="name" error={errors.name?.message}>
          <Input {...invalidProps("name", errors.name?.message)} {...register("name")} />
        </Field>
        <Field label={t("form.venue")} htmlFor="venue" error={errors.venue?.message}>
          <Input
            placeholder={t("form.venuePh")}
            {...invalidProps("venue", errors.venue?.message)}
            {...register("venue")}
          />
        </Field>
        <Field
          label={t("form.description")}
          htmlFor="description"
          error={errors.description?.message}
        >
          <Textarea id="description" {...register("description")} />
        </Field>
      </Section>

      <Section icon={<CalendarRange />} title={t("form.schedule")} subtitle={t("common.kst")}>
        <div className="grid gap-5 sm:grid-cols-2">
          {(
            [
              ["salesStartAt", "form.salesStart"],
              ["salesEndAt", "form.salesEnd"],
              ["startAt", "form.start"],
              ["endAt", "form.end"],
            ] as const
          ).map(([name, label]) => (
            <Field key={name} label={t(label)} htmlFor={name} error={errors[name]?.message}>
              <Input
                type="datetime-local"
                {...invalidProps(name, errors[name]?.message)}
                {...register(name)}
              />
            </Field>
          ))}
        </div>
      </Section>

      <Section
        icon={<Tags />}
        title={t("form.ticketTypes")}
        action={
          <Button
            variant="outline"
            size="sm"
            disabled={ticketTypes.fields.length >= 20}
            onClick={() => ticketTypes.append({ name: "", price: 0, totalAvailable: 100 })}
          >
            <Plus className="size-4" /> {t("form.add")}
          </Button>
        }
      >
        {errors.ticketTypes?.root?.message && (
          <ErrorBox message={t(errors.ticketTypes.root.message)} />
        )}

        {ticketTypes.fields.map((field, i) => {
          const e = errors.ticketTypes?.[i];
          return (
            <div
              key={field.id}
              className="border-line bg-surface-2/50 animate-pop grid items-start gap-3 rounded-2xl border p-4 sm:grid-cols-[1.2fr_1fr_1fr_auto]"
            >
              <Field label={t("form.ttName")} htmlFor={`tt-${i}-name`} error={e?.name?.message}>
                <Input
                  placeholder="VIP"
                  {...invalidProps(`tt-${i}-name`, e?.name?.message)}
                  {...register(`ticketTypes.${i}.name`)}
                />
              </Field>
              <Field label={t("form.price")} htmlFor={`tt-${i}-price`} error={e?.price?.message}>
                <Input
                  type="number"
                  min={0}
                  step={1000}
                  {...invalidProps(`tt-${i}-price`, e?.price?.message)}
                  {...register(`ticketTypes.${i}.price`, { valueAsNumber: true })}
                />
              </Field>
              <Field
                label={t("form.qty")}
                htmlFor={`tt-${i}-total`}
                error={e?.totalAvailable?.message}
              >
                <Input
                  type="number"
                  min={1}
                  {...invalidProps(`tt-${i}-total`, e?.totalAvailable?.message)}
                  {...register(`ticketTypes.${i}.totalAvailable`, { valueAsNumber: true })}
                />
              </Field>
              <Button
                variant="ghost"
                size="sm"
                className="sm:mt-8"
                disabled={ticketTypes.fields.length === 1}
                onClick={() => ticketTypes.remove(i)}
                aria-label={t("form.removeAria", { n: i + 1 })}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          );
        })}
      </Section>

      {!!submitError && <ErrorBox message={errorMessage(submitError, t)} />}

      <div className="flex justify-end">
        <Button type="submit" size="lg" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Section({
  icon,
  title,
  subtitle,
  action,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="bg-accent-soft text-accent-ink flex size-10 items-center justify-center rounded-xl [&>svg]:size-5">
            {icon}
          </span>
          <div>
            <h2 className="font-display text-ink text-xl font-bold">{title}</h2>
            {subtitle && <p className="text-muted text-sm">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}
