import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data: orders } = await supabase.from("orders").select("*").gte("created_at", `${today}T00:00:00Z`);
  const { count: pending } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending");
  const { count: printing } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "printing");
  const { count: completed } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "delivered");
  const { count: totalUploads } = await supabase.from("stl_uploads").select("*", { count: "exact", head: true });
  const { count: todayUploads } = await supabase.from("stl_uploads").select("*", { count: "exact", head: true }).gte("created_at", `${today}T00:00:00Z`);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Overview of your business</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          ["Revenue Today", `₹${(orders?.reduce((sum: number, order: any) => sum + Number(order.total_amount ?? 0), 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
          ["Orders Today", orders?.length ?? 0],
          ["Currently Printing", printing ?? 0],
          ["Completed Orders", completed ?? 0],
          ["STL Uploads Today", todayUploads ?? 0],
          ["Total STL Uploads", totalUploads ?? 0]
        ].map(([label, value]) => (
          <div key={label as string} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <p className="text-sm text-gray-400 mb-2">{label as string}</p>
            <p className="text-2xl font-semibold text-white">{String(value ?? 0)}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-medium text-white mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <a href="/admin/products/new" className="bg-black border border-gray-700 rounded-lg p-4 text-center text-sm text-gray-300 hover:text-white hover:border-gray-600 transition-colors">
            Add Product
          </a>
          <a href="/admin/products/bulk-upload" className="bg-black border border-gray-700 rounded-lg p-4 text-center text-sm text-gray-300 hover:text-white hover:border-gray-600 transition-colors">
            Bulk Upload
          </a>
          <a href="/admin/orders" className="bg-black border border-gray-700 rounded-lg p-4 text-center text-sm text-gray-300 hover:text-white hover:border-gray-600 transition-colors">
            View Orders
          </a>
          <a href="/admin/inventory" className="bg-black border border-gray-700 rounded-lg p-4 text-center text-sm text-gray-300 hover:text-white hover:border-gray-600 transition-colors">
            Manage Inventory
          </a>
        </div>
      </div>
    </div>
  );
}