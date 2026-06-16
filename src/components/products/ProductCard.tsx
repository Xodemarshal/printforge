"use client";

import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useWishlist } from "@/hooks/useWishlist";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { productImage, productTag } from "@/lib/design";

type ProductCardProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    image_url?: string | null;
    price: number;
    rating?: number;
    review_count?: number;
  };
  index?: number;
};

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { toggle } = useWishlist();
  // Prioritize real image_url over placeholder
  const image = product.image_url || productImage(product.slug);
  const tag = productTag(index);

  return (
    <article className="product-card-dark group overflow-hidden rounded-[24px] transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(42,30,23,0.45)]">
      <div className="relative aspect-[4/5] overflow-hidden p-3">
        <div className="gold-border relative h-full overflow-hidden rounded-[16px]">
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
        </div>
        <button
          type="button"
          aria-label="Toggle wishlist"
          onClick={() => toggle(product.id)}
          className="absolute right-5 top-5 z-10 text-[#c5a059] transition hover:scale-110"
        >
          <Heart size={16} fill="currentColor" />
        </button>
        <span className="absolute bottom-5 left-5 rounded border border-[#c5a059]/40 bg-black/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#c5a059] backdrop-blur-sm">
          {tag}
        </span>
      </div>

      <div className="wood-footer px-4 py-3">
        <p className="display-font text-lg leading-tight text-[#f4ecd9]">{product.name}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#c5a059]">{formatCurrency(product.price)}</p>
          <span className="inline-flex items-center gap-1 text-xs text-[#d9cfbf]">
            <Star size={12} className="text-[#c5a059]" fill="currentColor" />
            {product.rating ?? 0}
            <span className="text-[#a89880]">({product.review_count ?? 0})</span>
          </span>
        </div>
      </div>

      <div className="flex gap-2 bg-[#1f1612] px-4 pb-4">
        <Link
          href={`/products/${product.slug}`}
          className="flex-1 rounded-full border border-[#c5a059]/30 px-3 py-2 text-center text-xs font-medium text-[#c5a059] transition hover:bg-[#c5a059]/10"
        >
          View detail
        </Link>
        <AddToCartButton
          product={{
            id: product.id,
            productId: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            quantity: 1,
            imageUrl: image
          }}
          className="flex-1 rounded-full bg-[#c5a059] px-3 py-2 text-xs font-semibold text-[#2a1e17] hover:opacity-90"
        />
      </div>
    </article>
  );
}
