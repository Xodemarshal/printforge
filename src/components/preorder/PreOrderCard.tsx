import Link from "next/link";
import { KeyRound, ArrowRight, Sparkles, Tag } from "lucide-react";
import type { PreOrderRow } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { resolvePreorderPrice } from "@/lib/preorder-utils";

export function PreOrderCard({ preorder }: { preorder: PreOrderRow }) {
  const product = preorder.products;
  const image = preorder.banner_url || product?.image_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80";
  const { lockedPrice, discountPercentage } = resolvePreorderPrice(preorder);
  const originalPrice = product?.price || 0;
  const reservationFee = Number(preorder.reservation_fee || 10);
  const slotsLeft = preorder.max_quantity
    ? Math.max(0, preorder.max_quantity - (preorder.registration_count || 0))
    : null;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-950/20 flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
        <img
          src={image}
          alt={preorder.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs backdrop-blur-md flex items-center gap-1">
            <Sparkles size={12} />
            PRIORITY VAULT ACCESS
          </span>
          {discountPercentage > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs backdrop-blur-md flex items-center gap-1">
              <Tag size={11} />
              {discountPercentage}% OFF
            </span>
          )}
        </div>
        {slotsLeft !== null && (
          <div className="absolute top-4 right-4">
            <span className="px-2.5 py-1 rounded-full bg-black/60 border border-white/10 text-cream/80 text-[11px] font-semibold backdrop-blur-md">
              {slotsLeft} passes left
            </span>
          </div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-cream/50 font-semibold">
            {product?.name || "Exclusive Vault Release"}
          </p>
          <h3 className="display-font text-xl font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">
            {preorder.title}
          </h3>
        </div>
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-emerald-400">₹{reservationFee} Pass</span>
              {discountPercentage > 0 ? (
                <span className="text-xs text-cream/70 font-semibold">Price: {formatCurrency(lockedPrice)} <span className="line-through text-cream/40 text-[10px]">{formatCurrency(originalPrice)}</span></span>
              ) : (
                <span className="text-xs text-cream/40">Value: {formatCurrency(originalPrice)}</span>
              )}
            </div>
            <p className="text-[10px] text-cream/40">Full ₹{reservationFee} credited at checkout</p>
          </div>
          <Link
            href={`/prebook/${preorder.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-950/30"
          >
            Get Priority Pass
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
