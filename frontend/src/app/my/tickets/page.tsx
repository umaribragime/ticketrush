import type { Metadata } from "next";
import { MyTicketsView } from "./my-tickets-view";

export const metadata: Metadata = { title: "My tickets" };

export default function MyTicketsPage() {
  return <MyTicketsView />;
}
