import { getOrderById, cancelOrderAction } from "@/actions/orders";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { RetryPaymentButton } from "@/components/orders/RetryPaymentButton";
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
          <Package size={64} className="text-cream/20 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-cream mb-2">Order not found</h1>
          <p className="text-cream/60 mb-8">We couldn't find the order you're looking for.</p>
          <Link 
            href="/orders"
            className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-500 transition-colors"
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
  const deliveryPartner = order.shiprocket_courier_name || order.courier_name || "Preparing";
  const awbNumber = order.shiprocket_awb_number || order.tracking_number || "Pending";
  const trackingUrl = order.shiprocket_tracking_url || order.tracking_url || null;
  const shippingMode = order.shipping_mode || "AUTOMATIC";
  const canRetryPayment = order.payment_status === "pending" && Boolean(order.razorpay_order_id) && Boolean(process.env.RAZORPAY_KEY_ID);

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
          className="inline-flex items-center gap-2 text-cream/50 hover:text-cream transition-colors mb-6"
        >
          <ChevronLeft size={20} />
          Back to Orders
        </Link>

        {/* Header */}
        <div className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_10px_24px_rgba(0,0,0,0.2)]">
          <div className="border-b border-white/10 px-6 py-5 sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-400/80">Order Detail</p>
                <h1 className="mt-2 text-2xl font-bold text-emerald-400 sm:text-3xl">
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </h1>
                <p className="mt-2 flex items-center gap-2 text-sm text-cream/50">
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
                  <Button type="submit" variant="outline" className="border-red-500/40 text-red-400 hover:bg-red-500/10">
                    Cancel Order
                  </Button>
                </form>
              )}
            </div>
          </div>

          <div className="grid gap-3 px-6 py-5 sm:grid-cols-2 xl:grid-cols-4 sm:px-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-cream/40">Order Number</p>
              <p className="mt-2 break-all font-mono text-sm font-semibold text-cream">{order.id}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-cream/40">Payment</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-cream">
                <CheckCircle2 size={16} className={order.payment_status === "paid" ? "text-emerald-400" : "text-amber-400"} />
                <span className="capitalize">{order.payment_status}</span>
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-cream/40">Shipping</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-cream">
                <Truck size={16} className="text-cream/60" />
                <span>{order.shiprocket_courier_name || order.courier_name || "Preparing"}</span>
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-cream/40">Status</p>
              <p className="mt-2 text-sm font-semibold text-cream capitalize">{order.status}</p>
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-cream/40">Delivery Partner</p>
            <p className="mt-2 break-words text-sm font-medium text-cream">{deliveryPartner}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-cream/40">AWB / Tracking</p>
            <p className="mt-2 break-all font-mono text-sm font-semibold text-cream">{awbNumber}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-cream/40">Tracking Link</p>
            {trackingUrl ? (
              <a
                href={trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block break-all text-sm font-medium text-emerald-400 underline decoration-emerald-400/30 underline-offset-4 hover:text-emerald-300"
              >
                Open tracking page
              </a>
            ) : (
              <p className="mt-2 text-sm text-cream/40">Not available yet</p>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-cream/40">Shipping Mode</p>
            <p className="mt-2 text-sm font-semibold text-cream">{shippingMode}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Timeline */}
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-[0_10px_24px_rgba(0,0,0,0.2)]">
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">Order Status</h2>
              <OrderTimeline status={order.status} shipmentStatus={order.shiprocket_status} shippingMode={shippingMode} />
            </div>

            {/* Order Items */}
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-[0_10px_24px_rgba(0,0,0,0.2)]">
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">Order Items</h2>
              <div className="space-y-4">
                {orderItems.map((item: any) => {
                  const productSlug = item.products?.slug;
                  
                  const itemContent = (
                    <>
                      <div className="w-20 h-20 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center shrink-0">
                        <Package size={32} className="text-cream/20" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-cream">{item.name}</h3>
                        <p className="text-sm text-cream/50">Quantity: {item.quantity}</p>
                        <p className="text-sm text-cream/50">Price: {formatCurrency(item.unit_price)}</p>
                        {productSlug && (
                          <p className="text-xs text-cream/40 mt-1">Click to view product →</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-cream">
                          {formatCurrency(item.unit_price * item.quantity)}
                        </p>
                      </div>
                    </>
                  );
                  
                  return productSlug ? (
                    <Link
                      key={item.id}
                      href={`/products/${productSlug}`}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20 hover:bg-white/[0.07]"
                    >
                      {itemContent}
                    </Link>
                  ) : (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      {itemContent}
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="mt-6 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-cream/40">Subtotal</p>
                  <p className="mt-2 text-base font-semibold text-cream">{formatCurrency(orderTotal)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-cream/40">Shipping</p>
                  <p className="mt-2 text-base font-semibold text-cream">{formatCurrency(0)}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-cream/40">Total</p>
                  <p className="mt-2 text-lg font-bold text-cream">{formatCurrency(order.total_amount)}</p>
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
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-[0_10px_24px_rgba(0,0,0,0.2)]">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={20} className="text-cream" />
                <h3 className="font-semibold text-cream">Payment Information</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-cream/60">
                  <span>Status</span>
                  <span className={order.payment_status === "paid" ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
                    {order.payment_status === "paid" ? "Paid" : "Pending"}
                  </span>
                </div>
                {order.notes && (
              <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-cream/40">Method</p>
                    <p className="mt-2 break-words font-medium text-cream">
                      {order.notes.replace("Payment method: ", "")}
                    </p>
                  </div>
                )}
                {order.razorpay_payment_id && (
              <div className="rounded-2xl bg-white/5 p-3">
                    <span className="text-xs uppercase tracking-[0.22em] text-cream/40">Transaction ID</span>
                    <p className="mt-2 break-all font-mono text-xs text-cream">
                      {order.razorpay_payment_id}
                    </p>
                  </div>
                )}
                {canRetryPayment && (
                  <div className="pt-2">
                    <RetryPaymentButton
                      orderId={order.id}
                      razorpayOrderId={order.razorpay_order_id}
                      razorpayKeyId={process.env.RAZORPAY_KEY_ID || ""}
                      amount={Number(order.total_amount || 0)}
                      customerName={order.customer_name}
                      customerEmail={order.customer_email}
                      customerPhone={order.shipping_phone}
                    />
                    <p className="mt-2 text-xs text-cream/40">
                      Your order is saved. Tap Pay Now to reopen Razorpay and complete the payment.
                    </p>
                  </div>
                )}
                {order.payment_status !== "paid" && !canRetryPayment && (
                  <p className="text-xs text-cream/40">
                    This order is waiting for payment. If the checkout was closed, please contact support to retry.
                  </p>
                )}
              </div>
            </div>

            {/* Shipping Tracking */}
            <CustomerTrackingPanel order={order} />

            {/* Help */}
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-[0_10px_24px_rgba(0,0,0,0.2)]">
              <h3 className="font-semibold text-cream mb-2">Need Help?</h3>
              <p className="text-sm text-cream/50 mb-4">
                Have questions about your order? We're here to help!
              </p>
              <Link href="/contact">
                <Button variant="outline" className="w-full border-white/20 text-cream hover:bg-white/10">
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
