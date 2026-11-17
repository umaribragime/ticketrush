import { http } from "@/shared/api/http";
import type { TokenResponse, User } from "@/shared/api/types";
import type { LoginForm, SignupForm } from "./schemas";

export const authApi = {
  login: async (form: LoginForm) => (await http.post<TokenResponse>("/auth/login", form)).data,
  signup: async ({ name, email, password, accountType }: SignupForm) =>
    (await http.post<User>("/auth/signup", { name, email, password, accountType })).data,
};
