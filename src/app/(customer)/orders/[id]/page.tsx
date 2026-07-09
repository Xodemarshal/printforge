import { getOrderById, cancelOrderAction } from "@/actions/orders";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { ReviewSection } from "@/components/orders/ReviewSection";
import { CustomerTrackingPanel } from "@/components/shipping/CustomerTrackingPanel";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { Package, CreditCard, Calendar, ChevronLeft, Truck, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/guards";
export const dynamic = "force-dynamic";
export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, user] = await Promise.all([getOrderById(id), requireUser()]);
  const supabase = createAdminClient();
  
  
  if (!order) {
    return (
      <div className="page-shell py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Package size={64} className="text-forest/30 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-forest mb-2">Order not found</h1>
          <p className="text-forest/70 mb-8">We couldn't find the order you're looking for.</p>
          <Link 
            href="/orders"
            className="inline-block bg-forest text-white px-6 py-3 rounded-lg font-semibold hover:bg-forest-dark transition-colors"
          >
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  const orderItems = order.order_items || [];
  const orderTotal = orderItems.reduce((sum: number, item: any) =>
    sum + (item.unit_price * item.quantity), 0
  );

  // Pre-fetch which products the user already reviewed for THIS order
  const productIds = orderItems.map((i: any) => i.product_id).filter(Boolean);
  let reviewedList: Array<{ product_id: string; rating: number; review_text: string }> = [];
  if (productIds.length > 0) {
    const { data: existingReviews } = await supabase
      .from("product_reviews")
      .select("product_id, rating, review_text")
      .eq("user_id", user.id)
      .eq("order_id", id)
      .in("product_id", productIds);
    reviewedList = existingReviews || [];
  }

  return (
    <div className="page-shell py-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link 
          href="/orders"
          className="inline-flex items-center gap-2 text-forest/60 hover:text-forest transition-colors mb-6"
        >
          <ChevronLeft size={20} />
          Back to Orders
        </Link>

        {/* Header */}
        <div className="mb-6 overflow-hidden rounded-3xl border border-forest/15 bg-gradient-to-br from-cream/80 via-white to-moss/10 shadow-[0_18px_50px_rgba(46,75,36,0.08)]">
          <div className="border-b border-forest/10 px-6 py-5 sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-forest/55">Order Detail</p>
                <h1 className="mt-2 text-2xl font-bold text-forest sm:text-3xl">
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </h1>
                <p className="mt-2 flex items-center gap-2 text-sm text-forest/65">
                  <Calendar size={16} />
                  <span>Placed on {new Date(order.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}</span>
                </p>
              </div>

              {["pending", "confirmed"].includes(order.status) && (
                <form action={async (formData) => {
                  "use server";
                  await cancelOrderAction(formData);
                  revalidatePath(`/orders/${order.id}`);
                }} className="shrink-0">
                  <input type="hidden" name="id" value={order.id} />
                  <Button type="submit" variant="outline" className="border-red-500/40 text-red-700 hover:bg-red-50">
                    Cancel Order
                  </Button>
                </form>
              )}
            </div>
          </div>

          <div className="grid gap-3 px-6 py-5 sm:grid-cols-2 xl:grid-cols-4 sm:px-8">
            <div className="rounded-2xl border border-forest/10 bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-forest/45">Order Number</p>
              <p className="mt-2 break-all font-mono text-sm font-semibold text-forest">{order.id}</p>
            </div>
            <div className="rounded-2xl border border-forest/10 bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-forest/45">Payment</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-forest">
                <CheckCircle2 size={16} className={order.payment_status === "paid" ? "text-emerald-600" : "text-amber-600"} />
                <span className="capitalize">{order.payment_status}</span>
              </p>
            </div>
            <div className="rounded-2xl border border-forest/10 bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-forest/45">Shipping</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-forest">
                <Truck size={16} className="text-forest/70" />
                <span>{order.shiprocket_courier_name || order.courier_name || "Preparing"}</span>
              </p>
            </div>
            <div className="rounded-2xl border border-forest/10 bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-forest/45">Status</p>
              <p className="mt-2 text-sm font-semibold text-forest capitalize">{order.status}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Timeline */}
            <div className="overflow-hidden rounded-3xl border border-forest/15 bg-white/80 p-6 shadow-[0_12px_35px_rgba(46,75,36,0.06)]">
              <h2 className="text-xl font-semibold text-forest mb-4">Order Status</h2>
              <OrderTimeline status={order.status} shipmentStatus={order.shiprocket_status} />
            </div>

            {/* Order Items */}
            <div className="overflow-hidden rounded-3xl border border-forest/15 bg-white/80 p-6 shadow-[0_12px_35px_rgba(46,75,36,0.06)]">
              <h2 className="text-xl font-semibold text-forest mb-4">Order Items</h2>
              <div className="space-y-4">
                {orderItems.map((item: any) => {
                  const productSlug = item.products?.slug;
                  
                  const itemContent = (
                    <>
                      <div className="w-20 h-20 bg-gradient-to-br from-forest/10 to-moss/10 rounded-lg flex items-center justify-center shrink-0">
                        <Package size={32} className="text-forest/40" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-forest">{item.name}</h3>
                        <p className="text-sm text-forest/60">Quantity: {item.quantity}</p>
                        <p className="text-sm text-forest/60">Price: {formatCurrency(item.unit_price)}</p>
                        {productSlug && (
                          <p className="text-xs text-forest/50 mt-1">Click to view product →</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-forest">
                          {formatCurrency(item.unit_price * item.quantity)}
                        </p>
                      </div>
                    </>
                  );
                  
                  return productSlug ? (
                    <Link
                      key={item.id}
                      href={`/products/${productSlug}`}
                      className="flex items-center gap-4 rounded-2xl border border-forest/10 bg-cream/20 p-4 transition-all hover:border-forest/25 hover:bg-cream/35"
                    >
                      {itemContent}
                    </Link>
                  ) : (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-2xl border border-forest/10 bg-cream/20 p-4"
                    >
                      {itemContent}
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="mt-6 grid gap-3 border-t border-forest/15 pt-6 sm:grid-cols-3">
                <div className="rounded-2xl bg-forest/5 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-forest/45">Subtotal</p>
                  <p className="mt-2 text-base font-semibold text-forest">{formatCurrency(orderTotal)}</p>
                </div>
                <div className="rounded-2xl bg-forest/5 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-forest/45">Shipping</p>
                  <p className="mt-2 text-base font-semibold text-forest">{formatCurrency(0)}</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-forest to-moss p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/70">Total</p>
                  <p className="mt-2 text-lg font-bold">{formatCurrency(order.total_amount)}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Review Section - Only if delivered */}
            {order.status === "delivered" && orderItems.length > 0 && (
              <ReviewSection
                orderId={order.id}
                orderItems={orderItems.map((item: any) => ({
                  id: item.id,
                  product_id: item.product_id,
                  name: item.name || item.products?.name || "Product"
                }))}
                reviewedList={reviewedList}
              />
            )}

            {/* Payment Info */}
            <div className="rounded-3xl border border-forest/15 bg-white/80 p-6 shadow-[0_12px_35px_rgba(46,75,36,0.06)]">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={20} className="text-forest" />
                <h3 className="font-semibold text-forest">Payment Information</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-forest/70">
                  <span>Status</span>
                  <span className={order.payment_status === "paid" ? "text-emerald-700 font-medium" : "text-amber-700 font-medium"}>
                    {order.payment_status === "paid" ? "Paid" : "Pending"}
                  </span>
                </div>
                {order.notes && (
                  <div className="rounded-2xl bg-cream/30 p-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-forest/45">Method</p>
                    <p className="mt-2 break-words font-medium text-forest">
                      {order.notes.replace("Payment method: ", "")}
                    </p>
                  </div>
                )}
                {order.razorpay_payment_id && (
                  <div className="rounded-2xl bg-cream/30 p-3">
                    <span className="text-xs uppercase tracking-[0.22em] text-forest/45">Transaction ID</span>
                    <p className="mt-2 break-all font-mono text-xs text-forest">
                      {order.razorpay_payment_id}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Tracking */}
            <CustomerTrackingPanel order={order} />

            {/* Help */}
            <div className="rounded-3xl border border-forest/15 bg-gradient-to-br from-forest/5 to-white p-6">
              <h3 className="font-semibold text-forest mb-2">Need Help?</h3>
              <p className="text-sm text-forest/70 mb-4">
                Have questions about your order? We're here to help!
              </p>
              <Link href="/contact">
                <Button variant="outline" className="w-full border-forest/30 text-forest hover:bg-forest/5">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
