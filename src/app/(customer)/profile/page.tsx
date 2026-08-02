import { requireUser } from "@/lib/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateProfileAction, changePasswordAction, logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { User, Mail, Phone, Key, Shield, Bell, Globe, CreditCard, MapPin, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();
  const supabase = createAdminClient();

  // Fetch additional user data
  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch user stats
  const [ordersResult, addressesResult, wishlistResult] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("addresses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("wishlists")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
  ]);

  const orderCount = ordersResult.count || 0;
  const addressCount = addressesResult.count || 0;
  const wishlistCount = wishlistResult.count || 0;

  return (
    <div className="page-shell py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-400 mb-2">My Profile</h1>
          <p className="text-cream/60">Manage your account settings and preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <User size={28} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-emerald-400">{userData?.name || "User"}</h2>
                  <p className="text-cream/60">{user.email}</p>
                  <p className="text-sm text-cream/40">Member since {new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <form
                action={async (formData) => {
                  "use server";
                  await updateProfileAction(formData);
                }}
                className="space-y-4"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-cream/70 flex items-center gap-2 mb-2">
                      <User size={14} className="text-emerald-400" /> Full Name
                    </label>
                    <Input
                      name="name"
                      defaultValue={userData?.name || ""}
                      placeholder="Your full name"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-cream/70 flex items-center gap-2 mb-2">
                      <Mail size={14} className="text-emerald-400" /> Email Address
                    </label>
                    <Input
                      type="email"
                      value={user.email || ""}
                      disabled
                      className="w-full bg-white/5 opacity-60 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-cream/70 flex items-center gap-2 mb-2">
                      <Phone size={14} className="text-emerald-400" /> Phone Number
                    </label>
                    <Input
                      name="phone"
                      defaultValue={userData?.phone || ""}
                      placeholder="Your phone number"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-cream/70 flex items-center gap-2 mb-2">
                      <Globe size={14} className="text-emerald-400" /> Timezone
                    </label>
                    <select
                      name="timezone"
                      defaultValue={userData?.timezone || "Asia/Kolkata"}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-2xl text-sm font-medium text-cream focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="Asia/Kolkata" className="bg-[#142117] text-cream">India (IST)</option>
                      <option value="America/New_York" className="bg-[#142117] text-cream">Eastern Time (ET)</option>
                      <option value="America/Chicago" className="bg-[#142117] text-cream">Central Time (CT)</option>
                      <option value="America/Denver" className="bg-[#142117] text-cream">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles" className="bg-[#142117] text-cream">Pacific Time (PT)</option>
                      <option value="Europe/London" className="bg-[#142117] text-cream">London (GMT)</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl">
                  Update Profile
                </Button>
              </form>
            </Card>

            {/* Change Password */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Key size={20} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-emerald-400">Change Password</h2>
                  <p className="text-sm text-cream/60">Update your account password</p>
                </div>
              </div>

              <form
                action={async (formData) => {
                  "use server";
                  await changePasswordAction(formData);
                }}
                className="space-y-4"
              >
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-cream/70 mb-2 block">Current Password</label>
                    <Input
                      type="password"
                      name="currentPassword"
                      placeholder="Enter current password"
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-cream/70 mb-2 block">New Password</label>
                    <Input
                      type="password"
                      name="newPassword"
                      placeholder="Enter new password"
                      required
                      className="w-full"
                    />
                    <p className="text-xs text-cream/40 mt-1">Must be at least 6 characters</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-cream/70 mb-2 block">Confirm New Password</label>
                    <Input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      required
                      className="w-full"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl">
                  Change Password
                </Button>
              </form>
            </Card>
          </div>

          {/* Right Column - Stats & Quick Actions */}
          <div className="space-y-6">
            {/* Account Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">Account Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                      <Package size={18} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-cream/50">Total Orders</p>
                      <p className="text-xl font-bold text-cream">{orderCount}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center">
                      <MapPin size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-cream/50">Saved Addresses</p>
                      <p className="text-xl font-bold text-cream">{addressCount}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
                      <Package size={18} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-cream/50">Wishlist Items</p>
                      <p className="text-xl font-bold text-cream">{wishlistCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Settings */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">Quick Settings</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <Bell size={16} className="text-emerald-400" />
                    <span className="text-cream text-sm">Notification Preferences</span>
                  </div>
                  <span className="text-cream/40">→</span>
                </button>
                <button className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <Shield size={16} className="text-emerald-400" />
                    <span className="text-cream text-sm">Privacy & Security</span>
                  </div>
                  <span className="text-cream/40">→</span>
                </button>
                <button className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <CreditCard size={16} className="text-emerald-400" />
                    <span className="text-cream text-sm">Payment Methods</span>
                  </div>
                  <span className="text-cream/40">→</span>
                </button>
              </div>
            </Card>

            {/* Account Actions */}
            <Card className="p-6 border-red-500/30 bg-red-950/20">
              <h3 className="text-lg font-semibold text-red-400 mb-4">Account Actions</h3>
              <div className="space-y-3">
                <form action={async () => {
                  "use server";
                  await logoutAction();
                }}>
                  <Button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-500 text-white rounded-xl"
                  >
                    Sign Out
                  </Button>
                </form>
                <button className="w-full p-2 text-xs text-red-400/80 hover:text-red-300 text-center transition-colors">
                  Request Account Deletion
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
