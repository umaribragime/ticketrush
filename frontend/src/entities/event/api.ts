import { queryOptions } from "@tanstack/react-query";
import { http } from "@/shared/api/http";
import type {
  EventDetail,
  EventInput,
  EventSummary,
  PageResponse,
  SalesReport,
} from "@/shared/api/types";

/**
 * Query key factory: every key for "organizer events" is built here,
 * so invalidating after a change is easy and never misses a key.
 */
export const organizerEventKeys = {
  all: ["organizer-events"] as const,
  list: (page: number) => [...organizerEventKeys.all, "list", page] as const,
  detail: (id: string) => [...organizerEventKeys.all, "detail", id] as const,
  sales: (id: string) => [...organizerEventKeys.all, "sales", id] as const,
};

export const organizerEventQueries = {
  list: (page: number) =>
    queryOptions({
      queryKey: organizerEventKeys.list(page),
      queryFn: async () =>
        (
          await http.get<PageResponse<EventSummary>>("/organizer/events", {
            params: { page, size: 20 },
          })
        ).data,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: organizerEventKeys.detail(id),
      queryFn: async () => (await http.get<EventDetail>(`/organizer/events/${id}`)).data,
    }),
  sales: (id: string) =>
    queryOptions({
      queryKey: organizerEventKeys.sales(id),
      queryFn: async () => (await http.get<SalesReport>(`/organizer/events/${id}/sales`)).data,
      refetchInterval: 10_000, // live-ish dashboard on ticket open day
    }),
};

export const organizerEventApi = {
  create: async (input: EventInput) =>
    (await http.post<EventDetail>("/organizer/events", input)).data,
  update: async (id: string, input: EventInput) =>
    (await http.put<EventDetail>(`/organizer/events/${id}`, input)).data,
  publish: async (id: string) =>
    (await http.post<EventDetail>(`/organizer/events/${id}/publish`)).data,
  cancel: async (id: string) =>
    (await http.post<EventDetail>(`/organizer/events/${id}/cancel`)).data,
  addStaff: async (id: string, email: string) => {
    await http.post(`/organizer/events/${id}/staff`, { email });
  },
};
