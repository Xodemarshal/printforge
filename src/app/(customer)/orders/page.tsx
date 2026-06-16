import type { Metadata } from "next";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Package, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "My Orders - PrintForge",
  description: "View your order history and track shipments."
};

// Mock orders data
const mockOrders = [
  {
    id: "ORD-001",
    date: "2024-03-15",
    status: "Processing",
    total: 89.99,
    items: 3,
    estimatedDelivery: "March 22, 2024"
  },
  {
    id: "ORD-002", 
    date: "2024-03-10",
    status: "Shipped",
    total: 156.50,
    items: 2,
    estimatedDelivery: "March 18, 2024"
  },
  {
    id: "ORD-003",
    date: "2024-03-05",
    status: "Delivered",
    total: 234.00,
    items: 5,
    estimatedDelivery: "Delivered"
  }
];

const statusColors = {
  "Processing": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Shipped": "bg-blue-100 text-blue-800 border-blue-200", 
  "Delivered": "bg-green-100 text-green-800 border-green-200"
};

export default function OrdersPage() {
  return (
    <div className="page-shell py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-forest mb-2">My Orders</h1>
          <p className="text-forest/70">Track your orders and view purchase history</p>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {mockOrders.map((order) => (
            <div key={order.id} className="bg-cream/30 border border-forest/20 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-forest">Order {order.id}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[order.status as keyof typeof statusColors]}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-forest/60">Placed on {new Date(order.date).toLocaleDateString()}</p>
                  <p className="text-sm text-forest/60">{order.items} items • {formatCurrency(order.total)}</p>
                </div>

                <div className="flex flex-col lg:items-end gap-2">
                  <p className="text-sm text-forest/60">
                    {order.status === "Delivered" ? order.estimatedDelivery : `Est. delivery: ${order.estimatedDelivery}`}
                  </p>
                  <Link 
                    href={`/orders/${order.id}`}
                    className="inline-flex items-center gap-2 text-forest hover:text-forest-dark transition-colors"
                  >
                    View Details <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {mockOrders.length === 0 && (
            <div className="text-center py-16">
              <Package size={64} className="text-forest/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-forest mb-2">No orders yet</h3>
              <p className="text-forest/70 mb-6">When you place orders, they'll appear here.</p>
              <Link 
                href="/shop"
                className="inline-block bg-forest text-white px-6 py-3 rounded-lg font-semibold hover:bg-forest-dark transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}