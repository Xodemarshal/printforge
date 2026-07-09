import { createAdminClient } from "@/lib/supabase/admin";
import { syncShiprocketOrderAction, updateOrderStatusAction } from "@/actions/orders";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ORDER_STATUSES } from "@/lib/constants";
import { AdminShippingPanel } from "@/components/shipping/AdminShippingPanel";
import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { RefreshCcw, Printer, Truck, ExternalLink, Calendar, Package, CreditCard, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      users (
        name,
        email,
        phone
      ),
      addresses (*),
      order_items (
        *,
        products (
          name,
          slug,
          image_url
        )
      )
    `)
    .eq("id", id)
    .single();

  if (!order) {
    return notFound();
  }

  const deliveryPartner = order.shiprocket_courier_name || order.courier_name || "Not specified";
  const trackingNumber = order.shiprocket_awb_number || order.tracking_number || "Pending";
  const shippingMode = order.shipping_mode || "AUTOMATIC";

  return (
    <div className="space-y-6 pb-12">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
        <div className="border-b border-white/10 px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.32em] text-emerald-300/80 mb-2">PrintForge Admin</p>
              <h1 className="text-3xl font-bold">Order Details</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/65">
                <Link href="/admin/orders" className="hover:text-white transition-colors">Orders</Link>
                <span>/</span>
                <span className="break-all font-mono text-white/80">#{order.id}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {order.shiprocket_label_pdf_url && (
                <a
                  href={order.shiprocket_label_pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 transition-colors hover:border-white/30 hover:bg-white/10"
                >
                  <Printer size={16} />
                  Print Label
                </a>
              )}
              {order.shiprocket_tracking_url && (
                <a
                  href={order.shiprocket_tracking_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 transition-colors hover:border-white/30 hover:bg-white/10"
                >
                  <ExternalLink size={16} />
                  Track Shipment
                </a>
              )}
              <form action={async (formData) => {
                "use server";
                await syncShiprocketOrderAction(formData);
              }}>
                <input type="hidden" name="id" value={order.id} />
                <Button type="submit" variant="outline" className="border-white/15 bg-white/5 text-white hover:border-white/30 hover:bg-white/10">
                  <RefreshCcw size={16} />
                  Sync Shiprocket
                </Button>
              </form>
              <form action={async (formData) => {
                "use server";
                await updateOrderStatusAction(formData);
                revalidatePath(`/admin/orders/${order.id}`);
              }} className="flex items-center gap-2">
                <input type="hidden" name="id" value={order.id} />
                <select
                  name="status"
                  defaultValue={order.status}
                  className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                >
                  {ORDER_STATUSES.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                <Button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-500 text-sm px-4 py-2">
                  Update Status
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="grid gap-3 px-6 py-5 sm:grid-cols-2 xl:grid-cols-4 sm:px-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-white/50">Order Number</p>
            <p className="mt-2 break-all font-mono text-sm font-semibold text-white">{order.id}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-white/50">Delivery Partner</p>
            <p className="mt-2 break-words text-sm font-semibold text-white">{deliveryPartner}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-white/50">Tracking Number</p>
            <p className="mt-2 break-all font-mono text-sm font-semibold text-white">{trackingNumber}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-white/50">Shipping Mode</p>
            <p className="mt-2 text-sm font-semibold text-white">{shippingMode}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="overflow-hidden border border-border/70 bg-card p-0 shadow-sm">
            <div className="border-b border-border/70 px-6 py-4">
              <h2 className="text-lg font-medium text-foreground">Order Items</h2>
            </div>
            <div className="divide-y divide-border/70">
              {order.order_items.map((item: any) => (
                <div key={item.id} className="flex gap-4 p-6">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-border/70 bg-muted">
                    {item.products?.image_url ? (
                      <img
                        src={item.products.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-foreground">{item.name || item.products?.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      ₹{Number(item.unit_price).toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      ₹{(Number(item.unit_price) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3 bg-muted/30 p-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">₹{Number(order.total_amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-red-500">-₹{Number(order.discount_amount || 0).toLocaleString()}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-emerald-600">₹{Number(order.total_amount - (order.discount_amount || 0)).toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <Card className="border border-border/70 bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-medium text-foreground">Payment Information</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                <Badge tone={order.payment_status === "paid" ? "success" : "warning"}>
                  {order.payment_status.toUpperCase()}
                </Badge>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                <p className="text-sm text-muted-foreground mb-1">Razorpay Order ID</p>
                <p className="break-all font-mono text-sm text-foreground">{order.razorpay_order_id || "N/A"}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                <p className="text-sm text-muted-foreground mb-1">Razorpay Payment ID</p>
                <p className="break-all font-mono text-sm text-foreground">{order.razorpay_payment_id || "N/A"}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="break-words text-sm text-foreground">{order.notes || "No notes provided"}</p>
              </div>
            </div>
          </Card>

          <Card className="border border-border/70 bg-card p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <Truck size={18} className="text-emerald-600" />
              <h2 className="text-lg font-medium text-foreground">Shipping Management</h2>
            </div>
            <AdminShippingPanel order={order} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border border-border/70 bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-medium text-foreground">Customer Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="break-words font-medium text-foreground">{order.users?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="break-all text-foreground">{order.users?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="break-words text-foreground">{order.users?.phone || "Not provided"}</p>
              </div>
            </div>
          </Card>

          <Card className="border border-border/70 bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-emerald-600" />
              <h2 className="text-lg font-medium text-foreground">Shipping Address</h2>
            </div>
            {order.addresses ? (
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{order.users?.name}</p>
                <p className="break-words">{order.addresses.line1}</p>
                {order.addresses.line2 && <p className="break-words">{order.addresses.line2}</p>}
                <p className="break-words">{order.addresses.city}, {order.addresses.state} - {order.addresses.postal_code}</p>
                <p className="break-words">{order.addresses.country}</p>
              </div>
            ) : (
              <p className="italic text-muted-foreground">No shipping address provided</p>
            )}
          </Card>

          <Card className="border border-border/70 bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-medium text-foreground">Order Status</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${
                    order.status === "delivered"
                      ? "bg-green-500"
                      : order.status === "cancelled"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                  }`}
                />
                <span className="capitalize text-foreground">{order.status}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Created on {new Date(order.created_at).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Last updated on {new Date(order.updated_at).toLocaleString()}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
