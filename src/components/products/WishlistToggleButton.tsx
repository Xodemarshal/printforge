"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";

export function WishlistToggleButton({ productId }: { productId: string }) {
  const { toggle, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(productId);
  
  return (
    <button
      type="button"
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      onClick={() => toggle(productId)}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        inWishlist 
          ? "border-forest bg-forest text-white hover:bg-forest-dark" 
          : "border-black/10 bg-white/70 text-forest hover:bg-white"
      }`}
    >
      <Heart size={16} className={inWishlist ? "fill-current" : ""} />
      {inWishlist ? "In Wishlist" : "Add to Wishlist"}
    </button>
  );
}
