import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BackendUnavailableError, fetchEvent, requestTime } from "@/shared/api/server-api";
import { PageSpinner } from "@/shared/ui/spinner";
import { BackendDown } from "../../event-grid";
import { EventDetailView } from "./event-detail-view";

export default function EventPage({ params }: PageProps<"/events/[eventId]">) {
  return (
    <Suspense fallback={<PageSpinner />}>
      {params.then(({ eventId }) => (
        <EventData eventId={eventId} />
      ))}
    </Suspense>
  );
}

/** Server part: fetch fresh data. The client part only renders it in the chosen language. */
async function EventData({ eventId }: { eventId: string }) {
  const serverNow = await requestTime();
  let event;
  try {
    event = await fetchEvent(eventId);
  } catch (e) {
    if (e instanceof BackendUnavailableError) return <BackendDown />;
    throw e;
  }
  if (!event) notFound();
  return <EventDetailView event={event} serverNow={serverNow} />;
}
