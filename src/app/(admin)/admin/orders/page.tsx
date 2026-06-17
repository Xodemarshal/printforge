import { createAdminClient } from "@/lib/supabase/admin";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; customer?: string }>;
}) {
  const params = await searchParams;
  const supabase = createAdminClient();
  
  let query = supabase
    .from("orders")
    .select(`
      *,
      users!inner (
        name,
        email
      ),
      order_items (
        id
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (params.status) query = query.eq("status", params.status);
  if (params.customer) query = query.ilike("users.name", `%${params.customer}%`);

  const { data } = await query;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Orders</h1>
        <p className="text-gray-400 mt-1">Manage customer orders and printing queue</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <form action="/admin/orders" method="get" className="flex gap-4">
          <Input 
            name="status" 
            placeholder="Filter by status..." 
            defaultValue={params.status}
            className="bg-black border-gray-700 text-white placeholder:text-gray-400"
          />
          <Input 
            name="customer" 
            placeholder="Filter by customer name..." 
            defaultValue={params.customer}
            className="bg-black border-gray-700 text-white placeholder:text-gray-400"
          />
          <Button type="submit" variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:border-gray-600">
            Filter
          </Button>
          {(params.status || params.customer) && (
            <Link href="/admin/orders" className="px-4 py-2 text-sm border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 rounded-lg transition-colors">
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
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Order ID</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Customer</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Items</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Total</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Date</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {(data ?? []).map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-white">#{order.id?.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="text-white font-medium">{order.users?.name}</div>
                    <div className="text-gray-500 text-xs">{order.users?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {order.order_items?.length || 0} items
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      order.status === 'delivered' ? 'bg-green-900/20 text-green-400 border-green-800' :
                      order.status === 'processing' || order.status === 'printing' ? 'bg-blue-900/20 text-blue-400 border-blue-800' :
                      order.status === 'pending' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800' :
                      order.status === 'cancelled' || order.status === 'rejected' ? 'bg-red-900/20 text-red-400 border-red-800' :
                      'bg-gray-900/20 text-gray-400 border-gray-800'
                    }`}>
                      {order.status || 'pending'}
                    </span>
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
        {(!data || data.length === 0) && (
          <div className="text-center py-12 text-gray-400">
            No orders found.
          </div>
        )}
      </div>
    </div>
  );
}
