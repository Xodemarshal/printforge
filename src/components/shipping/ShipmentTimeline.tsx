"use client";

/**
 * Shipment Timeline Component
 * Visual timeline showing shipment progress
 */

import { 
  Package, 
  CheckCircle, 
  Printer, 
  Shield, 
  Box, 
  Clock, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";
import type { ShipmentStatus } from "@/types/shipping";
import { SHIPMENT_STATUSES } from "@/types/shipping";

interface ShipmentTimelineProps {
  currentStatus: ShipmentStatus;
  statuses?: ShipmentStatus[];
}

const iconMap = {
  Package,
  CheckCircle,
  Printer,
  Shield,
  Box,
  Clock,
  Truck,
  MapPin,
  CheckCircle2,
  XCircle
};

const defaultStatuses: ShipmentStatus[] = [
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

export function ShipmentTimeline({ currentStatus, statuses = defaultStatuses }: ShipmentTimelineProps) {
  const currentIndex = statuses.indexOf(currentStatus);
  
  // Special handling for cancelled status
  if (currentStatus === "cancelled") {
    return (
      <div className="relative">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <XCircle size={20} className="text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-red-900">Order Cancelled</p>
            <p className="text-sm text-red-700">This order has been cancelled</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      {statuses.map((status, index) => {
        const info = SHIPMENT_STATUSES[status];
        const IconComponent = iconMap[info.icon as keyof typeof iconMap] || Package;
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isFuture = index > currentIndex;

        return (
          <div key={status} className="relative flex items-start gap-4">
            {/* Vertical line */}
            {index < statuses.length - 1 && (
              <div className={`absolute left-5 top-12 h-full w-0.5 ${
                isCompleted ? "bg-primary" : "bg-border"
              }`} />
            )}

            {/* Icon */}
            <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${
              isCompleted 
                ? "bg-primary text-white shadow-md shadow-primary/30" 
                : isCurrent
                ? "bg-primary/20 text-primary ring-4 ring-primary/10"
                : "bg-muted text-muted-foreground"
            }`}>
              <IconComponent size={18} />
            </div>

            {/* Content */}
            <div className={`flex-1 pb-8 ${
              isFuture ? "opacity-50" : ""
            }`}>
              <div className="flex items-center gap-2">
                <p className={`font-semibold ${
                  isCompleted ? "text-primary" : "text-foreground"
                }`}>
                  {info.label}
                </p>
                {isCurrent && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Current
                  </span>
                )}
                {isCompleted && !isCurrent && (
                  <CheckCircle size={14} className="text-primary" />
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {info.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
