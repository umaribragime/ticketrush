"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { useT } from "@/shared/i18n/use-t";

const inputBase =
  "w-full rounded-2xl border border-line bg-surface px-4 py-3 text-[15px] text-ink outline-none transition placeholder:text-muted/70 hover:border-ink/25 focus:border-accent focus:ring-4 focus:ring-accent/15 aria-invalid:border-danger aria-invalid:focus:ring-danger/15 [color-scheme:inherit]";

/** React 19: `ref` is a normal prop, no forwardRef needed. */
export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputBase, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(inputBase, "min-h-28 resize-y", className)} {...props} />;
}

interface FieldProps {
  label: string;
  htmlFor: string;
  /** A message key (from Zod) or plain text — translated automatically. */
  error?: string;
  hint?: string;
  children: ReactNode;
}

/** Label + input + error, with the ARIA links screen readers need. */
export function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  const t = useT();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-ink/80 text-sm font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-danger text-sm font-medium">
          {t(error)}
        </p>
      ) : (
        hint && <p className="text-muted text-sm">{hint}</p>
      )}
    </div>
  );
}

/** Props that link an input to its error message. */
export function invalidProps(id: string, error?: string) {
  return {
    id,
    "aria-invalid": !!error,
    "aria-describedby": error ? `${id}-error` : undefined,
  };
}
