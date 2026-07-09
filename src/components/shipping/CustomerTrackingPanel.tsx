"use client";

/**
 * Customer Tracking Panel
 * Professional tracking display for customers
 */

import { ShipmentTimeline } from "./ShipmentTimeline";
import { Button } from "@/components/ui/Button";
import { Package, ExternalLink, Truck, Calendar } from "lucide-react";
import type { ShippingMode, ShipmentStatus } from "@/types/shipping";

interface CustomerTrackingPanelProps {
  order: any;
}

export function CustomerTrackingPanel({ order }: CustomerTrackingPanelProps) {
  const shippingMode = (order.shipping_mode || "AUTOMATIC") as ShippingMode;
  const isManual = shippingMode === "MANUAL";

  const shipmentStatus: ShipmentStatus = order.shipment_status
    ? (order.shipment_status as ShipmentStatus)
    : mapShiprocketToShipmentStatus(order.shiprocket_status, order.status);

  const courierName = order.courier_name || order.shiprocket_courier_name;
  const trackingNumber = order.tracking_number || order.shiprocket_awb_number;
  const trackingUrl = order.tracking_url || order.shiprocket_tracking_url;
  const dispatchDate = order.dispatch_date;
  const deliveredDate = order.delivered_date;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-forest/15 bg-cream/15 p-6 shadow-[0_10px_24px_rgba(46,75,36,0.04)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-forest">Shipment Tracking</h3>
            <p className="mt-1 text-sm text-forest/70">
              {courierName ? `Shipping via ${courierName}` : "Shipping in progress"}
            </p>
          </div>
          <div className="w-fit rounded-full border border-forest/10 bg-cream/20 px-3 py-1.5">
            <p className="text-xs font-medium text-forest/60">
              {order.payment_status === "paid" ? "✓ Paid" : "Payment Pending"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {courierName && (
            <div className="flex items-start gap-3 rounded-2xl border border-forest/10 bg-cream/15 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest/5">
                <Truck size={18} className="text-forest/50" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-forest/60">Delivery Partner</p>
                <p className="break-words font-medium text-forest">{courierName}</p>
              </div>
            </div>
          )}

          {trackingNumber && (
            <div className="flex items-start gap-3 rounded-2xl border border-forest/10 bg-cream/15 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest/5">
                <Package size={18} className="text-forest/50" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-forest/60">Tracking Number</p>
                <p className="break-all font-mono text-sm font-medium text-forest">{trackingNumber}</p>
              </div>
            </div>
          )}

          {dispatchDate && (
            <div className="flex items-start gap-3 rounded-2xl border border-forest/10 bg-cream/15 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest/5">
                <Calendar size={18} className="text-forest/50" />
              </div>
              <div>
                <p className="text-xs text-forest/60">Dispatched On</p>
                <p className="font-medium text-forest">
                  {new Date(dispatchDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </p>
              </div>
            </div>
          )}

          {deliveredDate && (
            <div className="flex items-start gap-3 rounded-2xl border border-forest/10 bg-cream/15 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest/5">
                <Calendar size={18} className="text-forest/50" />
              </div>
              <div>
                <p className="text-xs text-forest/60">Delivered On</p>
                <p className="font-medium text-forest">
                  {new Date(deliveredDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        {trackingUrl && (
          <div className="mt-4">
            <Button
              onClick={() => window.open(trackingUrl, "_blank")}
              className="w-full bg-forest text-white hover:bg-forest-dark"
            >
              <ExternalLink size={16} className="mr-2" />
              Track Package
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-3xl border border-forest/15 bg-cream/15 p-6 shadow-[0_10px_24px_rgba(46,75,36,0.04)]">
        <h3 className="mb-6 text-lg font-semibold text-forest">Shipment Progress</h3>
        <ShipmentTimeline currentStatus={shipmentStatus} />
      </div>

      {!isManual && Array.isArray(order.shiprocket_tracking_events) && order.shiprocket_tracking_events.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-forest/15 bg-cream/15 p-6 shadow-[0_10px_24px_rgba(46,75,36,0.04)]">
          <h3 className="mb-4 text-lg font-semibold text-forest">Tracking History</h3>
          <div className="space-y-3">
            {order.shiprocket_tracking_events.slice(0, 5).map((event: any, index: number) => (
              <div key={index} className="rounded-2xl border border-forest/10 bg-cream/15 p-4">
                <div className="flex items-start justify-between gap-4">
                  <p className="font-medium text-forest capitalize">
                    {String(event.raw_status || event.shiprocket_status || "Update").replace(/_/g, " ")}
                  </p>
                  <p className="shrink-0 text-xs text-forest/60">
                    {event.timestamp
                      ? new Date(event.timestamp).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "Just now"}
                  </p>
                </div>
                {event.payload?.description && (
                  <p className="mt-1 text-sm text-forest/70">{event.payload.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function mapShiprocketToShipmentStatus(shiprocketStatus: string | null, orderStatus: string): ShipmentStatus {
  if (orderStatus === "cancelled") return "cancelled";
  if (orderStatus === "delivered") return "delivered";

  const normalized = String(shiprocketStatus || "").toLowerCase();

  if (normalized.includes("delivered")) return "delivered";
  if (normalized.includes("out_for_delivery") || normalized.includes("ofd")) return "out_for_delivery";
  if (normalized.includes("shipped") || normalized.includes("in_transit")) return "shipped";
  if (normalized.includes("picked_up")) return "shipped";
  if (normalized.includes("manifested") || normalized.includes("label")) return "ready_for_dispatch";
  if (normalized.includes("packed")) return "packed";

  if (orderStatus === "processing") return "printing";
  if (orderStatus === "confirmed") return "payment_confirmed";

  return "order_placed";
}
