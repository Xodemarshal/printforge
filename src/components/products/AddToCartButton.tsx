"use client";

import type { CartItem } from "@/types";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  product,
  className
}: {
  product: CartItem;
  className?: string;
}) {
  const { addItem } = useCart();

  return (
    <Button type="button" onClick={() => addItem(product)} className={cn("rounded-full bg-primary px-4 py-2 text-sm", className)}>
      Add to cart
    </Button>
  );
}
