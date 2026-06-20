import { ORDER_STATUSES, type OrderStatus } from "@/types";
import { SHIPROCKET_TRACKING_STAGES } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";

export function OrderTimeline({ status, shipmentStatus }: { status: OrderStatus; shipmentStatus?: string | null }) {
  const currentIndex = ORDER_STATUSES.indexOf(status);
  const shipmentIndex = shipmentStatus ? SHIPROCKET_TRACKING_STAGES.indexOf(shipmentStatus as (typeof SHIPROCKET_TRACKING_STAGES)[number]) : -1;
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-forest/50">Order Status</p>
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map((item, index) => (
            <Badge key={item} tone={index <= currentIndex ? "default" : "secondary"}>
              {item}
            </Badge>
          ))}
        </div>
      </div>
      {shipmentIndex >= 0 && (
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-forest/50">Delivery Timeline</p>
          <div className="flex flex-wrap gap-2">
            {SHIPROCKET_TRACKING_STAGES.map((item, index) => (
              <Badge key={item} tone={index <= shipmentIndex ? "default" : "secondary"}>
                {item.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
