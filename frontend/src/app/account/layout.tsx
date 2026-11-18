import { AuthGuard } from "@/features/auth/auth-guard";

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return <AuthGuard>{children}</AuthGuard>;
}
