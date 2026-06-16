import { createCouponAction, updateCouponAction } from "@/actions/coupons";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default async function CouponsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("coupons").select("*").limit(50);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Coupons</h1>
      <form 
        action={async (formData) => {
          "use server";
          await createCouponAction(formData);
        }} 
        className="grid gap-3 md:grid-cols-3"
      >
        <Input name="code" placeholder="Code" />
        <Input name="total" type="number" placeholder="Min total" />
        <Button type="submit">Create</Button>
      </form>
      <AdminDataTable
        columns={["Code", "Discount", "Expiry", "Actions"]}
        rows={(data ?? []).map((coupon: any) => [
          coupon.code,
          coupon.discount_value,
          coupon.expires_at,
          <form 
            key={coupon.id} 
            action={async (formData) => {
              "use server";
              await updateCouponAction(formData);
            }} 
            className="flex gap-2"
          >
            <input type="hidden" name="id" value={coupon.id} />
            <Input name="code" defaultValue={coupon.code} />
            <Input name="discountValue" type="number" defaultValue={coupon.discount_value} />
            <Button type="submit" variant="outline">
              Edit
            </Button>
          </form>
        ])}
      />
    </div>
  );
}
