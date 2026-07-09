"use server";

/**
 * Server Actions for Shipping Management
 * Handles both automatic and manual shipping operations
 */

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/guards";
import { getShippingProvider, getGlobalShippingMode, updateGlobalShippingMode } from "@/lib/shipping/provider";
import type { ShippingMode, ShipmentStatus, ManualShipmentUpdate } from "@/types/shipping";
import { sendNotification } from "@/services/notifications";
import { trackEvent } from "@/lib/utils";

type ActionResult = { success?: boolean; error?: string; data?: any };

/**
 * Get global shipping mode
 */
export async function getShippingMode(): Promise<ActionResult> {
  try {
    const mode = await getGlobalShippingMode();
    return { success: true, data: { mode } };
  } catch (error: any) {
    return { error: error.message || "Failed to get shipping mode" };
  }
}

/**
 * Update global shipping mode
 */
export async function switchGlobalShippingMode(mode: ShippingMode): Promise<ActionResult> {
  try {
    await requireAdmin();
    
    await updateGlobalShippingMode(mode);

    revalidatePath("/admin/settings");
    
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update shipping mode" };
  }
}

/**
 * Create shipment (uses global shipping mode)
 */
export async function createShipment(orderId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data: order } = await supabase
      .from("orders")
      .select("user_id, shiprocket_awb_number, tracking_number")
      .eq("id", orderId)
      .single();

    if (!order) {
      return { error: "Order not found" };
    }

    // Check if shipment already created
    if (order.shiprocket_awb_number || order.tracking_number) {
      return { error: "Shipment already created" };
    }

    const mode = await getGlobalShippingMode();
    const provider = getShippingProvider(mode);
    const result = await provider.createShipment(orderId);

    if (!result.success) {
      return { error: result.error };
    }

    await trackEvent("admin_action", order.user_id, {
      action: "create_shipment",
      orderId,
      mode
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");

    return { success: true, data: result };
  } catch (error: any) {
    return { error: error.message || "Failed to create shipment" };
  }
}

/**
 * Update manual shipment details
 */
export async function updateManualShipment(
  orderId: string,
  updates: ManualShipmentUpdate
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    // Verify it's a manual shipment
    const { data: order } = await supabase
      .from("orders")
      .select("shipping_mode, user_id, shipment_status")
      .eq("id", orderId)
      .single();

    if (!order) {
      return { error: "Order not found" };
    }

    if (order.shipping_mode !== "MANUAL") {
      return { error: "This action is only for manual shipments" };
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.shipmentStatus) {
      updateData.shipment_status = updates.shipmentStatus;
      
      // Auto-update order status based on shipment status
      if (updates.shipmentStatus === "delivered") {
        updateData.status = "delivered";
        updateData.delivered_date = new Date().toISOString();
      } else if (updates.shipmentStatus === "shipped") {
        updateData.status = "shipped";
      } else if (updates.shipmentStatus === "cancelled") {
        updateData.status = "cancelled";
      }
    }

    if (updates.courierName !== undefined) {
      updateData.courier_name = updates.courierName;
    }

    if (updates.trackingNumber !== undefined) {
      updateData.tracking_number = updates.trackingNumber;
    }

    if (updates.trackingUrl !== undefined) {
      updateData.tracking_url = updates.trackingUrl;
    }

    if (updates.dispatchDate !== undefined) {
      updateData.dispatch_date = updates.dispatchDate;
    }

    if (updates.deliveredDate !== undefined) {
      updateData.delivered_date = updates.deliveredDate;
    }

    if (updates.shipmentNotes !== undefined) {
      updateData.shipment_notes = updates.shipmentNotes;
    }

    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId);

    if (error) throw error;

    // Send notification if status changed significantly
    if (updates.shipmentStatus) {
      const oldStatus = order.shipment_status;
      const newStatus = updates.shipmentStatus;

      if (newStatus === "shipped" && oldStatus !== "shipped") {
        await sendNotification(
          order.user_id,
          "order_update",
          "Order Shipped",
          `Your order has been shipped. ${updateData.tracking_number ? `Tracking: ${updateData.tracking_number}` : ""}`
        );
      } else if (newStatus === "delivered") {
        await sendNotification(
          order.user_id,
          "order_update",
          "Order Delivered",
          "Your order has been successfully delivered!"
        );
      }
    }

    await trackEvent("admin_action", order.user_id, {
      action: "update_manual_shipment",
      orderId,
      updates
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath(`/orders/${orderId}`);

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update shipment" };
  }
}

/**
 * Update shipment status (quick action)
 */
export async function updateShipmentStatus(
  orderId: string,
  status: ShipmentStatus
): Promise<ActionResult> {
  return updateManualShipment(orderId, { shipmentStatus: status });
}

/**
 * Get tracking information
 */
export async function getShipmentTracking(orderId: string): Promise<ActionResult> {
  try {
    const mode = await getGlobalShippingMode();
    const provider = getShippingProvider(mode);
    const result = await provider.trackShipment(orderId);

    if (!result.success) {
      return { error: result.error };
    }

    return { success: true, data: result };
  } catch (error: any) {
    return { error: error.message || "Failed to get tracking information" };
  }
}

/**
 * Cancel shipment
 */
export async function cancelShipment(orderId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data: order } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", orderId)
      .single();

    if (!order) {
      return { error: "Order not found" };
    }

    const mode = await getGlobalShippingMode();
    const provider = getShippingProvider(mode);
    const result = await provider.cancelShipment(orderId);

    if (!result.success) {
      return { error: result.error };
    }

    await sendNotification(
      order.user_id,
      "order_update",
      "Order Cancelled",
      "Your order has been cancelled."
    );

    await trackEvent("admin_action", order.user_id, {
      action: "cancel_shipment",
      orderId
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to cancel shipment" };
  }
}

/**
 * Generate shipping label (automatic mode only)
 */
export async function generateShippingLabel(orderId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const mode = await getGlobalShippingMode();

    if (mode === "MANUAL") {
      return { error: "Label generation is not available for manual shipping mode" };
    }

    const provider = getShippingProvider("AUTOMATIC");
    const result = await provider.generateLabel(orderId);

    if (!result.success) {
      return { error: result.error };
    }

    revalidatePath(`/admin/orders/${orderId}`);

    return { success: true, data: result };
  } catch (error: any) {
    return { error: error.message || "Failed to generate label" };
  }
}
