import { createAdminClient } from "@/lib/supabase/admin";
import { updateInventoryAction } from "@/actions/inventory";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
export const dynamic = "force-dynamic";
export default async function InventoryPage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("inventory").select("*").limit(50);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Inventory</h1>
      <AdminDataTable
        columns={["Material", "Quantity", "Threshold", "Update"]}
        rows={(data ?? []).map((item: any) => [
          item.material,
          <span key={item.id} className={item.quantity < item.threshold ? "text-red-600 font-medium" : ""}>
            {item.quantity}
          </span>,
          item.threshold,
          <form 
            key={item.id} 
            action={async (formData) => {
              "use server";
              await updateInventoryAction(formData);
            }} 
            className="flex gap-2"
          >
            <input type="hidden" name="id" value={item.id} />
            <Input name="quantity" type="number" defaultValue={item.quantity} />
            <Input name="threshold" type="number" defaultValue={item.threshold} />
            <Button type="submit">Save</Button>
          </form>
        ])}
      />
    </div>
  );
}
