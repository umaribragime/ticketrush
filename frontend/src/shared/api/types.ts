/** Types that mirror the Spring Boot DTOs (one source of truth: the backend records). */

export type Role = "ATTENDEE" | "ORGANIZER" | "STAFF";
export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";
export type OrderStatus = "PENDING" | "PAID" | "CANCELLED" | "EXPIRED";
export type TicketStatus = "ACTIVE" | "USED" | "CANCELLED";
export type ValidationStatus = "VALID" | "INVALID";
export type InvalidReason = "NOT_FOUND" | "WRONG_EVENT" | "ALREADY_USED" | "CANCELLED";

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ProblemDetail {
  status: number;
  title?: string;
  detail?: string;
  code?: string;
  errors?: Record<string, string>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  createdAt: string;
}

export interface UserSummary {
  ticketCount: number;
  upcomingTicketCount: number;
  orderCount: number;
  organizedEventCount: number;
}

export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  totalAvailable: number;
  remaining: number;
}

export interface EventSummary {
  id: string;
  name: string;
  venue: string;
  startAt: string;
  salesStartAt: string;
  salesEndAt: string;
  status: EventStatus;
}

export interface EventDetail extends EventSummary {
  description: string | null;
  endAt: string;
  organizerId: string;
  ticketTypes: TicketType[];
}

export interface Ticket {
  id: string;
  eventId: string;
  eventName: string;
  venue: string;
  eventStartAt: string;
  ticketTypeName: string;
  price: number;
  status: TicketStatus;
  qrValue: string;
  createdAt: string;
}

export interface OrderSummary {
  id: string;
  eventId: string;
  eventName: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
}

export interface Order extends OrderSummary {
  tickets: Ticket[];
}

export interface TicketTypeSales {
  ticketTypeId: string;
  name: string;
  price: number;
  totalAvailable: number;
  sold: number;
  revenue: number;
}

export interface SalesReport {
  eventId: string;
  totalSold: number;
  totalCapacity: number;
  totalRevenue: number;
  checkedIn: number;
  ticketTypes: TicketTypeSales[];
}

export interface ValidationResult {
  validationId: string;
  status: ValidationStatus;
  reason: InvalidReason | null;
  ticketId: string | null;
  ticketTypeName: string | null;
  validatedAt: string;
}

/** Body for create / update event. */
export interface EventInput {
  name: string;
  description?: string;
  venue: string;
  startAt: string;
  endAt: string;
  salesStartAt: string;
  salesEndAt: string;
  ticketTypes: { name: string; price: number; totalAvailable: number }[];
}
