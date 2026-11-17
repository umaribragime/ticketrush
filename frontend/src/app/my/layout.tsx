import { Suspense } from "react";
import { AuthGuard } from "@/features/auth/auth-guard";
import { MyTabs } from "./my-tabs";

export default function MyLayout({ children }: LayoutProps<"/my">) {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="mb-10 h-11" />}>
        <MyTabs />
      </Suspense>
      {children}
    </AuthGuard>
  );
}
