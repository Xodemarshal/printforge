import { createAdminClient } from "@/lib/supabase/admin";
import { NotPickedUpOrdersClient } from "@/components/admin/NotPickedUpOrdersClient";

export const dynamic = "force-dynamic";

export default async function NotPickedUpOrdersPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select(`
      *,
      users (
        name,
        email
      )
    `)
    .order("created_at", { ascending: false })
    .limit(200);

  const orders = (data ?? []).filter((order: any) => {
    const pickup = String(order.shiprocket_pickup_status ?? "not_picked_up");
    const status = String(order.status ?? "");
    return pickup !== "picked_up" && !["delivered", "cancelled", "rejected"].includes(status);
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-yellow-500/80 mb-1">PrintForge Admin</p>
        <h1 className="text-3xl font-bold text-white">Not Picked Up Shipping Queue</h1>
        <p className="text-gray-400 mt-1 text-sm">Monitor labels generated but not yet handed over to the courier.</p>
      </div>

      <NotPickedUpOrdersClient orders={orders as any} />
    </div>
  );
}
