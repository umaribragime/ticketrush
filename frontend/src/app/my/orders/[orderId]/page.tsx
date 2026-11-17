import { Suspense } from "react";
import { PageSpinner } from "@/shared/ui/spinner";
import { OrderDetailView } from "./order-detail-view";

export default function OrderDetailPage({
  params,
  searchParams,
}: PageProps<"/my/orders/[orderId]">) {
  return (
    <Suspense fallback={<PageSpinner />}>
      {Promise.all([params, searchParams]).then(([{ orderId }, sp]) => (
        <OrderDetailView orderId={orderId} justOrdered={sp.new === "1"} />
      ))}
    </Suspense>
  );
}
