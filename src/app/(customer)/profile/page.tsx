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
          <h1 className="text-3xl font-bold text-forest mb-2">My Profile</h1>
          <p className="text-forest/70">Manage your account settings and preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-forest/20 to-moss/20 flex items-center justify-center">
                  <User size={28} className="text-forest" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-forest">{userData?.name || "User"}</h2>
                  <p className="text-forest/60">{user.email}</p>
                  <p className="text-sm text-forest/50">Member since {new Date(user.created_at).toLocaleDateString()}</p>
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
                    <label className="text-sm font-medium text-forest/70 flex items-center gap-2 mb-2">
                      <User size={14} /> Full Name
                    </label>
                    <Input
                      name="name"
                      defaultValue={userData?.name || ""}
                      placeholder="Your full name"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-forest/70 flex items-center gap-2 mb-2">
                      <Mail size={14} /> Email Address
                    </label>
                    <Input
                      type="email"
                      value={user.email || ""}
                      disabled
                      className="w-full bg-muted"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-forest/70 flex items-center gap-2 mb-2">
                      <Phone size={14} /> Phone Number
                    </label>
                    <Input
                      name="phone"
                      defaultValue={userData?.phone || ""}
                      placeholder="Your phone number"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-forest/70 flex items-center gap-2 mb-2">
                      <Globe size={14} /> Timezone
                    </label>
                    <select
                      name="timezone"
                      defaultValue={userData?.timezone || "Asia/Kolkata"}
                      className="w-full px-3 py-2 border border-forest/20 rounded-lg bg-background text-forest"
                    >
                      <option value="Asia/Kolkata">India (IST)</option>
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" className="w-full md:w-auto">
                  Update Profile
                </Button>
              </form>
            </Card>

            {/* Change Password */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Key size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-forest">Change Password</h2>
                  <p className="text-sm text-forest/60">Update your account password</p>
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
                    <label className="text-sm font-medium text-forest/70 mb-2 block">Current Password</label>
                    <Input
                      type="password"
                      name="currentPassword"
                      placeholder="Enter current password"
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-forest/70 mb-2 block">New Password</label>
                    <Input
                      type="password"
                      name="newPassword"
                      placeholder="Enter new password"
                      required
                      className="w-full"
                    />
                    <p className="text-xs text-forest/50 mt-1">Must be at least 6 characters</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-forest/70 mb-2 block">Confirm New Password</label>
                    <Input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      required
                      className="w-full"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full md:w-auto">
                  Change Password
                </Button>
              </form>
            </Card>
          </div>

          {/* Right Column - Stats & Quick Actions */}
          <div className="space-y-6">
            {/* Account Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-forest mb-4">Account Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-cream/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center">
                      <Package size={16} className="text-forest" />
                    </div>
                    <div>
                      <p className="text-sm text-forest/70">Total Orders</p>
                      <p className="text-xl font-bold text-forest">{orderCount}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-cream/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-moss/10 flex items-center justify-center">
                      <MapPin size={16} className="text-moss" />
                    </div>
                    <div>
                      <p className="text-sm text-forest/70">Saved Addresses</p>
                      <p className="text-xl font-bold text-forest">{addressCount}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-cream/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-warm/10 flex items-center justify-center">
                      <Package size={16} className="text-accent-warm" />
                    </div>
                    <div>
                      <p className="text-sm text-forest/70">Wishlist Items</p>
                      <p className="text-xl font-bold text-forest">{wishlistCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Settings */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-forest mb-4">Quick Settings</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-cream/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Bell size={16} className="text-forest" />
                    <span className="text-forest">Notification Preferences</span>
                  </div>
                  <span className="text-forest/60">→</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-cream/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Shield size={16} className="text-forest" />
                    <span className="text-forest">Privacy & Security</span>
                  </div>
                  <span className="text-forest/60">→</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-cream/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <CreditCard size={16} className="text-forest" />
                    <span className="text-forest">Payment Methods</span>
                  </div>
                  <span className="text-forest/60">→</span>
                </button>
              </div>
            </Card>

            {/* Account Actions */}
            <Card className="p-6 border-red-200 bg-red-50">
              <h3 className="text-lg font-semibold text-red-800 mb-4">Account Actions</h3>
              <div className="space-y-3">
                <form action={async () => {
                  "use server";
                  await logoutAction();
                }}>
                  <Button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    Sign Out
                  </Button>
                </form>
                <button className="w-full p-3 text-sm text-red-700 hover:text-red-800 text-center">
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
