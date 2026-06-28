import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import {
  ShoppingBag, Printer, Users, IndianRupee, TrendingUp, Bell,
  Package, ClipboardList, Activity, FileText, MessageSquare,
  Layers, AlertTriangle, ArrowRight
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const todayStart = `${today}T00:00:00Z`;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: todayOrders },
    { count: printing },
    { count: delivered },
    { count: totalRequests },
    { count: pendingRequests },
    { data: recentOrders },
    { count: totalCustomers },
    { count: newCustomers },
    { data: alerts },
    { data: activeJobs },
    { count: pendingReviews },
    { data: inventoryItems },
  ] = await Promise.all([
    supabase.from("orders").select("total_amount, profit_amount").eq("payment_status", "paid").gte("created_at", todayStart),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "printing"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "delivered"),
    supabase.from("stl_uploads").select("*", { count: "exact", head: true }),
    supabase.from("stl_uploads").select("*", { count: "exact", head: true }).eq("status", "pending_review"),
    supabase.from("orders").select("id, customer_name, total_amount, payment_status, status, created_at").order("created_at", { ascending: false }).limit(6),
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("customers").select("*", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    supabase.from("admin_alerts").select("id, severity, status").eq("status", "unread").limit(50),
    supabase.from("print_jobs").select("id, printer_name, started_at").is("completed_at", null).eq("failed", false).limit(5),
    supabase.from("product_reviews").select("*", { count: "exact", head: true }).eq("approved", false),
    supabase.from("inventory").select("quantity, threshold"),
  ]);

  const revenueToday = (todayOrders || []).reduce((s, o) => s + Number(o.total_amount || 0), 0);
  const profitToday = (todayOrders || []).reduce((s, o) => s + Number(o.profit_amount || 0), 0);
  const unreadAlerts = (alerts || []).length;
  const criticalAlerts = (alerts || []).filter(a => a.severity === "critical").length;
  const lowStock = (inventoryItems || []).filter((item: any) => item.quantity < item.threshold).length;

  const kpiCards = [
    { label: "Revenue Today", value: `₹${revenueToday.toLocaleString("en-IN")}`, sub: profitToday !== 0 ? `₹${profitToday.toLocaleString("en-IN")} profit` : "Profit pending", icon: IndianRupee, accent: "text-green-400" },
    { label: "Orders Today", value: todayOrders?.length ?? 0, sub: `${delivered ?? 0} delivered total`, icon: ShoppingBag, accent: "text-blue-400" },
    { label: "Currently Printing", value: printing ?? 0, sub: `${activeJobs?.length ?? 0} active jobs`, icon: Printer, accent: "text-yellow-400" },
    { label: "Total Customers", value: totalCustomers ?? 0, sub: `+${newCustomers ?? 0} this month`, icon: Users, accent: "text-purple-400" },
  ];

  const operationsLinks = [
    { href: "/admin/print-farm", label: "Print Farm", icon: Printer, badge: activeJobs?.length ? `${activeJobs.length} active` : null, badgeColor: "bg-blue-900/40 text-blue-300" },
    { href: "/admin/product-reviews", label: "Product Reviews", icon: MessageSquare, badge: (pendingReviews ?? 0) > 0 ? `${pendingReviews} pending` : null, badgeColor: "bg-yellow-900/40 text-yellow-300" },
    { href: "/admin/alerts", label: "Alert Center", icon: Bell, badge: unreadAlerts > 0 ? `${unreadAlerts} unread` : null, badgeColor: criticalAlerts > 0 ? "bg-red-900/40 text-red-300" : "bg-yellow-900/40 text-yellow-300" },
    { href: "/admin/health", label: "Business Health", icon: Activity, badge: null, badgeColor: "" },
    { href: "/admin/reports", label: "Reports", icon: FileText, badge: null, badgeColor: "" },
    { href: "/admin/activity-log", label: "Activity Log", icon: ClipboardList, badge: null, badgeColor: "" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-yellow-500/80 mb-1">PrintForge Admin</p>
        <h1 className="text-3xl font-bold text-white">Control Center</h1>
        <p className="text-gray-400 mt-1 text-sm">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Critical alert banner */}
      {criticalAlerts > 0 && (
        <Link href="/admin/alerts"
          className="flex items-center gap-3 bg-red-950 border border-red-800 text-red-300 px-5 py-3 rounded-xl text-sm font-medium animate-pulse">
          <AlertTriangle size={16} /> {criticalAlerts} Critical Alert{criticalAlerts > 1 ? "s" : ""} — Click to view
        </Link>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map(({ label, value, sub, icon: Icon, accent }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <Icon size={18} className={`${accent} mb-3`} />
            <p className={`text-2xl font-bold ${accent}`}>{value}</p>
            <p className="text-white text-sm font-medium mt-1">{label}</p>
            <p className="text-gray-500 text-xs mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Attention pills */}
      {(unreadAlerts > 0 || (pendingRequests ?? 0) > 0 || (pendingReviews ?? 0) > 0 || (lowStock ?? 0) > 0) && (
        <div className="flex flex-wrap gap-2">
          {unreadAlerts > 0 && (
            <Link href="/admin/alerts" className="flex items-center gap-2 bg-yellow-950 border border-yellow-800/60 text-yellow-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-yellow-900/40 transition-colors">
              <Bell size={12} /> {unreadAlerts} unread alert{unreadAlerts > 1 ? "s" : ""}
            </Link>
          )}
          {(pendingRequests ?? 0) > 0 && (
            <Link href="/admin/print-queue" className="flex items-center gap-2 bg-green-950 border border-green-800/60 text-green-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-900/40 transition-colors">
              <ClipboardList size={12} /> {pendingRequests} idea request{(pendingRequests ?? 0) > 1 ? "s" : ""} pending
            </Link>
          )}
          {(pendingReviews ?? 0) > 0 && (
            <Link href="/admin/product-reviews" className="flex items-center gap-2 bg-blue-950 border border-blue-800/60 text-blue-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-900/40 transition-colors">
              <MessageSquare size={12} /> {pendingReviews} review{(pendingReviews ?? 0) > 1 ? "s" : ""} to approve
            </Link>
          )}
          {(lowStock ?? 0) > 0 && (
            <Link href="/admin/inventory" className="flex items-center gap-2 bg-red-950 border border-red-800/60 text-red-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-900/40 transition-colors">
              <AlertTriangle size={12} /> {lowStock} material{(lowStock ?? 0) > 1 ? "s" : ""} low stock
            </Link>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <h2 className="text-white font-semibold flex items-center gap-2 text-sm">
              <ShoppingBag size={14} className="text-green-400" /> Recent Orders
            </h2>
            <Link href="/admin/orders" className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-gray-800">
            {(recentOrders || []).length === 0 ? (
              <div className="py-10 text-center text-gray-500 text-sm">No orders yet</div>
            ) : (
              (recentOrders || []).map((order: any) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-800/60 transition-colors">
                  <div>
                    <p className="text-white text-sm">{order.customer_name || "Customer"}</p>
                    <p className="text-gray-500 text-xs font-mono">#{order.id?.slice(0, 8)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.payment_status === "paid" ? "bg-green-900/40 text-green-400" : order.payment_status === "pending" ? "bg-yellow-900/40 text-yellow-400" : "bg-gray-800 text-gray-400"}`}>
                      {order.payment_status}
                    </span>
                    <span className="text-white font-medium text-sm">₹{Number(order.total_amount || 0).toLocaleString("en-IN")}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Operations Hub */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h2 className="text-white font-semibold flex items-center gap-2 text-sm">
              <TrendingUp size={14} className="text-yellow-400" /> Operations Hub
            </h2>
          </div>
          <div className="divide-y divide-gray-800">
            {operationsLinks.map(({ href, label, icon: Icon, badge, badgeColor }) => (
              <Link key={href} href={href as any} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-800/60 transition-colors">
                <div className="flex items-center gap-3">
                  <Icon size={14} className="text-gray-400" />
                  <span className="text-gray-300 text-sm">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {badge && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>{badge}</span>}
                  <ArrowRight size={12} className="text-gray-600" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-3">Quick Actions</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { href: "/admin/products/new", label: "Add Product", icon: Package },
            { href: "/admin/products/bulk-upload", label: "Bulk Upload", icon: Layers },
            { href: "/admin/print-queue", label: "Review Requests", icon: ClipboardList },
            { href: "/admin/print-farm", label: "Print Farm", icon: Printer },
            { href: "/admin/orders", label: "View Orders", icon: ShoppingBag },
            { href: "/admin/inventory", label: "Inventory", icon: Layers },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href as any}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col items-center gap-2 text-center hover:border-gray-700 hover:bg-gray-800 transition-colors">
              <Icon size={18} className="text-gray-400" />
              <span className="text-gray-400 text-xs leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Active Print Jobs */}
      {(activeJobs?.length ?? 0) > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2 text-sm">
              <Printer size={14} className="text-blue-400" /> Active Print Jobs
            </h2>
            <Link href="/admin/print-farm" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Manage <ArrowRight size={11} />
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {(activeJobs || []).map((job: any) => {
              const elapsed = Math.floor((Date.now() - new Date(job.started_at).getTime()) / 3600000);
              return (
                <div key={job.id} className="bg-black border border-gray-800 rounded-lg px-4 py-2.5 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <div>
                    <p className="text-white text-sm font-medium">{job.printer_name}</p>
                    <p className="text-gray-500 text-xs">{elapsed}h running</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
