/**
 * Shipping Types and Interfaces
 * Defines the core types for the dual shipping management system
 */

export type ShippingMode = "AUTOMATIC" | "MANUAL";

// Global shipping settings interface
export interface ShippingSettings {
  shipping_mode: ShippingMode;
}

export type ShipmentStatus =
  | "order_placed"
  | "payment_confirmed"
  | "printing"
  | "quality_check"
  | "packed"
  | "ready_for_dispatch"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface ShipmentStatusInfo {
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const SHIPMENT_STATUSES: Record<ShipmentStatus, ShipmentStatusInfo> = {
  order_placed: {
    label: "Order Placed",
    description: "Order has been received",
    icon: "Package",
    color: "blue"
  },
  payment_confirmed: {
    label: "Payment Confirmed",
    description: "Payment verified successfully",
    icon: "CheckCircle",
    color: "green"
  },
  printing: {
    label: "Printing",
    description: "Product is being printed",
    icon: "Printer",
    color: "purple"
  },
  quality_check: {
    label: "Quality Check",
    description: "Quality inspection in progress",
    icon: "Shield",
    color: "orange"
  },
  packed: {
    label: "Packed",
    description: "Order has been packed",
    icon: "Box",
    color: "teal"
  },
  ready_for_dispatch: {
    label: "Ready for Dispatch",
    description: "Ready to be shipped",
    icon: "Clock",
    color: "indigo"
  },
  shipped: {
    label: "Shipped",
    description: "Package is in transit",
    icon: "Truck",
    color: "blue"
  },
  out_for_delivery: {
    label: "Out for Delivery",
    description: "Package out for delivery",
    icon: "MapPin",
    color: "cyan"
  },
  delivered: {
    label: "Delivered",
    description: "Successfully delivered",
    icon: "CheckCircle2",
    color: "green"
  },
  cancelled: {
    label: "Cancelled",
    description: "Order has been cancelled",
    icon: "XCircle",
    color: "red"
  }
};

export interface ShippingProvider {
  name: string;
  createShipment(orderId: string): Promise<ShipmentResult>;
  cancelShipment(orderId: string): Promise<CancelResult>;
  trackShipment(orderId: string): Promise<TrackingResult>;
  generateLabel(orderId: string): Promise<LabelResult>;
}

export interface ShipmentResult {
  success: boolean;
  orderId: string;
  shipmentId?: string;
  awbNumber?: string;
  courierName?: string;
  trackingUrl?: string;
  labelUrl?: string;
  error?: string;
}

export interface CancelResult {
  success: boolean;
  orderId: string;
  error?: string;
}

export interface TrackingResult {
  success: boolean;
  orderId: string;
  currentStatus?: ShipmentStatus;
  courierName?: string;
  awbNumber?: string;
  trackingUrl?: string;
  events?: TrackingEvent[];
  error?: string;
}

export interface LabelResult {
  success: boolean;
  orderId: string;
  labelUrl?: string;
  error?: string;
}

export interface TrackingEvent {
  timestamp: string;
  status: string;
  description?: string;
  location?: string;
}

export interface ManualShipmentUpdate {
  shipmentStatus?: ShipmentStatus;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  dispatchDate?: string;
  deliveredDate?: string;
  shipmentNotes?: string;
}

// Extended Order type with shipping fields
export interface OrderWithShipping {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  payment_status: string;
  
  // Shipping mode
  shipping_mode: ShippingMode;
  shipment_status: ShipmentStatus | null;
  
  // Manual shipping fields
  courier_name: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  dispatch_date: string | null;
  delivered_date: string | null;
  shipment_notes: string | null;
  
  // Shiprocket fields (automatic mode)
  shiprocket_order_id?: string | null;
  shiprocket_shipment_id?: string | null;
  shiprocket_awb_number?: string | null;
  shiprocket_tracking_url?: string | null;
  shiprocket_courier_name?: string | null;
  shiprocket_status?: string | null;
  shiprocket_label_pdf_url?: string | null;
  shiprocket_tracking_events?: any;
  
  created_at: string;
  updated_at: string;
}
