import { Suspense } from "react";
import type { Metadata } from "next";
import { CheckInHeader } from "@/features/check-in/check-in-header";
import { Scanner } from "@/features/check-in/scanner";
import { PageSpinner } from "@/shared/ui/spinner";

export const metadata: Metadata = { title: "Gate check-in" };

export default function CheckInPage({ params }: PageProps<"/check-in/[eventId]">) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <CheckInHeader />
      <Suspense fallback={<PageSpinner />}>
        {params.then(({ eventId }) => (
          <Scanner eventId={eventId} />
        ))}
      </Suspense>
    </div>
  );
}
