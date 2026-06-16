"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, TreePine } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { useCart } from "@/hooks/useCart";

export function Header() {
  const { items, openCart, getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <header className="sticky top-0 z-40 border-b border-forest/15 panel-alabaster backdrop-blur-md">
      <div className="page-shell flex items-center justify-between gap-4 py-4 lg:py-5">
        <Link href="/" className="flex items-center gap-2 sm:gap-4 group shrink-0">
          <span className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-2xl bg-forest text-cream shadow-lg shadow-forest/20 transition-all duration-500 group-hover:scale-105 group-hover:rotate-3">
            <TreePine size={20} className="sm:w-6 sm:h-6" />
          </span>
          <div className="hidden sm:flex flex-col">
            <span className="display-font text-lg sm:text-xl font-bold tracking-tight text-brand-primary leading-none">PrintForge</span>
            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-secondary-light mt-1 opacity-75">Creative Products</span>
          </div>
        </Link>

        <nav className="hidden xl:flex items-center gap-6 2xl:gap-10 px-4">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href as any}
              className="text-[10px] 2xl:text-[11px] font-bold uppercase tracking-[0.2em] text-secondary-medium hover:text-primary-medium transition-all duration-300 whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <form
            action="/shop"
            method="get"
            className="hidden lg:flex items-center gap-3 rounded-full border border-forest/15 bg-cream/60 px-4 py-2 transition-all duration-500 focus-within:border-forest/40 focus-within:bg-cream/90 focus-within:shadow-lg backdrop-blur-sm"
          >
            <Search size={16} className="text-primary-medium" />
            <input
              name="q"
              type="search"
              placeholder="Search products..."
              className="w-32 xl:w-44 bg-transparent text-sm font-medium outline-none placeholder:text-secondary-light"
            />
          </form>

          <div className="h-8 w-px bg-forest/15 mx-1 hidden lg:block" />

          <div className="flex items-center gap-1 sm:gap-2">
            <NotificationBell />
            
            <button
              type="button"
              onClick={openCart}
              className="group relative inline-flex h-10 sm:h-12 items-center gap-2 rounded-full border border-forest/15 bg-cream/60 px-3 sm:px-4 text-sm font-bold text-primary-medium transition-all duration-300 hover:bg-cream/90 backdrop-blur-sm shrink-0"
            >
              <ShoppingCart size={16} className="text-primary-medium sm:w-5 sm:h-5" />
              <span className="hidden xl:inline uppercase tracking-widest text-[10px] text-secondary-medium">Cart</span>
              {totalItems > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-5 w-5 sm:h-6 sm:w-6 place-items-center rounded-full bg-forest text-[9px] sm:text-[10px] font-black text-cream shadow-xl">
                  {totalItems}
                </span>
              ) : null}
            </button>

            <Link
              href="/dashboard"
              className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-full border border-forest/15 bg-cream/60 text-primary-medium transition-all duration-300 hover:bg-cream/90 backdrop-blur-sm shrink-0"
            >
              <User size={16} className="sm:w-5 sm:h-5" />
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
