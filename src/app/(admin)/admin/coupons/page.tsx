import { createCouponAction, updateCouponAction } from "@/actions/coupons";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import { revalidatePath } from "next/cache";

export default async function CouponsPage() {
  const supabase = createAdminClient();
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-yellow-500/80 mb-1">PrintForge Admin</p>
          <h1 className="text-3xl font-bold text-white">Coupons & Discounts</h1>
          <p className="text-gray-400 mt-1 text-sm">Create and manage promo codes and customer discounts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Coupon Form */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-900 border-gray-800 p-6 sticky top-6">
            <h2 className="text-lg font-medium text-white mb-6">Create New Coupon</h2>
            <form action={async (formData) => {
              "use server";
              await createCouponAction(formData);
              revalidatePath("/admin/coupons");
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Coupon Code</label>
                <Input name="code" placeholder="e.g. WELCOME10" required className="bg-black border-gray-700 text-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Type</label>
                  <select name="discountType" className="w-full bg-black border border-gray-700 text-white rounded-md px-3 py-2 text-sm focus:ring-forest-green focus:border-forest-green">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Value</label>
                  <Input name="discountValue" type="number" placeholder="10" required className="bg-black border-gray-700 text-white" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Min Order Total (₹)</label>
                <Input name="total" type="number" defaultValue="0" required className="bg-black border-gray-700 text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Usage Limit</label>
                <Input name="usageLimit" type="number" defaultValue="0" placeholder="0 for unlimited" className="bg-black border-gray-700 text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Expires At</label>
                <Input name="expiresAt" type="date" className="bg-black border-gray-700 text-white" />
              </div>

              <Button type="submit" className="w-full bg-forest-green hover:bg-forest-green/90 text-white mt-2">
                Create Coupon
              </Button>
            </form>
          </Card>
        </div>

        {/* Coupon List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-medium text-white mb-4">Existing Coupons</h2>
          {(!coupons || coupons.length === 0) ? (
            <div className="bg-gray-900 border border-dashed border-gray-800 rounded-lg p-12 text-center text-gray-500">
              No coupons created yet.
            </div>
          ) : (
            coupons.map((coupon: any) => (
              <Card key={coupon.id} className="bg-gray-900 border-gray-800 overflow-hidden">
                <form action={async (formData) => {
                  "use server";
                  await updateCouponAction(formData);
                  revalidatePath("/admin/coupons");
                }} className="p-6">
                  <input type="hidden" name="id" value={coupon.id} />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-black border border-gray-700 px-3 py-1 rounded text-xl font-mono font-bold text-white tracking-wider">
                        {coupon.code}
                      </div>
                      <Badge tone={coupon.active ? "success" : "destructive"}>
                        {coupon.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        name="active" 
                        defaultChecked={coupon.active}
                        className="h-4 w-4 rounded border-gray-700 bg-black text-forest-green focus:ring-forest-green" 
                      />
                      <label className="text-sm text-gray-400">Is Active</label>
                      <Button type="submit" variant="outline" className="border-gray-700 text-gray-300 ml-2 text-sm px-3 py-1">
                        Save Changes
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Discount</p>
                      <div className="flex items-center gap-2">
                        <Input 
                          name="discountValue" 
                          type="number" 
                          defaultValue={coupon.discount_value} 
                          className="bg-black border-gray-700 text-white h-8"
                        />
                        <span className="text-gray-400">
                          {coupon.discount_type === 'percentage' ? '%' : '₹'}
                        </span>
                        <input type="hidden" name="discountType" value={coupon.discount_type} />
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Min. Order</p>
                      <Input 
                        name="minOrderTotal" 
                        type="number" 
                        defaultValue={coupon.min_order_total} 
                        className="bg-black border-gray-700 text-white h-8"
                      />
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Uses</p>
                      <p className="text-white font-medium">{coupon.times_used} / {Number(coupon.usage_limit) > 0 ? coupon.usage_limit : '∞'}</p>
                      <input type="hidden" name="usageLimit" value={coupon.usage_limit || 0} />
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Expires</p>
                      <Input 
                        name="expiresAt" 
                        type="date" 
                        defaultValue={coupon.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : ''} 
                        className="bg-black border-gray-700 text-white h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="my-6 h-px bg-gray-800" />
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <p>Created on {new Date(coupon.created_at).toLocaleDateString()}</p>
                    <p className="font-mono text-[10px] opacity-50">{coupon.id}</p>
                  </div>
                </form>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
