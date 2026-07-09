/**
 * Shipping Utilities
 * Helper functions for shipping operations
 */

import { createAdminClient } from "@/lib/supabase/admin";
import type { ShippingMode, ShipmentStatus } from "@/types/shipping";

/**
 * Get shipping details for an order
 */
export async function getOrderShippingDetails(orderId: string) {
  const supabase = createAdminClient();
  
  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      id,
      shipping_mode,
      shipment_status,
      courier_name,
      tracking_number,
      tracking_url,
      dispatch_date,
      delivered_date,
      shipment_notes,
      shiprocket_order_id,
      shiprocket_shipment_id,
      shiprocket_awb_number,
      shiprocket_courier_name,
      shiprocket_tracking_url,
      shiprocket_status,
      shiprocket_label_pdf_url,
      shiprocket_tracking_events,
      shiprocket_last_synced_at,
      shiprocket_error,
      status,
      payment_status
    `)
    .eq("id", orderId)
    .single();

  if (error) {
    throw error;
  }

  return order;
}

/**
 * Check if shipment can be created for an order
 */
export async function canCreateShipment(orderId: string): Promise<boolean> {
  const supabase = createAdminClient();
  
  const { data: order } = await supabase
    .from("orders")
    .select("status, payment_status, shiprocket_awb_number, tracking_number")
    .eq("id", orderId)
    .single();

  if (!order) {
    return false;
  }

  // Can create shipment if:
  // 1. Order is confirmed or processing
  // 2. Payment is paid
  // 3. No shipment has been created yet (no AWB/tracking number)
  const validStatus = ["confirmed", "processing", "pending"].includes(order.status);
  const isPaid = order.payment_status === "paid";
  const noShipment = !order.shiprocket_awb_number && !order.tracking_number;

  return validStatus && isPaid && noShipment;
}

/**
 * Check if shipping mode can be switched
 */
export async function canSwitchShippingMode(orderId: string): Promise<boolean> {
  const supabase = createAdminClient();
  
  const { data: order } = await supabase
    .from("orders")
    .select("shiprocket_awb_number, tracking_number")
    .eq("id", orderId)
    .single();

  if (!order) {
    return false;
  }

  // Can switch mode only if no shipment has been created
  return !order.shiprocket_awb_number && !order.tracking_number;
}

/**
 * Get next shipment status in progression
 */
export function getNextShipmentStatus(currentStatus: ShipmentStatus): ShipmentStatus | null {
  const statusOrder: ShipmentStatus[] = [
    "order_placed",
    "payment_confirmed",
    "printing",
    "quality_check",
    "packed",
    "ready_for_dispatch",
    "shipped",
    "out_for_delivery",
    "delivered"
  ];

  const currentIndex = statusOrder.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex === statusOrder.length - 1) {
    return null;
  }

  return statusOrder[currentIndex + 1];
}

/**
 * Get previous shipment status in progression
 */
export function getPreviousShipmentStatus(currentStatus: ShipmentStatus): ShipmentStatus | null {
  const statusOrder: ShipmentStatus[] = [
    "order_placed",
    "payment_confirmed",
    "printing",
    "quality_check",
    "packed",
    "ready_for_dispatch",
    "shipped",
    "out_for_delivery",
    "delivered"
  ];

  const currentIndex = statusOrder.indexOf(currentStatus);
  if (currentIndex <= 0) {
    return null;
  }

  return statusOrder[currentIndex - 1];
}

/**
 * Validate tracking URL
 */
export function validateTrackingUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Format shipment status for display
 */
export function formatShipmentStatus(status: ShipmentStatus): string {
  const statusMap: Record<ShipmentStatus, string> = {
    order_placed: "Order Placed",
    payment_confirmed: "Payment Confirmed",
    printing: "Printing",
    quality_check: "Quality Check",
    packed: "Packed",
    ready_for_dispatch: "Ready for Dispatch",
    shipped: "Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled"
  };

  return statusMap[status] || status;
}

/**
 * Get estimated delivery date based on dispatch date
 */
export function estimateDeliveryDate(dispatchDate: string | null | undefined): Date | null {
  if (!dispatchDate) {
    return null;
  }

  const date = new Date(dispatchDate);
  // Add 5-7 business days for standard shipping
  const deliveryDate = new Date(date);
  deliveryDate.setDate(deliveryDate.getDate() + 7);

  return deliveryDate;
}

/**
 * Get shipping provider logo/icon based on courier name
 */
export function getCourierIcon(courierName: string | null): string {
  if (!courierName) {
    return "Package";
  }

  const name = courierName.toLowerCase();
  
  if (name.includes("india post") || name.includes("post")) {
    return "Mail";
  } else if (name.includes("dtdc") || name.includes("bluedart") || name.includes("delhivery")) {
    return "Truck";
  } else if (name.includes("shiprocket")) {
    return "Rocket";
  } else if (name.includes("fedex") || name.includes("dhl") || name.includes("ups")) {
    return "Globe";
  } else {
    return "Package";
  }
}

/**
 * Check if order is eligible for shipping
 */
export async function isOrderEligibleForShipping(orderId: string): Promise<{
  eligible: boolean;
  reason?: string;
}> {
  const supabase = createAdminClient();
  
  const { data: order } = await supabase
    .from("orders")
    .select("status, payment_status, shipping_line1, shipping_city, shipping_postal_code")
    .eq("id", orderId)
    .single();

  if (!order) {
    return { eligible: false, reason: "Order not found" };
  }

  if (order.status === "cancelled") {
    return { eligible: false, reason: "Order is cancelled" };
  }

  if (order.payment_status !== "paid") {
    return { eligible: false, reason: "Payment not completed" };
  }

  if (!order.shipping_line1 || !order.shipping_city || !order.shipping_postal_code) {
    return { eligible: false, reason: "Incomplete shipping address" };
  }

  return { eligible: true };
}
