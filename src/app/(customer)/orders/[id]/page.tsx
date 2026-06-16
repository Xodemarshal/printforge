import { getOrderById, cancelOrderAction } from "@/actions/orders";
import { submitReviewAction } from "@/actions/reviews";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    return <div className="mx-auto max-w-5xl px-4 py-10">Order not found.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <h1 className="text-3xl font-semibold">Order {order.id}</h1>
      <OrderTimeline status={order.status} />
      <div className="rounded-2xl border p-6">
        <h2 className="text-xl font-medium">Items</h2>
        <pre className="mt-4 overflow-auto text-sm">{JSON.stringify(order.order_items ?? [], null, 2)}</pre>
      </div>
      <form 
        action={async (formData) => {
          "use server";
          await cancelOrderAction(formData);
        }}
      >
        <input type="hidden" name="id" value={order.id} />
        <Button type="submit" variant="outline">Cancel order</Button>
      </form>
      {order.status === "delivered" ? (
        <form 
          action={async (formData) => {
            "use server";
            await submitReviewAction(formData);
          }} 
          className="space-y-4 rounded-2xl border p-6"
        >
          <h2 className="text-xl font-medium">Leave a review</h2>
          <Input name="orderItemId" placeholder="Order item ID" />
          <Input name="productId" placeholder="Product ID" />
          <Input name="rating" type="number" min="1" max="5" placeholder="Rating" />
          <Textarea name="comment" placeholder="Write your review" />
          <Button type="submit">Submit review</Button>
        </form>
      ) : null}
    </div>
  );
}
