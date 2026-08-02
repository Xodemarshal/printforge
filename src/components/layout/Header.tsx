"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, User, Leaf, Box, HelpCircle, Hammer, X } from "lucide-react";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-40">
      {/* Top Banner */}
      <div className="bg-emerald-600 py-2">
        <div className="page-shell flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Leaf size={12} className="text-emerald-200" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              Free shipping on orders above ₹399
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/faq" className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity">
              <HelpCircle size={12} /> Help Center
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-white/10 bg-[#0a130c]/95 backdrop-blur-md">
        <div className="page-shell flex items-center justify-between py-4 lg:py-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-600 text-white group-hover:scale-105 transition-transform overflow-hidden">
               <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="display-font text-xl font-bold tracking-tight text-emerald-400 leading-none">
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
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-cream/70 hover:text-emerald-400 transition-all duration-300 relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <button 
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-cream/70 hover:text-emerald-400 transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            
            <Link href="/dashboard" className="text-cream/70 hover:text-emerald-400 transition-colors">
              <User size={20} />
            </Link>

            <button
              type="button"
              onClick={openCart}
              className="relative text-cream/70 hover:text-emerald-400 transition-colors"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-[8px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-white/10 bg-[#0a130c]">
            <div className="page-shell py-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-3 pr-24 bg-black/30 border border-white/10 rounded-2xl focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-cream placeholder:text-cream/30"
                  autoFocus
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-500 transition-colors"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="p-1.5 text-cream/50 hover:text-cream transition-colors"
                    aria-label="Close search"
                  >
                    <X size={18} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
