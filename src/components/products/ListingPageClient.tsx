"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, LayoutGrid, List, ChevronDown, Star, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "./ProductCard";
interface ListingPageClientProps {
  initialProducts: any[];
  categories: any[];
  total: number;
  currentPage: number;
  pageSize: number;
  title: string;
  subtitle?: string;
}

export function ListingPageClient({
  initialProducts,
  categories,
  total,
  currentPage,
  pageSize,
  title,
  subtitle
}: ListingPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formatRupees = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("all");
  const [priceRange, setPriceRange] = useState(4000);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);

  // Filter products based on selections
  const filteredProducts = initialProducts.filter(product => {
    // Material filter
    if (selectedMaterial !== "all") {
      const productMaterial = product.material_info?.toLowerCase() || "";
      if (!productMaterial.includes(selectedMaterial.toLowerCase())) {
        return false;
      }
    }

    // Price filter
    if (product.price > priceRange) {
      return false;
    }

    // Rating filter
    if (selectedRating && product.rating < selectedRating) {
      return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default: // popular
        return (b.review_count || 0) - (a.review_count || 0);
    }
  });

  const materials = [
    { label: "All Materials", id: "all" },
    { label: "PLA", id: "pla" },
    { label: "Resin", id: "resin" },
    { label: "PETG", id: "petg" },
    { label: "Wood Fill PLA", id: "wood" },
    { label: "TPU", id: "tpu" }
  ];

  const ratings = [5, 4, 3, 2, 1];

  return (
    <div className="min-h-screen bg-alabaster">
      {/* Header with breadcrumb */}
      <div className="bg-cream/30 border-b border-forest/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-forest/60 mb-6">
            <Link href="/" className="hover:text-forest transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-forest font-medium">{title}</span>
          </nav>
          
          <h1 className="display-font text-4xl lg:text-5xl text-forest font-bold mb-4">{title}</h1>
          {subtitle && (
            <p className="text-forest/60 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          
          {/* Sidebar Filters */}
          <aside className={`space-y-8 lg:block ${showFilters ? 'block' : 'hidden'}`}>
            {/* Categories */}
            <div className="space-y-4">
              <div className="flex items-center justify-between group cursor-pointer">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest">Categories</h3>
                <ChevronDown size={14} className="text-forest/30" />
              </div>
              <div className="space-y-1">
                <Link 
                  href="/shop"
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-forest/5 text-forest font-bold text-xs"
                >
                  <span>All Products</span>
                  <span className="text-[10px] opacity-40">{total}</span>
                </Link>
                {categories.map((cat) => (
                  <Link 
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-forest/5 text-forest/60 hover:text-forest transition-all duration-300 text-xs"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-40">{cat.product_count || 0}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Filter By */}
            <div className="space-y-6">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest flex items-center justify-between">
                Filter By
                <ChevronDown size={14} className="text-forest/30" />
              </h3>

              {/* Material */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-forest/40">Material</p>
                <div className="space-y-3">
                  {materials.map((m) => {
                    const materialCount = initialProducts.filter(p => 
                      m.id === 'all' || p.material_info?.toLowerCase().includes(m.id.toLowerCase())
                    ).length;
                    
                    return (
                      <label key={m.id} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div 
                            onClick={() => setSelectedMaterial(m.id)}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              selectedMaterial === m.id 
                                ? 'bg-forest border-forest' 
                                : 'border-forest/20 group-hover:border-forest/40'
                            }`}
                          >
                            {selectedMaterial === m.id && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="text-xs text-forest/60 group-hover:text-forest transition-colors">
                            {m.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-forest/30">{materialCount}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-forest/40">Price Range</p>
                <div className="space-y-4">
                  <input 
                    type="range" 
                    min="0" 
                    max="4000" 
                    step="500"
                    value={priceRange}
                    onChange={(e) => setPriceRange(parseInt(e.target.value))}
                    className="w-full h-1 bg-forest/10 rounded-full appearance-none cursor-pointer accent-forest"
                  />
                  <div className="flex items-center justify-between text-[11px] font-bold text-forest">
                    <span>{formatRupees(0)}</span>
                    <span>{formatRupees(priceRange)}+</span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-forest/40">Rating</p>
                <div className="space-y-3">
                  {ratings.map((r) => {
                    const ratingCount = initialProducts.filter(p => (p.rating || 0) >= r).length;
                    
                    return (
                      <label key={r} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={12} 
                                className={i < r ? "text-accent fill-accent" : "text-forest/10 fill-forest/10"} 
                              />
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedRating(selectedRating === r ? null : r)}
                          className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                            selectedRating === r 
                              ? 'bg-forest text-white' 
                              : 'text-forest/30 hover:bg-forest/5'
                          }`}
                        >
                          ({ratingCount})
                        </button>
                      </label>
                    );
                  })}
                </div>
              </div>
              
              {/* Reset Filters */}
              {(selectedMaterial !== "all" || priceRange < 4000 || selectedRating !== null) && (
                <button
                  onClick={() => {
                    setSelectedMaterial("all");
                    setPriceRange(4000);
                    setSelectedRating(null);
                  }}
                  className="w-full mt-4 px-4 py-2 bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-accent/20 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <section className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-[11px] font-medium text-forest/40">
                Showing <span className="text-forest">1-{sortedProducts.length}</span> of <span className="text-forest">{total}</span> products
              </p>

              <div className="flex items-center gap-4">
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-forest/10 rounded-xl text-xs font-bold text-forest hover:bg-forest/5 transition-colors"
                >
                  <SlidersHorizontal size={14} />
                  Filters
                </button>

                {/* Sort Dropdown */}
                <div className="relative group">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-forest/5 px-4 py-2 pr-10 rounded-xl text-xs font-bold text-forest hover:border-forest/20 transition-all cursor-pointer focus:outline-none focus:border-forest"
                  >
                    <option value="popular">Sort by: Popular</option>
                    <option value="newest">Sort by: Newest</option>
                    <option value="price-asc">Sort by: Price (Low)</option>
                    <option value="price-desc">Sort by: Price (High)</option>
                    <option value="rating">Sort by: Rating</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-forest/30 pointer-events-none" />
                </div>

                {/* View Toggles */}
                <div className="flex items-center p-1 bg-forest/5 rounded-xl">
                  <button 
                    onClick={() => setView("grid")}
                    className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-white text-forest shadow-sm' : 'text-forest/40 hover:text-forest'}`}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button 
                    onClick={() => setView("list")}
                    className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-white text-forest shadow-sm' : 'text-forest/40 hover:text-forest'}`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {sortedProducts.length > 0 ? (
              <div className={`grid gap-6 ${
                view === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {sortedProducts.map((product, index) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    index={index} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-cream/30 border border-forest/10 rounded-3xl p-12 text-center">
                <p className="text-lg text-forest/70 mb-2">No products match your filters</p>
                <p className="text-sm text-forest/50 mb-6">Try adjusting your filter criteria</p>
                <button
                  onClick={() => {
                    setSelectedMaterial("all");
                    setPriceRange(4000);
                    setSelectedRating(null);
                  }}
                  className="px-6 py-2 bg-forest text-white text-sm font-bold rounded-xl hover:bg-forest/90 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {sortedProducts.length > 0 && Math.ceil(total / pageSize) > 1 && (
              <div className="flex items-center justify-center pt-10 border-t border-forest/5">
                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-forest/5 text-forest/40 hover:text-forest transition-colors">
                    <ChevronRight size={16} className="rotate-180" />
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-forest text-alabaster font-bold text-xs shadow-lg shadow-forest/20">
                    1
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-forest/5 text-forest/60 transition-colors font-bold text-xs">
                    2
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-forest/5 text-forest/60 transition-colors font-bold text-xs">
                    3
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-forest/5 text-forest/60 transition-colors font-bold text-xs">
                    ...
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-forest/5 text-forest/40 hover:text-forest transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
