import type React from "react";
import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "secondary" | "destructive";
};

export function Badge({ className, tone = "default", ...props }: Props) {
  const styles =
    tone === "default"
      ? "bg-foreground text-background"
      : tone === "secondary"
      ? "bg-muted text-foreground"
      : "bg-red-600 text-white";
  return <span className={cn("inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium", styles, className)} {...props} />;
}
