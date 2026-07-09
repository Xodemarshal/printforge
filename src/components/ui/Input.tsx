import type React from "react";
import { cn } from "@/lib/utils";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: Props) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-forest/25 bg-primary/5 px-4 py-3 text-sm font-medium text-foreground outline-none ring-offset-background placeholder:text-muted-dark focus:border-forest/40 focus:bg-primary/10 focus:ring-2 focus:ring-primary/20",
        className
      )}
      {...props}
    />
  );
}
