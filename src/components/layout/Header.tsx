"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, Leaf, Box, HelpCircle, Hammer } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { useCart } from "@/hooks/useCart";

export function Header({
  siteName = "Forest Foundry",
  logoUrl = "https://api.dicebear.com/7.x/bottts/svg?seed=groot&backgroundColor=2c3e2d"
}: {
  siteName?: string;
  logoUrl?: string;
}) {
  const { openCart, getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <header className="sticky top-0 z-40">
      {/* Top Banner */}
      <div className="bg-forest py-2">
        <div className="page-shell flex items-center justify-between text-alabaster">
          <div className="flex items-center gap-2">
            <Leaf size={12} className="text-accent" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              Free shipping on orders above $79
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {/* <Link href="/track-order" className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity">
              <Box size={12} /> Track Order
            </Link> */}
            <Link href="/faq" className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity">
              <HelpCircle size={12} /> Help Center
            </Link>
            {/* <Link href="/workshop" className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity">
              <Hammer size={12} /> Our Workshop
            </Link> */}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-forest/5 bg-alabaster/95 backdrop-blur-md">
        <div className="page-shell flex items-center justify-between py-4 lg:py-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-forest text-white group-hover:scale-105 transition-transform overflow-hidden">
               <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="display-font text-xl font-bold tracking-tight text-forest leading-none">
                {(siteName || "Forest Foundry").split(" ").map((part, index, arr) => (
                  <span key={index}>
                    {part}
                    {index < arr.length - 1 && <br />}
                  </span>
                ))}
              </span>
            </div>
          </Link>

          {/* Navigation - Centered */}
          <nav className="hidden lg:flex items-center gap-8 px-4">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href as any}
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest/70 hover:text-forest transition-all duration-300 relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-forest transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <button className="text-forest/80 hover:text-forest transition-colors">
              <Search size={20} />
            </button>
            
            <Link href="/dashboard" className="text-forest/80 hover:text-forest transition-colors">
              <User size={20} />
            </Link>

            <button
              type="button"
              onClick={openCart}
              className="relative text-forest/80 hover:text-forest transition-colors"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-forest text-[8px] font-bold text-alabaster">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
