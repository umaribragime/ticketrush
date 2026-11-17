"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Lock, ShieldX } from "lucide-react";
import type { Role } from "@/shared/api/types";
import { useT } from "@/shared/i18n/use-t";
import { useSession } from "@/shared/session/use-session";
import { ButtonLink } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/misc";
import { PageSpinner } from "@/shared/ui/spinner";

/**
 * Shows children only to logged-in users (with one of `roles`, if given).
 * Children render in the browser only, so their queries never run on the server.
 * This is a UX guard — the real protection is the backend checking the JWT.
 */
export function AuthGuard({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const t = useT();
  const session = useSession();

  if (session.status === "loading") return <PageSpinner />;
  if (session.status === "anonymous") return <LoginRequired />;
  if (roles && !roles.some(session.hasRole)) {
    return (
      <EmptyState
        icon={<ShieldX className="size-6" />}
        title={t("auth.forbidden")}
        description={t("auth.forbiddenDesc")}
      />
    );
  }
  return <>{children}</>;
}

/**
 * Separate component: usePathname() is "runtime URL data", so it may only run in the browser.
 * It renders only after we know the user is logged out — never during prerendering.
 */
function LoginRequired() {
  const t = useT();
  const pathname = usePathname();
  return (
    <EmptyState
      icon={<Lock className="size-6" />}
      title={t("auth.required")}
      description={t("auth.requiredDesc")}
      action={
        <ButtonLink href={`/login?next=${encodeURIComponent(pathname)}`}>
          {t("nav.login")}
        </ButtonLink>
      }
    />
  );
}
