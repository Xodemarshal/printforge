"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Lock, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { productImage } from "@/lib/design";

type ProductCardProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    image_url?: string | null;
    price: number;
    rating?: number;
    review_count?: number;
    featured?: boolean;
    best_seller?: boolean;
    material_info?: string;
  };
  index?: number;
  /** If set, this product is in Priority Vault mode — cart is locked, CTA links to prebook page */
  preorderId?: string;
};

export function ProductCard({ product, index = 0, preorderId }: ProductCardProps) {
  const { toggle, isInWishlist } = useWishlist();
  const { addItem } = useCart();

  const imageUrl = product.image_url || productImage(product.slug);
  const badge = product.featured ? "Bestseller" : product.best_seller ? "New" : null;
  const isPreorderOnly = Boolean(preorderId);

  return (
    <div className="group relative bg-white/5 rounded-3xl border border-white/10 overflow-hidden hover:border-emerald-500/30 hover:shadow-xl hover:shadow-black/40 transition-all duration-300 backdrop-blur-md">
      {/* Image Container */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden bg-black/40">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = productImage(product.slug);
          }}
        />

        {/* Standard Badge */}
        {badge && !isPreorderOnly && (
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${badge === "Bestseller" ? "bg-amber-400 text-gray-950" : "bg-emerald-500 text-white"}`}>
            {badge}
          </div>
        )}

        {/* Preorder-only badge */}
        {isPreorderOnly && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/90 text-gray-950 text-[9px] font-bold uppercase tracking-widest backdrop-blur-sm">
            <Lock size={9} />
            <span>Priority Pass Only</span>
          </div>
        )}

        {/* Material Badge */}
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-emerald-400 border border-white/10 text-[9px] font-bold uppercase tracking-widest">
          {product.material_info?.split(' ')[0] || "PLA"}
        </div>

        {/* Quick Actions - Show on hover */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggle(product.id);
            }}
            className={`w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-md transition-all ${
              isInWishlist(product.id) ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-black/60 text-cream/70 hover:text-red-400 border border-white/10"
            }`}
          >
            <Heart size={15} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-cream text-sm hover:text-emerald-400 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-3 h-3 ${i < Math.floor(product.rating || 4.5) ? "text-amber-400 fill-amber-400" : "text-white/20 fill-white/20"}`}
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <span className="text-[10px] text-cream/50 font-medium">({product.review_count || 0})</span>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <span className="text-lg font-bold text-emerald-400">{formatCurrency(product.price)}</span>

          {isPreorderOnly ? (
            /* Locked — link to prebook page */
            <Link
              href={`/prebook/${preorderId}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold hover:bg-amber-500/30 transition-all"
            >
              <Sparkles size={11} />
              <span>Get Pass</span>
            </Link>
          ) : (
            /* Normal add-to-cart */
            <button
              onClick={() => {
                addItem({
                  id: product.id,
                  productId: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: Number(product.price),
                  quantity: 1,
                  imageUrl: imageUrl
                });
              }}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-md shadow-emerald-950/40"
            >
              <ShoppingCart size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
