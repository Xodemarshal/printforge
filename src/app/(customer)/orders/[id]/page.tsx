import { getOrderById, cancelOrderAction } from "@/actions/orders";
import { submitReviewAction } from "@/actions/reviews";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { formatCurrency } from "@/lib/utils";
import { Package, CreditCard, Calendar, Truck, ChevronLeft, ClipboardList, ExternalLink } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
export const dynamic = "force-dynamic";
export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  
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

            {/* Review Section - Only if delivered */}
            {order.status === "delivered" && orderItems.length > 0 && (
              <div className="bg-cream/30 border border-forest/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-forest mb-4">Leave a Review</h2>
                <form action={async (formData) => {
                  "use server";
                  await submitReviewAction(formData);
                  revalidatePath(`/orders/${order.id}`);
                }} className="space-y-4">
                  <input type="hidden" name="orderItemId" value={orderItems[0].id} />
                  <input type="hidden" name="productId" value={orderItems[0].product_id} />
                  
                  <div>
                    <label className="block text-sm font-medium text-forest mb-2">
                      Rating (1-5 stars)
                    </label>
                    <Input 
                      name="rating" 
                      type="number" 
                      min="1" 
                      max="5" 
                      placeholder="5"
                      className="border-forest/30 focus:border-forest"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-forest mb-2">
                      Your Review
                    </label>
                    <Textarea 
                      name="comment" 
                      placeholder="Share your experience with this product..."
                      rows={4}
                      className="border-forest/30 focus:border-forest resize-none"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full bg-forest hover:bg-forest-dark text-white"
                  >
                    Submit Review
                  </Button>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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

            {/* Shipping Info */}
              <div className="bg-cream/30 border border-forest/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck size={20} className="text-forest" />
                <h3 className="font-semibold text-forest">Shipping Information</h3>
              </div>
              <div className="space-y-3 text-sm text-forest/70">
                {order.shiprocket_awb_number ? (
                  <div className="rounded-xl border border-forest/10 bg-white/60 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-forest/40">AWB</p>
                    <p className="mt-1 font-mono text-forest">{order.shiprocket_awb_number}</p>
                  </div>
                ) : null}
                {order.shiprocket_courier_name ? (
                  <div className="rounded-xl border border-forest/10 bg-white/60 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-forest/40">Courier</p>
                    <p className="mt-1 text-forest">{order.shiprocket_courier_name}</p>
                  </div>
                ) : null}
                {order.shiprocket_tracking_url ? (
                  <a
                    href={order.shiprocket_tracking_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-forest hover:text-forest-dark transition-colors"
                  >
                    Track Order <ExternalLink size={14} />
                  </a>
                ) : null}
                {order.shiprocket_label_pdf_url ? (
                  <a
                    href={order.shiprocket_label_pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-forest hover:text-forest-dark transition-colors"
                  >
                    Download Label <ExternalLink size={14} />
                  </a>
                ) : null}
                {order.shipping_line1 ? (
                  <div className="rounded-xl border border-forest/10 bg-white/60 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-forest/40">Delivery Address</p>
                    <p className="mt-1 text-forest">{order.customer_name || "Customer"}</p>
                    <p>{order.shipping_line1}</p>
                    {order.shipping_line2 && <p>{order.shipping_line2}</p>}
                    <p>{order.shipping_city}, {order.shipping_state} - {order.shipping_postal_code}</p>
                    <p>{order.shipping_country}</p>
                  </div>
                ) : (
                  <p>No shipping address available</p>
                )}
              </div>
            </div>

            {Array.isArray(order.shiprocket_tracking_events) && order.shiprocket_tracking_events.length > 0 && (
              <div className="bg-cream/30 border border-forest/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ClipboardList size={20} className="text-forest" />
                  <h3 className="font-semibold text-forest">Tracking Timeline</h3>
                </div>
                <div className="space-y-3">
                  {order.shiprocket_tracking_events.map((event: any, index: number) => (
                    <div key={`${event.timestamp || index}-${index}`} className="rounded-xl border border-forest/10 bg-white/60 p-3">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold text-forest capitalize">{String(event.raw_status || event.shiprocket_status || "update").replace(/_/g, " ")}</p>
                        <p className="text-xs text-forest/50">
                          {event.timestamp ? new Date(event.timestamp).toLocaleString() : "Just now"}
                        </p>
                      </div>
                      {event.payload?.description && <p className="mt-1 text-sm text-forest/70">{event.payload.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
