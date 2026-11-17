"use client";

import { useRef, useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { CircleCheckBig, CircleX, Hash, QrCode, ScanLine } from "lucide-react";
import { errorMessage } from "@/shared/api/errors";
import type { ValidationResult } from "@/shared/api/types";
import { useFormat } from "@/shared/i18n/use-format";
import { useT } from "@/shared/i18n/use-t";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Card, ErrorBox } from "@/shared/ui/misc";
import { checkInApi, reasonKey, type ValidateInput } from "./api";

type Mode = "QR" | "MANUAL";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Gate screen. A USB/Bluetooth QR scanner works like a keyboard: it "types" the code
 * and presses Enter — so a focused input + form submit is all we need.
 */
export function Scanner({ eventId }: { eventId: string }) {
  const t = useT();
  const f = useFormat();
  const [mode, setMode] = useState<Mode>("QR");
  const [value, setValue] = useState("");
  const [inputError, setInputError] = useState<string>();
  const [history, setHistory] = useState<ValidationResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useMutation({
    mutationFn: (input: ValidateInput) => checkInApi.validate(eventId, input),
    onSuccess: (result) => setHistory((h) => [result, ...h].slice(0, 20)),
    onSettled: () => {
      setValue("");
      inputRef.current?.focus(); // ready for the next person in line
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    if (mode === "MANUAL" && !UUID.test(v)) {
      setInputError("v.ticketId");
      return;
    }
    setInputError(undefined);
    validate.mutate(
      mode === "QR" ? { method: "QR", qrValue: v } : { method: "MANUAL", ticketId: v },
    );
  };

  const admitted = history.filter((h) => h.status === "VALID").length;

  return (
    <div className="flex flex-col gap-6">
      <ResultPanel result={validate.data} pending={validate.isPending} />
      {validate.isError && <ErrorBox message={errorMessage(validate.error, t)} />}

      <Card className="flex flex-col gap-4">
        <div
          className="bg-surface-2 flex w-fit rounded-full p-1"
          role="tablist"
          aria-label={t("ci.methods")}
        >
          {(["QR", "MANUAL"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => {
                setMode(m);
                setInputError(undefined);
                inputRef.current?.focus();
              }}
              className="text-muted aria-selected:bg-ink aria-selected:text-bg flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold transition-colors"
            >
              {m === "QR" ? <QrCode className="size-4" /> : <Hash className="size-4" />}
              {m === "QR" ? t("ci.qr") : t("ci.manual")}
            </button>
          ))}
        </div>
        <form onSubmit={onSubmit} className="flex gap-2">
          <label htmlFor="scan" className="sr-only">
            {mode === "QR" ? t("ci.qrLabel") : t("ci.manual")}
          </label>
          <div className="relative flex-1">
            <ScanLine className="text-muted pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2" />
            <input
              id="scan"
              ref={inputRef}
              autoFocus
              autoComplete="off"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={mode === "QR" ? t("ci.qrPh") : t("ci.manualPh")}
              aria-invalid={!!inputError}
              className="border-line bg-surface text-ink placeholder:text-muted/70 focus:border-accent focus:ring-accent/15 aria-invalid:border-danger h-14 w-full rounded-2xl border pr-4 pl-12 font-mono text-[15px] transition outline-none focus:ring-4"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            loading={validate.isPending}
            className="shrink-0 rounded-2xl"
          >
            {t("ci.check")}
          </Button>
        </form>
        {inputError && <p className="text-danger text-sm font-medium">{t(inputError)}</p>}
      </Card>

      {history.length > 0 && (
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-ink text-lg font-bold">{t("ci.history")}</h2>
            <span className="bg-success-soft text-success rounded-full px-3 py-1 text-xs font-bold">
              {t("ci.admitted")} · {admitted}
            </span>
          </div>
          <ul className="divide-line divide-y text-sm">
            {history.map((h) => (
              <li key={h.validationId} className="flex items-center justify-between gap-3 py-2.5">
                <span
                  className={cn(
                    "flex items-center gap-2 font-bold",
                    h.status === "VALID" ? "text-success" : "text-danger",
                  )}
                >
                  {h.status === "VALID" ? (
                    <CircleCheckBig className="size-4" />
                  ) : (
                    <CircleX className="size-4" />
                  )}
                  {h.status === "VALID" ? t("ci.admitted") : t(reasonKey(h.reason))}
                </span>
                <span className="text-muted">{h.ticketTypeName ?? "—"}</span>
                <span className="text-muted font-mono text-xs tabular-nums">
                  {f.dateTime(h.validatedAt)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function ResultPanel({ result, pending }: { result?: ValidationResult; pending: boolean }) {
  const t = useT();
  const valid = result?.status === "VALID";
  return (
    <div
      role="status"
      aria-live="assertive"
      // key → replays the "pop" animation for every new scan
      key={result?.validationId ?? "idle"}
      className={cn(
        "animate-pop flex min-h-56 flex-col items-center justify-center gap-3 rounded-[2rem] p-8 text-center transition-opacity",
        !result && "border-line text-muted border-2 border-dashed",
        result && valid && "bg-success text-white",
        result && !valid && "bg-danger text-white",
        pending && "opacity-60",
      )}
    >
      {!result ? (
        <>
          <ScanLine className="size-12" />
          <p className="font-display text-xl font-bold">{t("ci.waiting")}</p>
        </>
      ) : valid ? (
        <>
          <CircleCheckBig className="size-16" />
          <p className="font-display text-5xl font-bold tracking-tight sm:text-6xl">
            {t("ci.valid")}
          </p>
          <p className="text-lg font-semibold opacity-90">{result.ticketTypeName}</p>
        </>
      ) : (
        <>
          <CircleX className="size-16" />
          <p className="font-display text-5xl font-bold tracking-tight sm:text-6xl">
            {t("ci.invalid")}
          </p>
          <p className="text-lg font-semibold opacity-90">{t(reasonKey(result.reason))}</p>
        </>
      )}
    </div>
  );
}
