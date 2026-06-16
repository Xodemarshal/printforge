import { ORDER_STATUSES, type OrderStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const currentIndex = ORDER_STATUSES.indexOf(status);
  return (
    <div className="flex flex-wrap gap-2">
      {ORDER_STATUSES.map((item, index) => (
        <Badge key={item} tone={index <= currentIndex ? "default" : "secondary"}>
          {item}
        </Badge>
      ))}
    </div>
  );
}
