import axios from "axios";
import { useSessionStore } from "@/shared/session/session-store";

/**
 * Browser HTTP client. Calls go to "/api/..." on the same origin;
 * next.config.ts forwards them to Spring Boot.
 */
export const http = axios.create({
  baseURL: "/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// Attach the JWT to every request.
http.interceptors.request.use((config) => {
  const token = useSessionStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token expired or invalid → log out, so the UI asks to log in again.
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      useSessionStore.getState().logout();
    }
    return Promise.reject(error);
  },
);
