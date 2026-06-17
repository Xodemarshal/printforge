import { requireUser } from "@/lib/guards";
import { updateProfileAction, logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createAdminClient } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export default async function SettingsPage() {
  const user = await requireUser();
  const supabase = createAdminClient();

  // Fetch user stats
  const [ordersResult, wishlistResult, uploadsResult, addressesResult] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("wishlists")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("stl_uploads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("addresses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
  ]);

  const orderCount = ordersResult.count || 0;
  const wishlistCount = wishlistResult.count || 0;
  const uploadCount = uploadsResult.count || 0;
  const addressCount = addressesResult.count || 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-gray-400 mt-2">Manage your account and preferences</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <p className="text-sm text-gray-400 mb-2">Total Orders</p>
          <p className="text-3xl font-semibold text-white">{orderCount}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <p className="text-sm text-gray-400 mb-2">Wishlist Items</p>
          <p className="text-3xl font-semibold text-white">{wishlistCount}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <p className="text-sm text-gray-400 mb-2">STL Uploads</p>
          <p className="text-3xl font-semibold text-white">{uploadCount}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <p className="text-sm text-gray-400 mb-2">Saved Addresses</p>
          <p className="text-3xl font-semibold text-white">{addressCount}</p>
        </div>
      </div>

      {/* Profile Form */}
      <form
        action={async (formData) => {
          "use server";
          await updateProfileAction(formData);
        }}
        className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900 p-6"
      >
        <div>
          <label className="text-sm text-gray-400">Name</label>
          <Input name="name" placeholder="Your name" className="mt-2" />
        </div>
        <div>
          <label className="text-sm text-gray-400">Phone</label>
          <Input name="phone" placeholder="Your phone number" className="mt-2" />
        </div>
        <div>
          <label className="text-sm text-gray-400">Avatar URL</label>
          <Input name="avatar_url" placeholder="https://..." className="mt-2" />
        </div>
        <Button type="submit">Save Changes</Button>
      </form>

      {/* Account Actions */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
        <p className="text-sm text-gray-400 mb-4">Sign out of your account</p>
        <form action={async () => {
          "use server";
          await logoutAction();
        }}>
          <Button type="submit" className="bg-red-600 text-white hover:bg-red-700">
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  );
}
