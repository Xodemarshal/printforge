/**
 * Shiprocket Provider Implementation
 * Wraps existing Shiprocket service with the ShippingProvider interface
 */

import type { 
  ShippingProvider, 
  ShipmentResult, 
  CancelResult, 
  TrackingResult, 
  LabelResult,
  TrackingEvent
} from "@/types/shipping";
import { 
  syncOrderWithShiprocket, 
  mapShiprocketStatus 
} from "@/services/shiprocket";
import { createAdminClient } from "@/lib/supabase/admin";

export class ShiprocketProvider implements ShippingProvider {
  name = "Shiprocket";

  async createShipment(orderId: string): Promise<ShipmentResult> {
    try {
      const order = await syncOrderWithShiprocket(orderId);
      
      return {
        success: true,
        orderId: order.id,
        shipmentId: order.shiprocket_shipment_id || undefined,
        awbNumber: order.shiprocket_awb_number || undefined,
        courierName: order.shiprocket_courier_name || undefined,
        trackingUrl: order.shiprocket_tracking_url || undefined,
        labelUrl: order.shiprocket_label_pdf_url || undefined
      };
    } catch (error: any) {
      return {
        success: false,
        orderId,
        error: error.message || "Failed to create Shiprocket shipment"
      };
    }
  }

  async cancelShipment(orderId: string): Promise<CancelResult> {
    try {
      const supabase = createAdminClient();
      
      // Update order status to cancelled
      const { error } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          shiprocket_status: "cancelled",
          updated_at: new Date().toISOString()
        })
        .eq("id", orderId);

      if (error) throw error;

      return {
        success: true,
        orderId
      };
    } catch (error: any) {
      return {
        success: false,
        orderId,
        error: error.message || "Failed to cancel shipment"
      };
    }
  }

  async trackShipment(orderId: string): Promise<TrackingResult> {
    try {
      const supabase = createAdminClient();
      
      const { data: order, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (error) throw error;

      const events: TrackingEvent[] = Array.isArray(order.shiprocket_tracking_events)
        ? order.shiprocket_tracking_events.map((e: any) => ({
            timestamp: e.timestamp || e.created_at || new Date().toISOString(),
            status: e.raw_status || e.status || "",
            description: e.payload?.description || e.description || "",
            location: e.payload?.location || e.location || ""
          }))
        : [];

      // Map Shiprocket status to our shipment status
      const mapped = mapShiprocketStatus(order.shiprocket_status);

      return {
        success: true,
        orderId,
        currentStatus: this.mapToShipmentStatus(mapped.order_status),
        courierName: order.shiprocket_courier_name || undefined,
        awbNumber: order.shiprocket_awb_number || undefined,
        trackingUrl: order.shiprocket_tracking_url || undefined,
        events
      };
    } catch (error: any) {
      return {
        success: false,
        orderId,
        error: error.message || "Failed to track shipment"
      };
    }
  }

  async generateLabel(orderId: string): Promise<LabelResult> {
    try {
      // Label generation is part of createShipment for Shiprocket
      const order = await syncOrderWithShiprocket(orderId);
      
      return {
        success: true,
        orderId,
        labelUrl: order.shiprocket_label_pdf_url || undefined
      };
    } catch (error: any) {
      return {
        success: false,
        orderId,
        error: error.message || "Failed to generate label"
      };
    }
  }

  private mapToShipmentStatus(orderStatus: string): any {
    const statusMap: Record<string, any> = {
      "pending": "order_placed",
      "confirmed": "payment_confirmed",
      "processing": "printing",
      "shipped": "shipped",
      "delivered": "delivered",
      "cancelled": "cancelled"
    };
    
    return statusMap[orderStatus] || "order_placed";
  }
}
