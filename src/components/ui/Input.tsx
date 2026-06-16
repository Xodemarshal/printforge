import type React from "react";
import { cn } from "@/lib/utils";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: Props) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-forest/15 bg-cream/80 px-4 py-3 text-sm font-medium text-primary-dark outline-none ring-offset-background placeholder:text-secondary-light focus:border-forest/30 focus:bg-cream focus:ring-2 focus:ring-forest/10 dark:border-forest/25 dark:bg-primary/5 dark:text-foreground dark:placeholder:text-muted-dark dark:focus:border-forest/40 dark:focus:bg-primary/10",
        className
      )}
      {...props}
    />
  );
}
