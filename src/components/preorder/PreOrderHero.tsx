"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Clock, ArrowRight, ShieldCheck, Tag } from "lucide-react";
import type { PreOrderRow } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { resolvePreorderPrice } from "@/lib/preorder-utils";

export function PreOrderHero({ preorder }: { preorder: PreOrderRow }) {
  const product = preorder.products;
  const bannerImage = preorder.banner_url || product?.image_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80";

  const { lockedPrice, discountPercentage, savedAmount } = resolvePreorderPrice(preorder);
  const reservationFee = Number(preorder.reservation_fee || 10);
  const originalPrice = product?.price || 0;

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date(preorder.end_date).getTime();
    const updateTimer = () => {
      const diff = targetDate - Date.now();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [preorder.end_date]);

  const slotsLeft = preorder.max_quantity
    ? Math.max(0, preorder.max_quantity - (preorder.registration_count || 0))
    : null;

  return (
    <section className="relative overflow-hidden bg-[#0c160e] border-b border-white/10 py-12 lg:py-20">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-400/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="page-shell relative z-10">
        <div className="grid gap-12 lg:grid-cols-2 items-center">

          {/* Left: Info */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                <Sparkles size={14} className="animate-pulse" />
                <span>Collector Edition — Priority Vault Access</span>
                {slotsLeft !== null && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-500/30 text-[10px] text-white">
                    {slotsLeft} passes left
                  </span>
                )}
              </div>
              {discountPercentage > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-md">
                  <Tag size={13} />
                  {discountPercentage}% OFF PREORDER DISCOUNT
                </span>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cream/60">
                {product?.name || "Exclusive Vault Release"}
              </p>
              <h1 className="display-font text-4xl sm:text-5xl lg:text-6xl text-emerald-400 font-bold leading-tight">
                {preorder.title}
              </h1>
              {preorder.description && (
                <p className="text-base sm:text-lg text-cream/70 leading-relaxed max-w-xl">
                  {preorder.description}
                </p>
              )}
            </div>

            {/* Pricing / Pass Card */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-4">
              <div className="flex items-baseline gap-6 flex-wrap">
                <div>
                  <span className="text-xs uppercase tracking-widest text-cream/50 block font-semibold">Priority Pass Token</span>
                  <span className="text-3xl sm:text-4xl font-bold text-emerald-400">
                    {formatCurrency(reservationFee)}
                  </span>
                </div>
                <div className="border-l border-white/10 pl-6">
                  <span className="text-xs uppercase tracking-widest text-cream/50 block font-semibold">Preorder Locked Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-cream">
                      {formatCurrency(lockedPrice)}
                    </span>
                    {savedAmount > 0 && (
                      <span className="text-xs text-cream/40 line-through">
                        {formatCurrency(originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-xs text-cream/60 leading-relaxed">
                ✦ Secure your <strong>Priority Pass Token (₹{reservationFee})</strong> to lock in your discounted preorder price of <strong>{formatCurrency(lockedPrice)}</strong>{savedAmount > 0 ? ` (saving ${formatCurrency(savedAmount)})` : ''}. Your ₹{reservationFee} pass token is fully credited at checkout when your batch opens!
              </p>
            </div>

            {/* Countdown */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-cream/60 font-semibold">
                <Clock size={14} className="text-emerald-400" />
                <span>Vault Window Closing</span>
              </div>
              <div className="grid grid-cols-4 gap-3 max-w-md">
                {[
                  { label: "Days", value: timeLeft.days },
                  { label: "Hours", value: timeLeft.hours },
                  { label: "Mins", value: timeLeft.minutes },
                  { label: "Secs", value: timeLeft.seconds }
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
                    <span className="block text-2xl font-bold text-cream">{value}</span>
                    <span className="text-[10px] text-cream/50 uppercase tracking-widest">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href={`/prebook/${preorder.id}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-base shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02]"
              >
                <span>GET PRIORITY PASS (₹{reservationFee})</span>
                <ArrowRight size={18} />
              </Link>
              {product && (
                <Link
                  href={`/products/${product.slug}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-white/10 bg-white/5 text-cream hover:bg-white/10 font-semibold text-sm transition-all"
                >
                  View Product Details
                </Link>
              )}
            </div>
          </div>

          {/* Right: Image */}
          <div className="relative">
            <div className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden rounded-[36px] border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl shadow-black/40 group">
              <img
                src={bannerImage}
                alt={preorder.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={20} className="text-emerald-400" />
                  <span className="text-xs font-semibold text-cream">Pass Credited at Final Checkout</span>
                </div>
                <span className="text-xs text-emerald-400 font-bold">₹{reservationFee} Token Pass</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
