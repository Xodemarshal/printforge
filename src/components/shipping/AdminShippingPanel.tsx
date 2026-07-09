"use client";

/**
 * Admin Shipping Management Panel
 * Allows admins to manage shipping for orders
 */

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import {
  getShippingMode,
  createShipment,
  updateManualShipment,
  updateShipmentStatus,
  generateShippingLabel
} from "@/actions/shipping";
import { useToast } from "@/hooks/useToast";
import {
  Package,
  Truck,
  Edit,
  Save,
  RefreshCw,
  FileText,
  CheckCircle,
  Link as LinkIcon
} from "lucide-react";
import type { ShippingMode, ShipmentStatus } from "@/types/shipping";
import { SHIPMENT_STATUSES } from "@/types/shipping";

interface AdminShippingPanelProps {
  order: any;
}

export function AdminShippingPanel({ order }: AdminShippingPanelProps) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);

  const [courierName, setCourierName] = useState(order.courier_name || "");
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || "");
  const [trackingUrl, setTrackingUrl] = useState(order.tracking_url || "");
  const [shipmentNotes, setShipmentNotes] = useState(order.shipment_notes || "");

  const [globalShippingMode, setGlobalShippingMode] = useState<ShippingMode>("AUTOMATIC");
  const hasShipment = order.shiprocket_awb_number || order.tracking_number;

  useEffect(() => {
    async function loadShippingMode() {
      try {
        const result = await getShippingMode();
        if (result.success && result.data?.mode) {
          setGlobalShippingMode(result.data.mode);
        }
      } catch (err) {
        console.error("Failed to load shipping mode:", err);
      }
    }

    loadShippingMode();
  }, []);

  const isManual = globalShippingMode === "MANUAL";

  const handleCreateShipment = () => {
    startTransition(async () => {
      const result = await createShipment(order.id);
      if (result.error) {
        toast.error("Error", result.error);
      } else {
        toast.success("Success", "Shipment created successfully");
      }
    });
  };

  const handleStatusChange = (newStatus: ShipmentStatus) => {
    startTransition(async () => {
      const result = await updateShipmentStatus(order.id, newStatus);
      if (result.error) {
        toast.error("Error", result.error);
      } else {
        toast.success("Success", `Status updated to ${SHIPMENT_STATUSES[newStatus].label}`);
      }
    });
  };

  const handleSaveDetails = () => {
    startTransition(async () => {
      const result = await updateManualShipment(order.id, {
        courierName,
        trackingNumber,
        trackingUrl,
        shipmentNotes
      });

      if (result.error) {
        toast.error("Error", result.error);
      } else {
        toast.success("Success", "Shipping details updated");
        setIsEditing(false);
      }
    });
  };

  const handleGenerateLabel = () => {
    startTransition(async () => {
      const result = await generateShippingLabel(order.id);
      if (result.error) {
        toast.error("Error", result.error);
      } else {
        toast.success("Success", "Label generated successfully");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Shipping Mode</h3>
            <p className="text-sm text-muted-foreground">
              {globalShippingMode === "AUTOMATIC"
                ? "Using Shiprocket API for automated shipping"
                : "Manually managing shipping details"}
            </p>
          </div>
          <div className={`w-fit rounded-full border px-3 py-1.5 text-sm font-medium ${
            globalShippingMode === "AUTOMATIC"
              ? "border-blue-200 bg-blue-50 text-blue-800"
              : "border-purple-200 bg-purple-50 text-purple-800"
          }`}>
            {globalShippingMode === "AUTOMATIC" ? "Automatic (Shiprocket)" : "Manual Shipping"}
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Change global shipping mode in{" "}
          <a href="/admin/settings" className="text-primary hover:underline">
            Admin Settings
          </a>
        </p>
      </div>

      {globalShippingMode === "AUTOMATIC" && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-semibold text-foreground">Shiprocket Shipment</h3>
            {!order.shiprocket_awb_number && (
              <Button onClick={handleCreateShipment} disabled={isPending} className="text-sm">
                <Package size={16} className="mr-2" />
                Create Shipment
              </Button>
            )}
          </div>

          {order.shiprocket_awb_number && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-background/60 p-4">
                  <p className="text-xs text-muted-foreground">AWB Number</p>
                  <p className="mt-1 break-all font-mono text-sm text-foreground">{order.shiprocket_awb_number}</p>
                </div>
                {order.shiprocket_courier_name && (
                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <p className="text-xs text-muted-foreground">Delivery Partner</p>
                    <p className="mt-1 break-words text-sm text-foreground">{order.shiprocket_courier_name}</p>
                  </div>
                )}
                {order.shiprocket_status && (
                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="mt-1 text-sm capitalize text-foreground">{order.shiprocket_status.replace(/_/g, " ")}</p>
                  </div>
                )}
                {order.shiprocket_tracking_url && (
                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <p className="text-xs text-muted-foreground">Tracking Link</p>
                    <a
                      href={order.shiprocket_tracking_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-2 break-all text-sm text-primary hover:underline"
                    >
                      <LinkIcon size={14} />
                      Open tracking
                    </a>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {order.shiprocket_label_pdf_url && (
                  <Button
                    variant="outline"
                    className="text-sm"
                    onClick={() => window.open(order.shiprocket_label_pdf_url, "_blank")}
                  >
                    <FileText size={16} className="mr-2" />
                    View Label
                  </Button>
                )}
                {order.shiprocket_tracking_url && (
                  <Button
                    variant="outline"
                    className="text-sm"
                    onClick={() => window.open(order.shiprocket_tracking_url, "_blank")}
                  >
                    <Package size={16} className="mr-2" />
                    Track
                  </Button>
                )}
                {!order.shiprocket_label_pdf_url && (
                  <Button
                    variant="outline"
                    className="text-sm"
                    onClick={handleGenerateLabel}
                    disabled={isPending}
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Generate Label
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {isManual && (
        <>
          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-3 font-semibold text-foreground">Shipment Status</h3>
            <Select
              value={order.shipment_status || "order_placed"}
              onChange={(e) => handleStatusChange(e.target.value as ShipmentStatus)}
              disabled={isPending}
            >
              {Object.entries(SHIPMENT_STATUSES).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-semibold text-foreground">Shipping Details</h3>
              {!isEditing ? (
                <Button variant="outline" className="text-sm" onClick={() => setIsEditing(true)}>
                  <Edit size={16} className="mr-2" />
                  Edit
                </Button>
              ) : (
                <Button className="text-sm" onClick={handleSaveDetails} disabled={isPending}>
                  <Save size={16} className="mr-2" />
                  Save
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Courier Name</label>
                  <Input
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    placeholder="e.g., India Post, DTDC, Delhivery"
                    disabled={isPending}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Tracking Number</label>
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking/AWB number"
                    disabled={isPending}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Tracking URL (Optional)</label>
                  <Input
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    placeholder="https://..."
                    disabled={isPending}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Internal Notes</label>
                  <Textarea
                    value={shipmentNotes}
                    onChange={(e) => setShipmentNotes(e.target.value)}
                    placeholder="Add any internal notes about this shipment"
                    disabled={isPending}
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {courierName && (
                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <p className="text-xs text-muted-foreground">Delivery Partner</p>
                    <p className="mt-1 break-words text-sm text-foreground">{courierName}</p>
                  </div>
                )}
                {trackingNumber && (
                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <p className="text-xs text-muted-foreground">Tracking Number</p>
                    <p className="mt-1 break-all font-mono text-sm text-foreground">{trackingNumber}</p>
                  </div>
                )}
                {trackingUrl && (
                  <div className="rounded-2xl border border-border bg-background/60 p-4 sm:col-span-2">
                    <p className="text-xs text-muted-foreground">Tracking URL</p>
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-2 break-all text-sm text-primary hover:underline"
                    >
                      <LinkIcon size={14} />
                      View Tracking
                    </a>
                  </div>
                )}
                {shipmentNotes && (
                  <div className="rounded-2xl border border-border bg-background/60 p-4 sm:col-span-2">
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{shipmentNotes}</p>
                  </div>
                )}
                {!courierName && !trackingNumber && (
                  <p className="text-sm text-muted-foreground">No shipping details added yet</p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
