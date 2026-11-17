import { queryOptions } from "@tanstack/react-query";
import { http } from "@/shared/api/http";
import type { Order, OrderSummary, PageResponse, Ticket } from "@/shared/api/types";

export const myKeys = {
  tickets: (page: number) => ["my", "tickets", page] as const,
  ticketQr: (id: string) => ["my", "tickets", id, "qr"] as const,
  orders: (page: number) => ["my", "orders", page] as const,
  order: (id: string) => ["my", "orders", "detail", id] as const,
  all: ["my"] as const,
};

export const myQueries = {
  tickets: (page: number) =>
    queryOptions({
      queryKey: myKeys.tickets(page),
      queryFn: async () =>
        (await http.get<PageResponse<Ticket>>("/tickets", { params: { page, size: 10 } })).data,
    }),
  /** QR PNG comes from the backend (needs the token), so we load it and turn it into a data URL. */
  ticketQr: (id: string) =>
    queryOptions({
      queryKey: myKeys.ticketQr(id),
      queryFn: async () => {
        const blob = (await http.get<Blob>(`/tickets/${id}/qr`, { responseType: "blob" })).data;
        return blobToDataUrl(blob);
      },
      staleTime: Infinity,
    }),
  orders: (page: number) =>
    queryOptions({
      queryKey: myKeys.orders(page),
      queryFn: async () =>
        (await http.get<PageResponse<OrderSummary>>("/orders", { params: { page, size: 10 } }))
          .data,
    }),
  order: (id: string) =>
    queryOptions({
      queryKey: myKeys.order(id),
      queryFn: async () => (await http.get<Order>(`/orders/${id}`)).data,
    }),
};

export interface PlaceOrderInput {
  eventId: string;
  items: { ticketTypeId: string; quantity: number }[];
}

export const orderApi = {
  place: async (input: PlaceOrderInput) => (await http.post<Order>("/orders", input)).data,
};

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
