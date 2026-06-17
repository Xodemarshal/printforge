import type { Metadata } from "next";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Package, ArrowRight } from "lucide-react";
import { getCustomerOrders } from "@/actions/orders";

export const metadata: Metadata = {
  title: "My Orders - PrintForge",
  description: "View your order history and track shipments."
};

const statusColors = {
  "pending": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "confirmed": "bg-blue-100 text-blue-800 border-blue-200",
  "processing": "bg-blue-100 text-blue-800 border-blue-200",
  "shipped": "bg-indigo-100 text-indigo-800 border-indigo-200", 
  "delivered": "bg-green-100 text-green-800 border-green-200",
  "cancelled": "bg-red-100 text-red-800 border-red-200"
};

export default async function OrdersPage() {
  let orders = [];
  let errorMessage = null;
  
  try {
    orders = await getCustomerOrders();
  } catch (err: any) {
    console.error("Failed to load orders:", err);
    errorMessage = err.message;
  }

  const getEstimatedDelivery = (order: any) => {
    if (order.status === "delivered") {
      return "Delivered";
    }
    
    const orderDate = new Date(order.created_at);
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(estimatedDate.getDate() + 7); // 7 days from order
    
    return estimatedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getItemCount = (order: any) => {
    if (!order.order_items || order.order_items.length === 0) return 0;
    return order.order_items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
  };
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
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <p className="text-red-800">Error loading orders: {errorMessage}</p>
            </div>
          )}
          
          {orders.map((order: any) => {
            const itemCount = getItemCount(order);
            const estimatedDelivery = getEstimatedDelivery(order);
            const statusLabel = order.status.charAt(0).toUpperCase() + order.status.slice(1);
            
            return (
              <div key={order.id} className="bg-cream/30 border border-forest/20 rounded-2xl p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-semibold text-forest">Order #{order.id.slice(0, 8)}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[order.status as keyof typeof statusColors] || statusColors.pending}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <p className="text-sm text-forest/60">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                    <p className="text-sm text-forest/60">{itemCount} {itemCount === 1 ? 'item' : 'items'} • {formatCurrency(order.total_amount)}</p>
                  </div>

                  <div className="flex flex-col lg:items-end gap-2">
                    <p className="text-sm text-forest/60">
                      {order.status === "delivered" ? estimatedDelivery : `Est. delivery: ${estimatedDelivery}`}
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
            );
          })}

          {orders.length === 0 && (
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