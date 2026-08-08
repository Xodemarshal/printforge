import Link from "next/link";
import { ShieldCheck, Tag, ChevronRight, PackageCheck, Sparkles, KeyRound } from "lucide-react";
import type { PreOrderRow, PreOrderRegistrationRow } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { resolvePreorderPrice } from "@/lib/preorder-utils";
import { PreOrderButton } from "./PreOrderButton";

interface PreOrderDetailsProps {
  preorder: PreOrderRow;
  userRegistration?: PreOrderRegistrationRow | null;
}

export function PreOrderDetails({ preorder, userRegistration }: PreOrderDetailsProps) {
  const product = preorder.products;
  const bannerImage = preorder.banner_url || product?.image_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80";

  const { lockedPrice, discountPercentage, savedAmount } = resolvePreorderPrice(preorder);
  const originalPrice = product?.price || 0;
  const reservationFee = Number(preorder.reservation_fee || 10);
  const remainingFinalPrice = Math.max(0, lockedPrice - reservationFee);

  const isExpired = new Date(preorder.end_date) < new Date();
  const isSoldOut = preorder.max_quantity
    ? (preorder.registration_count || 0) >= preorder.max_quantity
    : false;
  const slotsLeft = preorder.max_quantity
    ? Math.max(0, preorder.max_quantity - (preorder.registration_count || 0))
    : null;

  return (
    <div className="min-h-screen bg-[#0f1810] py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-cream/50">
          <Link href="/" className="hover:text-cream transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href="/prebook" className="hover:text-cream transition-colors">Vault Drops</Link>
          <ChevronRight size={14} />
          <span className="text-emerald-400 font-medium truncate">{preorder.title}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-12 items-start">

          {/* Left: Image + How Vault Access Works */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl shadow-black/40">
              <img src={bannerImage} alt={preorder.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs backdrop-blur-md flex items-center gap-1.5">
                  <Sparkles size={14} />
                  ₹{reservationFee} PRIORITY PASS TOKEN
                </span>
                {discountPercentage > 0 && (
                  <span className="px-3 py-1.5 rounded-full bg-emerald-600 text-white font-bold text-xs backdrop-blur-md flex items-center gap-1">
                    <Tag size={13} />
                    {discountPercentage}% OFF
                  </span>
                )}
              </div>
              {slotsLeft !== null && (
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1.5 rounded-full bg-black/70 border border-white/10 text-cream text-xs font-semibold backdrop-blur-md">
                    {slotsLeft} / {preorder.max_quantity} Collector Passes Left
                  </span>
                </div>
              )}
            </div>

            <div className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md space-y-4">
              <h4 className="font-bold text-emerald-400 text-sm uppercase tracking-wider flex items-center gap-2">
                <KeyRound size={16} />
                How Priority Vault Access Works
              </h4>
              <div className="grid gap-3 text-xs text-cream/70">
                {[
                  { n: 1, title: `Get Priority Pass (₹${reservationFee}):`, body: "Secure your entry token via Razorpay to lock your spot in the initial batch." },
                  { n: 2, title: "Precision Crafting & Queue:", body: "We queue the print run based on verified enthusiast demand." },
                  { n: 3, title: "Batch Opening & Token Credit:", body: `Once your batch opens, complete your order with your ₹${reservationFee} pass credited — pay only ₹${remainingFinalPrice.toLocaleString("en-IN")}!` }
                ].map(({ n, title, body }) => (
                  <div key={n} className="flex gap-3 items-start">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">{n}</span>
                    <p><strong className="text-cream">{title}</strong> {body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Details + Pass Action */}
          <div className="lg:col-span-5 space-y-6">

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[11px] uppercase tracking-widest">
                  Priority Vault Release
                </span>
                {preorder.status === "ACTIVE" && !isExpired && !isSoldOut && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                    ● Active Queue
                  </span>
                )}
              </div>
              <h1 className="display-font text-3xl sm:text-4xl font-bold text-emerald-400">
                {preorder.title}
              </h1>
              {product && (
                <p className="text-sm font-semibold text-cream/70">
                  Edition Product:{" "}
                  <Link href={`/products/${product.slug}`} className="text-emerald-400 hover:underline">
                    {product.name}
                  </Link>
                </p>
              )}
            </div>

            {/* Price Box */}
            <div className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-cream/50 font-semibold block">
                  Pass & Credit Breakdown
                </span>
                {discountPercentage > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1">
                    <Tag size={12} />
                    {discountPercentage}% OFF PREORDER DISCOUNT
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-6 flex-wrap">
                <div>
                  <span className="text-[11px] text-cream/50 block font-semibold">Priority Pass Token:</span>
                  <span className="text-4xl font-bold text-emerald-400">
                    {formatCurrency(reservationFee)}
                  </span>
                </div>
                <div className="border-l border-white/10 pl-6">
                  <span className="text-[11px] text-cream/50 block font-semibold">Remaining Balance:</span>
                  <span className="text-2xl font-bold text-cream">
                    {formatCurrency(remainingFinalPrice)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2">
                {savedAmount > 0 ? (
                  <>
                    <div className="flex items-center justify-between text-xs text-cream/60">
                      <span>Standard Retail Price:</span>
                      <span className="font-bold text-cream line-through opacity-60">{formatCurrency(originalPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                      <span>Preorder Special Price:</span>
                      <span>{formatCurrency(lockedPrice)} (Save {formatCurrency(savedAmount)})</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between text-xs text-cream/60">
                    <span>Full Edition Retail Value:</span>
                    <span className="font-bold text-cream">{formatCurrency(originalPrice)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-cream/60">
                  <span>Pass Token Today:</span>
                  <span className="font-bold text-emerald-400">− {formatCurrency(reservationFee)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-cream/60 font-semibold pt-1 border-t border-white/5">
                  <span>Balance When Batch Opens:</span>
                  <span className="font-bold text-emerald-300">{formatCurrency(remainingFinalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {preorder.description && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Collector Notes</h4>
                <p className="text-sm text-cream/70 leading-relaxed whitespace-pre-line">{preorder.description}</p>
              </div>
            )}

            {/* Deadline Info */}
            <div className="p-4 rounded-2xl border border-white/10 bg-black/40 text-xs text-cream/70 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-cream/50">Vault Window Closes:</span>
                <span className="font-semibold text-cream">
                  {new Date(preorder.end_date).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric"
                  })}
                </span>
              </div>
              {slotsLeft !== null && (
                <div className="flex justify-between items-center">
                  <span className="text-cream/50">Available Pass Slots:</span>
                  <span className="font-bold text-emerald-400">{slotsLeft} remaining</span>
                </div>
              )}
            </div>

            {/* Razorpay Priority Pass Button */}
            <PreOrderButton
              preorderId={preorder.id}
              reservationFee={reservationFee}
              isRegistered={Boolean(userRegistration)}
              paymentStatus={userRegistration?.payment_status || "pending"}
              grantedAccess={userRegistration?.granted_access || false}
              isExpired={isExpired}
              isSoldOut={isSoldOut}
            />

            <div className="flex items-center gap-3 justify-center pt-2 text-xs text-cream/50">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Full ₹{reservationFee} Token Pass Credited to Final Purchase</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
