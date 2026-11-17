import { Suspense } from "react";
import { PageSpinner } from "@/shared/ui/spinner";
import { EditEventView } from "./edit-event-view";

export default function EditEventPage({ params }: PageProps<"/organizer/events/[eventId]/edit">) {
  return (
    <Suspense fallback={<PageSpinner />}>
      {params.then(({ eventId }) => (
        <EditEventView eventId={eventId} />
      ))}
    </Suspense>
  );
}
