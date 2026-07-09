/**
 * Manual Shipping Provider Implementation
 * For manual shipping management (India Post, DTDC, Delhivery, etc.)
 */

import type { 
  ShippingProvider, 
  ShipmentResult, 
  CancelResult, 
  TrackingResult, 
  LabelResult 
} from "@/types/shipping";
import { createAdminClient } from "@/lib/supabase/admin";

export class ManualShippingProvider implements ShippingProvider {
  name = "Manual";

  async createShipment(orderId: string): Promise<ShipmentResult> {
    try {
      const supabase = createAdminClient();
      
      // For manual mode, we just initialize the shipment fields
      const { data: order, error } = await supabase
        .from("orders")
        .update({
          shipping_mode: "MANUAL",
          shipment_status: "order_placed",
          updated_at: new Date().toISOString()
        })
        .eq("id", orderId)
        .select("*")
        .single();

      if (error) throw error;

      return {
        success: true,
        orderId,
        courierName: order.courier_name || undefined,
        awbNumber: order.tracking_number || undefined,
        trackingUrl: order.tracking_url || undefined
      };
    } catch (error: any) {
      return {
        success: false,
        orderId,
        error: error.message || "Failed to initialize manual shipment"
      };
    }
  }

  async cancelShipment(orderId: string): Promise<CancelResult> {
    try {
      const supabase = createAdminClient();
      
      const { error } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          shipment_status: "cancelled",
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

      return {
        success: true,
        orderId,
        currentStatus: order.shipment_status || "order_placed",
        courierName: order.courier_name || undefined,
        awbNumber: order.tracking_number || undefined,
        trackingUrl: order.tracking_url || undefined,
        events: [] // Manual mode doesn't have automated events
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
    // Manual mode doesn't auto-generate labels
    return {
      success: false,
      orderId,
      error: "Label generation not supported in manual mode"
    };
  }
}
