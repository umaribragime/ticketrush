import { http } from "@/shared/api/http";
import type { ValidationResult } from "@/shared/api/types";

export type ValidateInput =
  { method: "QR"; qrValue: string } | { method: "MANUAL"; ticketId: string };

export const checkInApi = {
  validate: async (eventId: string, input: ValidateInput) =>
    (await http.post<ValidationResult>(`/events/${eventId}/validations`, input)).data,
};

/** Translation key for an INVALID reason. */
export function reasonKey(reason: string | null): string {
  return reason ? `reason.${reason}` : "reason.unknown";
}
