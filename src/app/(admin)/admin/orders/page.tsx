import { createAdminClient } from "@/lib/supabase/admin";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; customer?: string }>;
}) {
  const params = await searchParams;
  const supabase = createAdminClient();
  let query = supabase.from("orders").select("*").limit(100);
  if (params.status) query = query.eq("status", params.status);
  if (params.customer) query = query.eq("user_id", params.customer);
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
            className="bg-black border-gray-700 text-white placeholder:text-gray-400"
          />
          <Input 
            name="customer" 
            placeholder="Filter by customer ID..." 
            className="bg-black border-gray-700 text-white placeholder:text-gray-400"
          />
          <Button type="submit" variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:border-gray-600">
            Filter
          </Button>
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
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Total</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {(data ?? []).map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-white">{order.id?.slice(0, 8)}...</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{order.user_id?.slice(0, 8)}...</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-900/20 text-green-400 border border-green-800' :
                      order.status === 'processing' ? 'bg-blue-900/20 text-blue-400 border border-blue-800' :
                      order.status === 'pending' ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-800' :
                      'bg-gray-900/20 text-gray-400 border border-gray-800'
                    }`}>
                      {order.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">${(Number(order.total_amount || 0) / 100).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!data || data.length === 0) && (
          <div className="text-center py-8 text-gray-400">
            No orders found.
          </div>
        )}
      </div>
    </div>
  );
}
