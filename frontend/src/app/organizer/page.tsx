import type { Metadata } from "next";
import { OrganizerEventsView } from "./organizer-events-view";

export const metadata: Metadata = { title: "Your events" };

export default function OrganizerPage() {
  return <OrganizerEventsView />;
}
