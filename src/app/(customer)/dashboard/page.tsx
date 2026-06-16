import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, Heart, Upload, Settings, Package, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard - PrintForge",
  description: "Your personal dashboard for orders, wishlist, and account management."
};

const dashboardStats = [
  { label: "Total Orders", value: "12", icon: ShoppingBag, href: "/orders" },
  { label: "Wishlist Items", value: "8", icon: Heart, href: "/wishlist" },
  { label: "Uploaded Designs", value: "4", icon: Upload, href: "/upload-design" },
];

const recentOrders = [
  { id: "ORD-001", date: "March 15", status: "Processing", total: "$89.99" },
  { id: "ORD-002", date: "March 10", status: "Shipped", total: "$156.50" },
  { id: "ORD-003", date: "March 05", status: "Delivered", total: "$234.00" },
];

export default function CustomerDashboard() {
  return (
    <div className="page-shell py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-forest mb-2">Welcome back!</h1>
          <p className="text-forest/70">Here's an overview of your account activity</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {dashboardStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="bg-cream/30 border border-forest/20 rounded-2xl p-6 hover:bg-cream/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-forest/10 rounded-xl group-hover:bg-forest/20 transition-colors">
                    <Icon size={24} className="text-forest" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-forest">{stat.value}</p>
                    <p className="text-sm text-forest/60">{stat.label}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-cream/30 border border-forest/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-forest">Recent Orders</h2>
                <Link 
                  href="/orders"
                  className="text-forest/60 hover:text-forest transition-colors text-sm"
                >
                  View All
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-white/50 border border-forest/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-forest/10 rounded-lg">
                        <Package size={16} className="text-forest" />
                      </div>
                      <div>
                        <p className="font-medium text-forest">{order.id}</p>
                        <p className="text-sm text-forest/60">{order.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-forest">{order.total}</p>
                      <p className="text-sm text-forest/60">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>

              {recentOrders.length === 0 && (
                <div className="text-center py-8">
                  <Package size={48} className="text-forest/30 mx-auto mb-3" />
                  <p className="text-forest/60 mb-4">No orders yet</p>
                  <Link 
                    href="/shop"
                    className="inline-block bg-forest text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-forest-dark transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-cream/30 border border-forest/20 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-forest mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link 
                  href="/shop"
                  className="flex items-center gap-3 p-3 bg-white/50 border border-forest/10 rounded-lg hover:bg-white/70 transition-colors"
                >
                  <ShoppingBag size={20} className="text-forest" />
                  <span className="text-forest">Browse Products</span>
                </Link>
                <Link 
                  href="/upload-design"
                  className="flex items-center gap-3 p-3 bg-white/50 border border-forest/10 rounded-lg hover:bg-white/70 transition-colors"
                >
                  <Upload size={20} className="text-forest" />
                  <span className="text-forest">Upload Design</span>
                </Link>
                <Link 
                  href="/wishlist"
                  className="flex items-center gap-3 p-3 bg-white/50 border border-forest/10 rounded-lg hover:bg-white/70 transition-colors"
                >
                  <Heart size={20} className="text-forest" />
                  <span className="text-forest">View Wishlist</span>
                </Link>
                <Link 
                  href="/settings"
                  className="flex items-center gap-3 p-3 bg-white/50 border border-forest/10 rounded-lg hover:bg-white/70 transition-colors"
                >
                  <Settings size={20} className="text-forest" />
                  <span className="text-forest">Account Settings</span>
                </Link>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-cream/30 border border-forest/20 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-forest mb-4">Account Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-forest/70 text-sm">Member Since</span>
                  <span className="text-forest font-medium text-sm">March 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-forest/70 text-sm">Total Spent</span>
                  <span className="text-forest font-medium text-sm">$482.49</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-forest/70 text-sm">Status</span>
                  <span className="bg-forest/10 text-forest px-2 py-1 rounded text-xs font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}