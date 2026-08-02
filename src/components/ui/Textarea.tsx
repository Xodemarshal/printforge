import type React from "react";
import { cn } from "@/lib/utils";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: Props) {
  return (
    <textarea
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-cream outline-none ring-offset-background placeholder:text-cream/30 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all",
        className
      )}
      {...props}
    />
  );
}
