import type React from "react";
import Link from "next/link";
import { ADMIN_NAV_LINKS } from "@/lib/constants";
import {
  TreePine,
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Warehouse,
  Ticket,
  Star,
  BarChart3
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ size?: number | string }>> = {
  Dashboard: LayoutDashboard,
  Products: Package,
  Categories: FolderTree,
  Orders: ShoppingBag,
  Inventory: Warehouse,
  Coupons: Ticket,
  Reviews: Star,
  Analytics: BarChart3
};

export function AdminSidebar() {
  return (
    <aside className="border-r border-gray-800 bg-black px-6 py-8 text-gray-100">
      <Link href="/admin/dashboard" className="flex items-center gap-3 mb-8">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-gray-900 text-white">
          <TreePine size={20} />
        </span>
        <div>
          <p className="font-semibold text-lg text-white">Admin</p>
          <p className="text-xs text-gray-400">Control Panel</p>
        </div>
      </Link>
      <nav className="space-y-2">
        {ADMIN_NAV_LINKS.map((item) => {
          const Icon = ICONS[item.label] ?? LayoutDashboard;
          return (
            <Link
              key={item.href}
              href={item.href as any}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-900 hover:text-white"
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
