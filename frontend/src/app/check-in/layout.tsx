import { AuthGuard } from "@/features/auth/auth-guard";

/** Any logged-in user may open it; the backend decides if they are staff for the event. */
export default function CheckInLayout({ children }: LayoutProps<"/check-in">) {
  return <AuthGuard>{children}</AuthGuard>;
}
