import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { ExternalLink, Truck, ShoppingBag, IndianRupee, TrendingUp, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

const shipmentBadge = (status?: string | null) => {
  const s = String(status ?? "pending");
  if (s === "delivered") return "bg-green-900/20 text-green-400 border-green-800";
  if (s === "picked_up" || s === "in_transit" || s === "out_for_delivery") return "bg-blue-900/20 text-blue-400 border-blue-800";
  if (s === "label_generated" || s === "manifested") return "bg-indigo-900/20 text-indigo-400 border-indigo-800";
  if (s === "not_picked_up" || s === "not_generated") return "bg-yellow-900/20 text-yellow-400 border-yellow-800";
  return "bg-gray-900/20 text-gray-400 border-gray-800";
};

const paymentBadge = (status?: string | null) => {
  if (status === "paid") return "bg-green-900/30 text-green-400";
  if (status === "pending") return "bg-yellow-900/30 text-yellow-400";
  if (status === "failed") return "bg-red-900/30 text-red-400";
  return "bg-gray-800 text-gray-500";
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; customer?: string; awb?: string; payment?: string }>;
}) {
  const params = await searchParams;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("orders")
    .select("id, customer_name, customer_email, total_amount, profit_amount, payment_status, status, shiprocket_status, shiprocket_awb_number, shiprocket_courier_name, shiprocket_pickup_status, shiprocket_label_pdf_url, created_at, order_items(id)")
    .order("created_at", { ascending: false })
    .limit(200);

  const filtered = (data ?? []).filter((order: any) => {
    const statusMatch = !params.status || String(order.status ?? "").toLowerCase().includes(params.status.toLowerCase());
    const customerMatch = !params.customer || `${order.customer_name ?? ""} ${order.customer_email ?? ""}`.toLowerCase().includes(params.customer.toLowerCase());
    const awbMatch = !params.awb || String(order.shiprocket_awb_number ?? "").toLowerCase().includes(params.awb.toLowerCase());
    const paymentMatch = !params.payment || String(order.payment_status ?? "").toLowerCase() === params.payment.toLowerCase();
    return statusMatch && customerMatch && awbMatch && paymentMatch;
  });

  const totalRevenue = filtered.reduce((s: number, o: any) => s + Number(o.total_amount || 0), 0);
  const totalProfit = filtered.reduce((s: number, o: any) => s + Number(o.profit_amount || 0), 0);
  const paidCount = filtered.filter((o: any) => o.payment_status === "paid").length;
  const hasFilters = params.status || params.customer || params.awb || params.payment;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Orders</h1>
          <p className="text-gray-400 mt-1">Manage customer orders, shipment labels, and Shiprocket tracking.</p>
        </div>
        <Link href="/admin/shipping/not-picked-up"
          className="inline-flex items-center gap-2 text-sm text-forest-green hover:text-forest-green/80">
          <Truck size={16} /> Not Picked Up Queue
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Showing", value: filtered.length, icon: ShoppingBag, color: "text-gray-300" },
          { label: "Paid", value: paidCount, icon: IndianRupee, color: "text-green-400" },
          { label: "Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-green-400" },
          { label: "Net Profit", value: totalProfit !== 0 ? `₹${totalProfit.toLocaleString("en-IN")}` : "—", icon: TrendingUp, color: totalProfit >= 0 ? "text-green-400" : "text-red-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <Icon size={14} className={`${color} mb-2`} />
            <p className={`text-lg font-bold ${color}`}>{value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <form action="/admin/orders" method="get" className="flex flex-wrap gap-3 items-center">
          <Filter size={14} className="text-gray-500" />
          <input name="customer" placeholder="Customer name or email" defaultValue={params.customer}
            className="bg-black border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-forest-green outline-none w-48" />
          <input name="status" placeholder="Order status" defaultValue={params.status}
            className="bg-black border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-forest-green outline-none w-36" />
          <input name="awb" placeholder="AWB number" defaultValue={params.awb}
            className="bg-black border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-forest-green outline-none w-36" />
          <select name="payment" defaultValue={params.payment ?? ""}
            className="bg-black border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-forest-green outline-none">
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <button type="submit" className="px-4 py-2 bg-forest-green hover:bg-forest-green/90 text-white rounded-lg text-sm font-medium transition-colors">
            Filter
          </button>
          {hasFilters && (
            <Link href="/admin/orders" className="px-4 py-2 border border-gray-700 text-gray-400 hover:text-white rounded-lg text-sm transition-colors">
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black border-b border-gray-800">
              <tr>
                {["Order ID", "Customer", "Payment", "Shipment", "AWB", "Revenue", "Profit", "Date", "Action"].map(h => (
                  <th key={h} className={`px-5 py-3 text-sm font-medium text-gray-300 ${h === "Revenue" || h === "Profit" || h === "Action" ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((order: any) => {
                const profit = Number(order.profit_amount);
                const hasProfit = order.profit_amount !== null && order.profit_amount !== undefined;
                const itemCount = Array.isArray(order.order_items) ? order.order_items.length : 0;
                return (
                  <tr key={order.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-4 text-sm">
                      <p className="font-mono text-white">#{order.id?.slice(0, 8)}</p>
                      <p className="text-gray-500 text-xs">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <p className="text-white font-medium">{order.customer_name || "—"}</p>
                      <p className="text-gray-500 text-xs truncate max-w-[140px]">{order.customer_email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${paymentBadge(order.payment_status)}`}>
                        {order.payment_status || "unknown"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${shipmentBadge(order.shiprocket_status)}`}>
                        {String(order.shiprocket_status || order.status || "not_generated").replace(/_/g, " ")}
                      </div>
                      {order.shiprocket_courier_name && (
                        <p className="text-gray-500 text-xs mt-1">{order.shiprocket_courier_name}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <p className="font-mono text-white text-xs">{order.shiprocket_awb_number || "Pending"}</p>
                      {order.shiprocket_label_pdf_url && (
                        <a href={order.shiprocket_label_pdf_url} target="_blank" rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-forest-green hover:text-forest-green/80">
                          Label <ExternalLink size={10} />
                        </a>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-white text-right font-medium">
                      ₹{Number(order.total_amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-4 text-sm text-right">
                      {hasProfit ? (
                        <span className={`font-medium ${profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                          ₹{profit.toLocaleString("en-IN")}
                        </span>
                      ) : <span className="text-gray-600">—</span>}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/admin/orders/${order.id}` as any}
                        className="text-sm text-forest-green hover:text-forest-green/80 font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">No orders found.</div>
        )}
      </div>
    </div>
  );
}
