import { AuthGuard } from "@/features/auth/auth-guard";

export default function OrganizerLayout({ children }: LayoutProps<"/organizer">) {
  return <AuthGuard roles={["ORGANIZER"]}>{children}</AuthGuard>;
}
