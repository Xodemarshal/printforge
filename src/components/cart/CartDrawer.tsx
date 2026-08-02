"use client";

import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils";
import { SHIPPING_FREE_THRESHOLD } from "@/lib/constants";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalPrice } = useCart();
  const subtotal = getTotalPrice();
  const remaining = Math.max(0, SHIPPING_FREE_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / SHIPPING_FREE_THRESHOLD) * 100);

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close cart overlay"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={closeCart}
        />
      ) : null}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col border-l border-white/10 bg-[#0a130c] text-cream shadow-[-20px_0_60px_rgba(0,0,0,0.8)] backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-400/80 font-semibold">Your cart</p>
              <h2 className="display-font text-2xl text-emerald-400 font-bold">Cart ({items.length})</h2>
            </div>
            <button
              type="button"
              onClick={closeCart}
              aria-label="Close cart"
              className="rounded-full p-1.5 text-cream/70 hover:text-cream hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Free Shipping Tracker */}
          {remaining > 0 ? (
            <div className="border-b border-white/10 px-5 py-3 bg-black/20">
              <p className="text-xs text-cream/70 font-medium">
                Add <span className="font-bold text-emerald-400">{formatCurrency(remaining)}</span> more for free shipping
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : subtotal > 0 ? (
            <div className="border-b border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <span>🎉</span> You qualify for free shipping!
            </div>
          ) : null}

          {/* Cart Items List */}
          <div className="flex-1 space-y-3 overflow-auto p-4">
            {items.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-cream/60 font-medium mb-4">Your cart is empty.</p>
                <Link 
                  href="/shop" 
                  onClick={closeCart}
                  className="inline-block rounded-2xl bg-emerald-600 text-white px-6 py-3 text-sm font-semibold hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-950/40"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : null}
            {items.map((item) => (
              <div key={item.productId} className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md shadow-sm">
                <div className="flex items-center gap-3.5">
                  <img
                    src={item.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(item.slug)}/160/160`}
                    alt={item.name}
                    className="h-20 w-20 rounded-xl object-cover border border-white/10 bg-black/40"
                  />
                  <div className="min-w-0 flex-1">
                    <Link 
                      href={`/products/${item.slug}`}
                      onClick={closeCart}
                      className="block truncate font-semibold text-cream hover:text-emerald-400 text-sm transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm font-bold text-emerald-400 mt-0.5">{formatCurrency(item.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        aria-label="Decrease quantity"
                        className="grid h-7 w-7 place-items-center rounded-lg border border-white/15 bg-black/30 text-cream/80 hover:bg-white/10 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="min-w-6 text-center text-sm font-bold text-cream">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="grid h-7 w-7 place-items-center rounded-lg border border-white/15 bg-black/30 text-cream/80 hover:bg-white/10 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeItem(item.productId)} 
                    aria-label="Remove item" 
                    className="text-cream/40 hover:text-red-400 p-1.5 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Subtotal & Actions */}
          {items.length > 0 && (
            <div className="border-t border-white/10 bg-black/30 p-5 backdrop-blur-md">
              <div className="flex items-center justify-between text-sm">
                <span className="text-cream/70 font-semibold">Subtotal</span>
                <span className="text-xl font-bold text-emerald-400">{formatCurrency(subtotal)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-4 block rounded-2xl bg-emerald-600 px-4 py-3.5 text-center text-sm font-bold text-white hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-950/40"
              >
                Checkout
              </Link>
              <Link
                href="/shop"
                onClick={closeCart}
                className="mt-2.5 block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-cream hover:bg-white/10 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
