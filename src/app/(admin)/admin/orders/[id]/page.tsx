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
import { RefreshCcw, Printer, Truck, ExternalLink } from "lucide-react";

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

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-yellow-500/80 mb-1">PrintForge Admin</p>
          <h1 className="text-3xl font-bold text-white">Order Details</h1>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
            <Link href="/admin/orders" className="hover:text-white transition-colors">Orders</Link>
            <span>/</span>
            <span className="text-gray-500 font-mono">#{order.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {order.shiprocket_label_pdf_url && (
            <a
              href={order.shiprocket_label_pdf_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-gray-700 px-4 py-2 text-sm text-gray-200 hover:border-gray-500 hover:text-white"
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
              className="inline-flex items-center gap-2 rounded-md border border-gray-700 px-4 py-2 text-sm text-gray-200 hover:border-gray-500 hover:text-white"
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
            <Button type="submit" variant="outline" className="border-gray-700 text-gray-200 hover:border-gray-500 hover:text-white">
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
              className="bg-black border border-gray-700 text-white rounded-md px-3 py-2 text-sm focus:ring-forest-green focus:border-forest-green"
            >
              {ORDER_STATUSES.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <Button type="submit" className="bg-forest-green hover:bg-forest-green/90 text-white text-sm px-4 py-2">
              Update Status
            </Button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gray-900 border-gray-800 p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-medium text-white">Order Items</h2>
            </div>
            <div className="divide-y divide-gray-800">
              {order.order_items.map((item: any) => (
                <div key={item.id} className="p-6 flex gap-4">
                  <div className="h-20 w-20 bg-black rounded-lg overflow-hidden border border-gray-800 flex-shrink-0">
                    {item.products?.image_url ? (
                      <img
                        src={item.products.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-700">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{item.name || item.products?.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      ₹{Number(item.unit_price).toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">
                      ₹{(Number(item.unit_price) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-black/40 p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">₹{Number(order.total_amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Discount</span>
                <span className="text-red-400">-₹{Number(order.discount_amount || 0).toLocaleString()}</span>
              </div>
              <div className="h-px bg-gray-800" />
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-white">Total</span>
                <span className="text-forest-green">₹{Number(order.total_amount - (order.discount_amount || 0)).toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-6">
            <h2 className="text-lg font-medium text-white mb-4">Payment Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                <Badge tone={order.payment_status === "paid" ? "success" : "warning"}>
                  {order.payment_status.toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Razorpay Order ID</p>
                <p className="text-white font-mono text-sm">{order.razorpay_order_id || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Razorpay Payment ID</p>
                <p className="text-white font-mono text-sm">{order.razorpay_payment_id || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <p className="text-gray-300 text-sm">{order.notes || "No notes provided"}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-forest-green" />
                <h2 className="text-lg font-medium text-white">Shipping Management</h2>
              </div>
            </div>

            <AdminShippingPanel order={order} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gray-900 border-gray-800 p-6">
            <h2 className="text-lg font-medium text-white mb-4">Customer Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-white font-medium">{order.users?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-white">{order.users?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-white">{order.users?.phone || "Not provided"}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-6">
            <h2 className="text-lg font-medium text-white mb-4">Shipping Address</h2>
            {order.addresses ? (
              <div className="space-y-1 text-gray-300">
                <p className="text-white font-medium">{order.users?.name}</p>
                <p>{order.addresses.line1}</p>
                {order.addresses.line2 && <p>{order.addresses.line2}</p>}
                <p>{order.addresses.city}, {order.addresses.state} - {order.addresses.postal_code}</p>
                <p>{order.addresses.country}</p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No shipping address provided</p>
            )}
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-6">
            <h2 className="text-lg font-medium text-white mb-4">Order Status</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${
                  order.status === "delivered" ? "bg-green-500" :
                  order.status === "cancelled" ? "bg-red-500" : "bg-yellow-500"
                }`} />
                <span className="text-white capitalize">{order.status}</span>
              </div>
              <p className="text-sm text-gray-500">
                Created on {new Date(order.created_at).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                Last updated on {new Date(order.updated_at).toLocaleString()}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
