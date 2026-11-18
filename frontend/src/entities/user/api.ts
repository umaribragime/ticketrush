import { queryOptions } from "@tanstack/react-query";
import { http } from "@/shared/api/http";
import type { User, UserSummary } from "@/shared/api/types";

export const meKeys = {
  all: ["me"] as const,
  profile: () => [...meKeys.all, "profile"] as const,
  summary: () => [...meKeys.all, "summary"] as const,
};

export const meQueries = {
  profile: () =>
    queryOptions({
      queryKey: meKeys.profile(),
      queryFn: async () => (await http.get<User>("/users/me")).data,
      staleTime: 60_000,
    }),
  summary: () =>
    queryOptions({
      queryKey: meKeys.summary(),
      queryFn: async () => (await http.get<UserSummary>("/users/me/summary")).data,
    }),
};

export const meApi = {
  rename: async (name: string) => (await http.patch<User>("/users/me", { name })).data,
  changePassword: async (currentPassword: string, newPassword: string) => {
    await http.put("/users/me/password", { currentPassword, newPassword });
  },
};
