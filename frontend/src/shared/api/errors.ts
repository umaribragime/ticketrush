import axios from "axios";
import type { TFunction } from "@/shared/i18n/use-t";
import type { ProblemDetail } from "./types";

export function problemOf(error: unknown): ProblemDetail | null {
  if (
    axios.isAxiosError(error) &&
    error.response?.data &&
    typeof error.response.data === "object"
  ) {
    return error.response.data as ProblemDetail;
  }
  return null;
}

/** Backend error → message in the user's language (via the stable `code` from Problem Details). */
export function errorMessage(error: unknown, t: TFunction): string {
  const problem = problemOf(error);
  if (problem?.code) {
    const key = `err.${problem.code}`;
    const text = t(key);
    if (text !== key) return text;
  }
  if (problem?.detail) return problem.detail;
  if (axios.isAxiosError(error) && !error.response) return t("err.network");
  return t("err.unknown");
}
