"use client";

import Link from "next/link";
import { Heart, Eye, ShoppingCart } from "lucide-react";
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
};

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { toggle, isInWishlist } = useWishlist();
  const { addItem } = useCart();
  
  const imageUrl = product.image_url || productImage(product.slug);
  const badge = product.featured ? "Bestseller" : product.best_seller ? "New" : null;

  return (
    <div className="group relative bg-gray-900/30 rounded-2xl border border-forest/20 overflow-hidden hover:shadow-xl hover:shadow-forest/10 transition-all duration-300">
      {/* Image Container */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-800/30">
        <img 
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = productImage(product.slug);
          }}
        />
        
        {/* Badge */}
        {badge && (
          <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${badge === "Bestseller" ? "bg-yellow-500 text-gray-900" : "bg-forest text-white"}`}>
            {badge}
          </div>
        )}

        {/* Material Badge */}
        <div className="absolute bottom-4 left-4 px-3 py-1 rounded-lg bg-forest/80 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-widest">
          {product.material_info?.split(' ')[0] || "PLA"}
        </div>

        {/* Quick Actions - Show on hover */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggle(product.id);
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-md transition-all ${
              isInWishlist(product.id) ? "bg-accent/10 text-accent" : "bg-gray-900/90 text-forest/60 hover:text-accent"
            }`}
          >
            <Heart size={16} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-900/90 backdrop-blur-md text-forest/60 hover:text-forest transition-colors">
            <Eye size={16} />
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-forest text-sm hover:text-forest/70 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-3 h-3 ${i < Math.floor(product.rating || 4.5) ? "text-yellow-400 fill-yellow-400" : "text-forest/30 fill-forest/30"}`}
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <span className="text-[10px] text-forest/70 font-medium">({product.review_count || 0})</span>
        </div>

        {/* Price & Cart */}
        <div className="flex items-center justify-between pt-2 border-t border-forest/20">
          <span className="text-lg font-bold text-forest">{formatCurrency(product.price)}</span>
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
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-forest/20 text-forest hover:bg-forest hover:text-white transition-all"
          >
            <ShoppingCart size={14} />
          </button>
        </div>

        {/* Quick View Icons */}
        <div className="flex items-center gap-3 pt-2">
          <button className="text-[10px] text-forest/70 hover:text-forest transition-colors flex items-center gap-1 font-medium">
            <Eye size={12} />
            Quick view
          </button>
          <button className="text-[10px] text-forest/70 hover:text-forest transition-colors flex items-center gap-1 font-medium">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Compare
          </button>
        </div>
      </div>
    </div>
  );
}
