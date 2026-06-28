import { createAdminClient } from "@/lib/supabase/admin";
import InventoryDashboard from "./InventoryDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Inventory - PrintForge Admin",
  description: "Manage material inventory and stock levels"
};

export default async function InventoryPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("inventory")
    .select("*")
    .order("material", { ascending: true });

  return <InventoryDashboard items={data ?? []} />;
}
