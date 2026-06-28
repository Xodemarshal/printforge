import type React from "react";
import Link from "next/link";
import { ADMIN_NAV_LINKS } from "@/lib/constants";
import {
  TreePine,
  LayoutDashboard,
  Sparkles,
  Package,
  FolderTree,
  ShoppingBag,
  Warehouse,
  Ticket,
  Star,
  BarChart3,
  Settings,
  DollarSign,
  Users,
  Printer,
  MessageSquare,
  Bell,
  Activity,
  FileText,
  ClipboardList,
  TrendingUp
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ size?: number | string }>> = {
  Dashboard: LayoutDashboard,
  Requests: Sparkles,
  Products: Package,
  Categories: FolderTree,
  Orders: ShoppingBag,
  Shipping: ShoppingBag,
  Inventory: Warehouse,
  Coupons: Ticket,
  Reviews: Star,
  Analytics: BarChart3,
  Profitability: DollarSign,
  Leads: Users,
  "Print Farm": Printer,
  "Product Reviews": MessageSquare,
  "Alert Center": Bell,
  "Business Health": Activity,
  Reports: FileText,
  "Activity Log": ClipboardList,
  Settings: Settings
};

export function AdminSidebar() {
  return (
    <aside className="border-r border-gray-800 bg-black px-6 py-8 text-gray-100 overflow-y-auto">
      <Link href="/admin/dashboard" className="flex items-center gap-3 mb-8">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-gray-900 text-white">
          <TreePine size={20} />
        </span>
        <div>
          <p className="font-semibold text-lg text-white">Admin</p>
          <p className="text-xs text-gray-400">Control Panel</p>
        </div>
      </Link>
      <nav className="space-y-1">
        {ADMIN_NAV_LINKS.map((item, index) => {
          const Icon = ICONS[item.label] ?? LayoutDashboard;

          // Add a subtle divider before the new operations group
          const showDivider = item.label === "Profitability";

          return (
            <div key={item.href}>
              {showDivider && (
                <div className="pt-3 pb-1">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 px-3 mb-1 flex items-center gap-1">
                    <TrendingUp size={10} />
                    Operations
                  </p>
                </div>
              )}
              <Link
                href={item.href as any}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-900 hover:text-white"
              >
                <Icon size={18} />
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
