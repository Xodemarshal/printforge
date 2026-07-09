import { getOrderById, cancelOrderAction } from "@/actions/orders";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { ReviewSection } from "@/components/orders/ReviewSection";
import { CustomerTrackingPanel } from "@/components/shipping/CustomerTrackingPanel";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { Package, CreditCard, Calendar, ChevronLeft } from "lucide-react";
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
        <div className="bg-cream/30 border border-forest/20 rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-forest mb-2">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <div className="flex items-center gap-4 text-sm text-forest/60">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Placed on {new Date(order.created_at).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}</span>
                </div>
              </div>
            </div>
            
            {["pending", "confirmed"].includes(order.status) && (
              <form action={async (formData) => {
                "use server";
                await cancelOrderAction(formData);
                revalidatePath(`/orders/${order.id}`);
              }}>
                <input type="hidden" name="id" value={order.id} />
                <Button type="submit" variant="outline" className="border-red-500 text-red-600 hover:bg-red-50">
                  Cancel Order
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Timeline */}
            <div className="bg-cream/30 border border-forest/20 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-forest mb-4">Order Status</h2>
              <OrderTimeline status={order.status} shipmentStatus={order.shiprocket_status} />
            </div>

            {/* Order Items */}
            <div className="bg-cream/30 border border-forest/20 rounded-2xl p-6">
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
                      className="flex items-center gap-4 p-4 bg-white/50 border border-forest/10 rounded-xl hover:bg-white/70 hover:border-forest/30 transition-all"
                    >
                      {itemContent}
                    </Link>
                  ) : (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-white/50 border border-forest/10 rounded-xl"
                    >
                      {itemContent}
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-forest/20 space-y-2">
                <div className="flex justify-between text-forest/70">
                  <span>Subtotal</span>
                  <span>{formatCurrency(orderTotal)}</span>
                </div>
                <div className="flex justify-between text-forest/70">
                  <span>Shipping</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-forest pt-2 border-t border-forest/20">
                  <span>Total</span>
                  <span>{formatCurrency(order.total_amount)}</span>
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
            <div className="bg-cream/30 border border-forest/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={20} className="text-forest" />
                <h3 className="font-semibold text-forest">Payment Information</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-forest/60">Status</span>
                  <span className={`font-medium ${
                    order.payment_status === 'paid' 
                      ? 'text-green-600' 
                      : 'text-yellow-600'
                  }`}>
                    {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>
                {order.notes && (
                  <div className="flex justify-between">
                    <span className="text-forest/60">Method</span>
                    <span className="font-medium text-forest">
                      {order.notes.replace('Payment method: ', '')}
                    </span>
                  </div>
                )}
                {order.razorpay_payment_id && (
                  <div className="pt-2 border-t border-forest/10">
                    <span className="text-forest/60 text-xs">Transaction ID</span>
                    <p className="text-forest font-mono text-xs mt-1 break-all">
                      {order.razorpay_payment_id}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Tracking */}
            <CustomerTrackingPanel order={order} />

            {/* Help */}
            <div className="bg-cream/30 border border-forest/20 rounded-2xl p-6">
              <h3 className="font-semibold text-forest mb-2">Need Help?</h3>
              <p className="text-sm text-forest/70 mb-4">
                Have questions about your order? We're here to help!
              </p>
              <Link href="/contact">
                <Button variant="outline" className="w-full border-forest text-forest hover:bg-forest/5">
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
