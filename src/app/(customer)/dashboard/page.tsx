import type { Metadata } from "next";
import { requireUser } from "@/lib/guards";
import { getCustomerOrders } from "@/actions/orders";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard - PrintForge",
  description: "Your personal dashboard for orders, wishlist, and account management."
};

export default async function CustomerDashboard() {
  const user = await requireUser();
  const supabase = createAdminClient();

  // Fetch data from database
  const [orders, userResult, uploadsResult] = await Promise.all([
    getCustomerOrders().catch(() => []),
    supabase
      .from("users")
      .select("created_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("stl_uploads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
  ]);

  const uploadCount = uploadsResult.count || 0;
  const memberSince = userResult.data?.created_at ? new Date(userResult.data.created_at) : new Date();

  const recentOrders = orders.slice(0, 3).map((order: any) => ({
    id: order.id,
    date: new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
    total: `₹${Number(order.total_amount).toFixed(2)}`
  }));

  const totalSpent = orders.reduce((sum: number, order: any) => sum + Number(order.total_amount), 0);

  return (
    <DashboardClient
      orders={orders}
      recentOrders={recentOrders}
      uploadCount={uploadCount}
      memberSince={memberSince}
      totalSpent={totalSpent}
    />
  );
}
