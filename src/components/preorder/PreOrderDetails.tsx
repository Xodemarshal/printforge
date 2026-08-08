import Link from "next/link";
import { Sparkles, Clock, ShieldCheck, Tag, ChevronRight, CheckCircle2, PackageCheck } from "lucide-react";
import type { PreOrderRow, PreOrderRegistrationRow } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { PreOrderButton } from "./PreOrderButton";

interface PreOrderDetailsProps {
  preorder: PreOrderRow;
  userRegistration?: PreOrderRegistrationRow | null;
}

export function PreOrderDetails({ preorder, userRegistration }: PreOrderDetailsProps) {
  const product = preorder.products;
  const originalPrice = product?.price || 0;
  const discountPct = Number(preorder.discount_percentage || 0);
  const preorderPrice = Math.round((originalPrice - (originalPrice * discountPct) / 100) * 100) / 100;
  const bannerImage = preorder.banner_url || product?.image_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80";

  const isExpired = new Date(preorder.end_date) < new Date();
  const isSoldOut = preorder.max_quantity ? (preorder.registration_count || 0) >= preorder.max_quantity : false;
  const slotsLeft = preorder.max_quantity ? Math.max(0, preorder.max_quantity - (preorder.registration_count || 0)) : null;

  return (
    <div className="min-h-screen bg-[#0f1810] py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-cream/50">
          <Link href="/" className="hover:text-cream transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href="/prebook" className="hover:text-cream transition-colors">Preorders</Link>
          <ChevronRight size={14} />
          <span className="text-emerald-400 font-medium truncate">{preorder.title}</span>
        </nav>

        {/* Main Grid */}
        <div className="grid gap-10 lg:grid-cols-12 items-start">
          
          {/* Left Column: Preorder Media / Image */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl shadow-black/40">
              <img
                src={bannerImage}
                alt={preorder.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs backdrop-blur-md flex items-center gap-1.5">
                  <Tag size={14} />
                  {discountPct}% EARLY ACCESS DISCOUNT
                </span>
              </div>

              {slotsLeft !== null && (
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1.5 rounded-full bg-black/70 border border-white/10 text-cream text-xs font-semibold backdrop-blur-md">
                    {slotsLeft} / {preorder.max_quantity} Slots Available
                  </span>
                </div>
              )}
            </div>

            {/* How Prebooking Works Panel */}
            <div className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md space-y-4">
              <h4 className="font-bold text-emerald-400 text-sm uppercase tracking-wider flex items-center gap-2">
                <PackageCheck size={16} />
                <span>How Prebooking Works</span>
              </h4>
              <div className="grid gap-3 text-xs text-cream/70">
                <div className="flex gap-3 items-start">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">1</span>
                  <p><strong className="text-cream">Click Prebook:</strong> Instantly lock in your {discountPct}% early bird discount rate (₹{preorderPrice}).</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">2</span>
                  <p><strong className="text-cream">Price Protection Guaranteed:</strong> Even if normal product prices increase later, your price remains locked at ₹{preorderPrice}.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">3</span>
                  <p><strong className="text-cream">Production & Order:</strong> When the product becomes available, complete your purchase using the standard checkout flow with your locked price applied!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Preorder Details & Prebook Action */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[11px] uppercase tracking-widest">
                  Preorder Offer
                </span>
                {preorder.status === "ACTIVE" && !isExpired && !isSoldOut && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                    ● Active Campaign
                  </span>
                )}
              </div>

              <h1 className="display-font text-3xl sm:text-4xl font-bold text-emerald-400">
                {preorder.title}
              </h1>

              {product && (
                <p className="text-sm font-semibold text-cream/70">
                  Target Product: <Link href={`/products/${product.slug}`} className="text-emerald-400 hover:underline">{product.name}</Link>
                </p>
              )}
            </div>

            {/* Price Box */}
            <div className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md space-y-3">
              <span className="text-xs uppercase tracking-widest text-cream/50 font-semibold block">
                Preorder Price Comparison
              </span>
              
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold text-emerald-400">
                  {formatCurrency(preorderPrice)}
                </span>
                {originalPrice > preorderPrice && (
                  <span className="text-lg text-cream/40 line-through font-medium">
                    {formatCurrency(originalPrice)}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs">
                  Save {discountPct}%
                </span>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-cream/60">
                <span>Normal Product Price:</span>
                <span className="font-bold text-cream">{formatCurrency(originalPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-cream/60">
                <span>Locked Preorder Price:</span>
                <span className="font-bold text-emerald-400">{formatCurrency(preorderPrice)}</span>
              </div>
            </div>

            {/* Campaign Details */}
            {preorder.description && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Description & Details</h4>
                <p className="text-sm text-cream/70 leading-relaxed whitespace-pre-line">
                  {preorder.description}
                </p>
              </div>
            )}

            {/* Campaign Deadline Info */}
            <div className="p-4 rounded-2xl border border-white/10 bg-black/40 text-xs text-cream/70 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-cream/50">Campaign Deadline:</span>
                <span className="font-semibold text-cream">
                  {new Date(preorder.end_date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}
                </span>
              </div>
              {slotsLeft !== null && (
                <div className="flex justify-between items-center">
                  <span className="text-cream/50">Remaining Preorder Slots:</span>
                  <span className="font-bold text-emerald-400">{slotsLeft} slots</span>
                </div>
              )}
            </div>

            {/* Preorder Action Button (Client component handling duplicate check & login redirect) */}
            <PreOrderButton
              preorderId={preorder.id}
              lockedPrice={userRegistration?.locked_price || preorderPrice}
              discountPercentage={userRegistration?.discount_percentage || discountPct}
              isRegistered={Boolean(userRegistration)}
              isExpired={isExpired}
              isSoldOut={isSoldOut}
            />

            {/* Guarantee Footer */}
            <div className="flex items-center gap-3 justify-center pt-2 text-xs text-cream/50">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Guaranteed Price Lock — No Price Increases After Prebooking</span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
