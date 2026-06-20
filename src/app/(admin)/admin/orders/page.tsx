import { createAdminClient } from "@/lib/supabase/admin";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ExternalLink, Truck } from "lucide-react";

export const dynamic = "force-dynamic";

const shipmentBadge = (status?: string | null) => {
  const value = String(status ?? "not_generated");
  if (value === "delivered") return "bg-green-900/20 text-green-400 border-green-800";
  if (value === "picked_up" || value === "in_transit" || value === "out_for_delivery") return "bg-blue-900/20 text-blue-400 border-blue-800";
  if (value === "label_generated" || value === "manifested") return "bg-indigo-900/20 text-indigo-400 border-indigo-800";
  if (value === "not_picked_up" || value === "not_generated") return "bg-yellow-900/20 text-yellow-400 border-yellow-800";
  return "bg-gray-900/20 text-gray-400 border-gray-800";
};

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; customer?: string; awb?: string; courier?: string; pickup?: string }>;
}) {
  const params = await searchParams;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("orders")
    .select(`
      *,
      users (
        name,
        email
      ),
      order_items (
        id
      )
    `)
    .order("created_at", { ascending: false })
    .limit(200);

  const filtered = (data ?? []).filter((order: any) => {
    const statusMatch = !params.status || String(order.status ?? "").toLowerCase().includes(params.status.toLowerCase());
    const customerMatch = !params.customer || `${order.users?.name ?? ""} ${order.users?.email ?? ""}`.toLowerCase().includes(params.customer.toLowerCase());
    const awbMatch = !params.awb || String(order.shiprocket_awb_number ?? "").toLowerCase().includes(params.awb.toLowerCase());
    const courierMatch = !params.courier || String(order.shiprocket_courier_name ?? "").toLowerCase().includes(params.courier.toLowerCase());
    const pickupMatch = !params.pickup || String(order.shiprocket_pickup_status ?? "").toLowerCase().includes(params.pickup.toLowerCase());
    return statusMatch && customerMatch && awbMatch && courierMatch && pickupMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Orders</h1>
          <p className="text-gray-400 mt-1">Manage customer orders, shipment labels, and Shiprocket tracking.</p>
        </div>
        <Link href="/admin/shipping/not-picked-up" className="inline-flex items-center gap-2 text-sm text-forest-green hover:text-forest-green/80">
          <Truck size={16} />
          Not Picked Up Queue
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <form action="/admin/orders" method="get" className="grid gap-4 md:grid-cols-5">
          <Input name="status" placeholder="Order status" defaultValue={params.status} className="bg-black border-gray-700 text-white placeholder:text-gray-400" />
          <Input name="customer" placeholder="Customer name or email" defaultValue={params.customer} className="bg-black border-gray-700 text-white placeholder:text-gray-400" />
          <Input name="awb" placeholder="Search AWB" defaultValue={params.awb} className="bg-black border-gray-700 text-white placeholder:text-gray-400" />
          <Input name="courier" placeholder="Courier name" defaultValue={params.courier} className="bg-black border-gray-700 text-white placeholder:text-gray-400" />
          <Input name="pickup" placeholder="Pickup status" defaultValue={params.pickup} className="bg-black border-gray-700 text-white placeholder:text-gray-400" />
          <div className="md:col-span-5 flex gap-3">
            <Button type="submit" variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:border-gray-600">
              Filter
            </Button>
            {(params.status || params.customer || params.awb || params.courier || params.pickup) && (
              <Link href="/admin/orders" className="px-4 py-2 text-sm border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 rounded-lg transition-colors">
                Clear
              </Link>
            )}
          </div>
        </form>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black border-b border-gray-800">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Order ID</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Customer</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Shipment</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">AWB</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Pickup</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Total</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Date</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-white">#{order.id?.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="text-white font-medium">{order.users?.name}</div>
                    <div className="text-gray-500 text-xs">{order.users?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${shipmentBadge(order.shiprocket_status)}`}>
                      {String(order.shiprocket_status || order.status || "not_generated").replace(/_/g, " ")}
                    </div>
                    <div className="mt-2 text-xs text-gray-400">{order.shiprocket_courier_name || "Auto assigned"}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    <div className="font-mono text-white">{order.shiprocket_awb_number || "Pending"}</div>
                    {order.shiprocket_label_pdf_url && (
                      <a href={order.shiprocket_label_pdf_url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-forest-green hover:text-forest-green/80">
                        Label PDF <ExternalLink size={12} />
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 capitalize">
                    {String(order.shiprocket_pickup_status || "not picked up").replace(/_/g, " ")}
                  </td>
                  <td className="px-6 py-4 text-sm text-white">₹{Number(order.total_amount || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="text-sm text-forest-green hover:text-forest-green/80 font-medium">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No orders found.
          </div>
        )}
      </div>
    </div>
  );
}
