import type { Metadata } from "next";
import { LoginScreen } from "@/features/auth/screens";

export const metadata: Metadata = { title: "Log in" };

/** Fully static page: the form reads "?next=" only when the user submits. */
export default function LoginPage() {
  return <LoginScreen />;
}
