"use client";

import Link from "next/link";
import { ShoppingBag, Heart, Upload, Settings, Package } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
interface DashboardClientProps {
  orders: any[];
  recentOrders: any[];
  uploadCount: number;
  memberSince: Date;
  totalSpent: number;
}

export function DashboardClient({
  orders,
  recentOrders,
  uploadCount,
  memberSince,
  totalSpent
}: DashboardClientProps) {
  const { items: wishlistItems } = useWishlist();

  const dashboardStats = [
    { label: "Total Orders", value: orders.length.toString(), icon: ShoppingBag, href: "/orders" },
    { label: "Wishlist Items", value: wishlistItems.length.toString(), icon: Heart, href: "/wishlist" },
    { label: "Special Items", value: uploadCount.toString(), icon: Upload, href: "/upload-stl" },
  ];

  return (
    <div className="page-shell py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-400 mb-2">Welcome back!</h1>
          <p className="text-cream/60">Here's an overview of your account activity</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {dashboardStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                href={stat.href as any}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md hover:bg-white/[0.08] hover:border-white/15 transition-all group shadow-[0_10px_24px_rgba(0,0,0,0.2)]"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-emerald-500/20 transition-colors">
                    <Icon size={24} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-cream">{stat.value}</p>
                    <p className="text-sm text-cream/50">{stat.label}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-[0_10px_24px_rgba(0,0,0,0.2)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-emerald-400">Recent Orders</h2>
                <Link 
                  href={"/orders" as any}
                  className="text-cream/60 hover:text-cream transition-colors text-sm"
                >
                  View All
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentOrders.map((order: any) => (
                  <Link 
                    key={order.id}
                    href={`/orders/${order.id}` as any}
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/15 rounded-xl">
                        <Package size={18} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-cream">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-cream/50">{order.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-cream">{order.total}</p>
                      <p className="text-sm text-cream/50 capitalize">{order.status}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {recentOrders.length === 0 && (
                <div className="text-center py-8">
                  <Package size={48} className="text-cream/20 mx-auto mb-3" />
                  <p className="text-cream/50 mb-4">No orders yet</p>
                  <Link 
                    href={"/shop" as any}
                    className="inline-block bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-500 transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-[0_10px_24px_rgba(0,0,0,0.2)]">
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link 
                  href={"/shop" as any}
                  className="flex items-center gap-3 p-3.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-colors text-cream"
                >
                  <ShoppingBag size={20} className="text-emerald-400" />
                  <span>Browse Products</span>
                </Link>
                <Link 
                  href={"/upload-stl" as any}
                  className="flex items-center gap-3 p-3.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-colors text-cream"
                >
                  <Upload size={20} className="text-emerald-400" />
                  <span>Special Item</span>
                </Link>
                <Link 
                  href={"/wishlist" as any}
                  className="flex items-center gap-3 p-3.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-colors text-cream"
                >
                  <Heart size={20} className="text-emerald-400" />
                  <span>View Wishlist</span>
                </Link>
                <Link 
                  href={"/settings" as any}
                  className="flex items-center gap-3 p-3.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-colors text-cream"
                >
                  <Settings size={20} className="text-emerald-400" />
                  <span>Account Settings</span>
                </Link>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-[0_10px_24px_rgba(0,0,0,0.2)]">
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">Account Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-cream/50 text-sm">Member Since</span>
                  <span className="text-cream font-medium text-sm">
                    {memberSince.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cream/50 text-sm">Total Spent</span>
                  <span className="text-cream font-medium text-sm">₹{totalSpent.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cream/50 text-sm">Status</span>
                  <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
