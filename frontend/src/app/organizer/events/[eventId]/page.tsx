import { Suspense } from "react";
import { PageSpinner } from "@/shared/ui/spinner";
import { ManageEventView } from "./manage-event-view";

export default function ManageEventPage({ params }: PageProps<"/organizer/events/[eventId]">) {
  return (
    <Suspense fallback={<PageSpinner />}>
      {params.then(({ eventId }) => (
        <ManageEventView eventId={eventId} />
      ))}
    </Suspense>
  );
}
