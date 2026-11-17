"use client";

import type { OrderStatus, TicketStatus } from "@/shared/api/types";
import { useT } from "@/shared/i18n/use-t";
import { Badge, type Tone } from "@/shared/ui/misc";

const TICKET_TONE: Record<TicketStatus, Tone> = {
  ACTIVE: "volt",
  USED: "neutral",
  CANCELLED: "danger",
};
const ORDER_TONE: Record<OrderStatus, Tone> = {
  PAID: "success",
  PENDING: "warn",
  CANCELLED: "danger",
  EXPIRED: "neutral",
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const t = useT();
  return <Badge tone={TICKET_TONE[status]}>{t(`ticket.status.${status}`)}</Badge>;
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = useT();
  return <Badge tone={ORDER_TONE[status]}>{t(`order.status.${status}`)}</Badge>;
}
