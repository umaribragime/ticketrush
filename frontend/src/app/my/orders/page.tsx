import type { Metadata } from "next";
import { MyOrdersView } from "./my-orders-view";

export const metadata: Metadata = { title: "Orders" };

export default function MyOrdersPage() {
  return <MyOrdersView />;
}
