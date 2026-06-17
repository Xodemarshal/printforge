import type React from "react";
import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "secondary" | "destructive" | "success" | "warning" | "info";
};

export function Badge({ className, tone = "default", ...props }: Props) {
  const styles = {
    default: "bg-gray-800 text-gray-100",
    secondary: "bg-muted text-foreground",
    destructive: "bg-red-900/30 text-red-400 border border-red-800",
    success: "bg-green-900/30 text-green-400 border border-green-800",
    warning: "bg-yellow-900/30 text-yellow-400 border border-yellow-800",
    info: "bg-blue-900/30 text-blue-400 border border-blue-800",
  }[tone];

  return (
    <span 
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors", 
        styles, 
        className
      )} 
      {...props} 
    />
  );
}
