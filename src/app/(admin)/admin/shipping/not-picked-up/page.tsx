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
        <p className="text-xs uppercase tracking-[0.3em] text-[#c8b99d]">Shipping control</p>
        <h1 className="text-2xl font-semibold text-white mt-2">Not Picked Up Orders</h1>
        <p className="text-gray-400 mt-1">Monitor labels generated but not yet handed over to the courier.</p>
      </div>

      <NotPickedUpOrdersClient orders={orders as any} />
    </div>
  );
}
