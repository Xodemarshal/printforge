"use client";

import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 150;

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalPrice } = useCart();
  const subtotal = getTotalPrice();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close cart overlay"
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={closeCart}
        />
      ) : null}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col border-l border-black/10 bg-[#fdf8f1] shadow-[-20px_0_60px_rgba(42,30,23,0.15)]">
          <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/45">Your cart</p>
              <h2 className="display-font text-2xl text-[#243223]">Cart ({items.length})</h2>
            </div>
            <button type="button" onClick={closeCart} aria-label="Close cart" className="rounded-full p-1 hover:bg-black/5">
              <X size={18} />
            </button>
          </div>

          {remaining > 0 ? (
            <div className="border-b border-black/8 px-5 py-3">
              <p className="text-xs text-foreground/60">
                Add {formatCurrency(remaining)} more for free shipping
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/8">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : subtotal > 0 ? (
            <div className="border-b border-green-200 bg-green-50 px-5 py-2 text-xs font-medium text-green-700">
              You qualify for free shipping!
            </div>
          ) : null}

          <div className="flex-1 space-y-3 overflow-auto p-4">
            {items.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">Your cart is empty.</p>
                <Link 
                  href="/shop" 
                  onClick={closeCart}
                  className="inline-block rounded-full bg-forest text-white px-4 py-2 text-sm font-medium hover:bg-forest-dark transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : null}
            {items.map((item) => (
              <div key={item.productId} className="rounded-[20px] border border-black/10 bg-white/80 p-3">
                <div className="flex items-center gap-3">
                  <img
                    src={item.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(item.slug)}/160/160`}
                    alt={item.name}
                    className="h-20 w-20 rounded-2xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <Link 
                      href={`/products/${item.slug}`}
                      onClick={closeCart}
                      className="block truncate font-medium text-[#243223] hover:text-forest"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-[#c5a059]">{formatCurrency(item.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        aria-label="Decrease quantity"
                        className="grid h-7 w-7 place-items-center rounded-full border border-black/10 bg-white hover:bg-gray-50"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="min-w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="grid h-7 w-7 place-items-center rounded-full border border-black/10 bg-white hover:bg-gray-50"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeItem(item.productId)} 
                    aria-label="Remove item" 
                    className="text-foreground/40 hover:text-red-500 p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {items.length > 0 && (
            <div className="border-t border-black/10 p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground/60">Subtotal</span>
                <span className="text-lg font-semibold text-[#243223]">{formatCurrency(subtotal)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-4 block rounded-full bg-forest px-4 py-3 text-center text-sm font-semibold text-white hover:bg-forest-dark transition-colors"
              >
                Checkout
              </Link>
              <Link
                href="/shop"
                onClick={closeCart}
                className="mt-2 block rounded-full border border-black/10 bg-white/70 px-4 py-3 text-center text-sm font-medium hover:bg-white transition-colors"
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
