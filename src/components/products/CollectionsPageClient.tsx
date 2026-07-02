"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, LayoutGrid, List } from "lucide-react";
import { ProductCard } from "./ProductCard";

interface CollectionsPageClientProps {
  initialProducts: any[];
  categories: any[];
  total: number;
  currentPage: number;
  pageSize: number;
  pageTitle?: string;
  pageSubtitle?: string;
}

const MATERIALS = [
  { label: "All Materials", count: 620, id: "all", checked: true },
  { label: "PLA", count: 620, id: "pla", checked: false },
  { label: "Resin", count: 410, id: "resin", checked: false },
  { label: "Wood Fill PLA", count: 130, id: "wood", checked: false },
  { label: "TPU", count: 80, id: "tpu", checked: false },
  { label: "Metal", count: 50, id: "metal", checked: false }
];

const RATINGS = [
  { stars: 5, count: 339 },
  { stars: 4, count: 420 },
  { stars: 3, count: 210 },
  { stars: 2, count: 80 },
  { stars: 1, count: 12 }
];

export function CollectionsPageClient({
  initialProducts,
  categories,
  total,
  currentPage,
  pageSize
}: CollectionsPageClientProps) {
  const formatRupees = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("Popular");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(4000); // Rupee-based upper bound
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(["all"]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);

  const toggleMaterial = (id: string) => {
    if (id === "all") {
      setSelectedMaterials(["all"]);
    } else {
      setSelectedMaterials(prev => {
        const newSelection = prev.filter(m => m !== "all");
        if (newSelection.includes(id)) {
          const filtered = newSelection.filter(m => m !== id);
          return filtered.length === 0 ? ["all"] : filtered;
        }
        return [...newSelection, id];
      });
    }
  };

  const toggleRating = (stars: number) => {
    setSelectedRatings(prev => {
      if (prev.includes(stars)) {
        return prev.filter(r => r !== stars);
      }
      return [...prev, stars];
    });
  };

  // Filter products based on selected filters
  const filteredProducts = initialProducts.filter(product => {
    // Price filter
    const price = Number(product.price);
    if (price < priceMin || price > priceMax) return false;

    // Material filter
    if (!selectedMaterials.includes("all")) {
      const productMaterial = (product.material_info || "").toLowerCase();
      const matchesMaterial = selectedMaterials.some(mat => {
        if (mat === "pla") return productMaterial.includes("pla") && !productMaterial.includes("wood");
        if (mat === "wood") return productMaterial.includes("wood");
        if (mat === "resin") return productMaterial.includes("resin");
        if (mat === "tpu") return productMaterial.includes("tpu");
        if (mat === "metal") return productMaterial.includes("metal");
        return false;
      });
      if (!matchesMaterial) return false;
    }

    // Rating filter
    if (selectedRatings.length > 0) {
      const productRating = Math.floor(product.rating || 0);
      if (!selectedRatings.includes(productRating)) return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "Price: Low to High":
        return Number(a.price) - Number(b.price);
      case "Price: High to Low":
        return Number(b.price) - Number(a.price);
      case "Newest First":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "Best Rating":
        return (b.rating || 0) - (a.rating || 0);
      default: // Popular
        return (b.review_count || 0) - (a.review_count || 0);
    }
  });

  const displayedProducts = sortedProducts;

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="page-shell py-4 border-b border-forest/5">
        <nav className="flex items-center gap-2 text-[11px] text-forest/60">
          <Link href="/" className="hover:text-forest transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-forest font-medium">Collections</span>
        </nav>
      </div>

      <div className="page-shell py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-forest mb-2">All Collections</h1>
              <p className="text-sm text-forest/50">
                Discover our wide range of handcrafted collectibles, made for true collectors.
              </p>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-2xl border border-forest/5 p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-forest">Categories</h3>
              <div className="space-y-2">
                <Link 
                  href="/shop"
                  className="flex items-center gap-3 text-sm text-forest/60 hover:text-forest transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth={2} />
                  </svg>
                  <span>All Products</span>
                  <span className="ml-auto text-xs text-forest/40">{total}</span>
                </Link>
                {categories.slice(0, 6).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className="flex items-center gap-3 text-sm text-forest/60 hover:text-forest transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth={2} />
                    </svg>
                    <span>{cat.name}</span>
                    <span className="ml-auto text-xs text-forest/40">{cat.product_count || 0}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Filter By */}
            <div className="bg-white rounded-2xl border border-forest/5 p-6 space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-forest">Filter By</h3>

              {/* Material */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-forest">Material</h4>
                <div className="space-y-3">
                  {MATERIALS.map((material) => (
                    <label key={material.id} className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedMaterials.includes(material.id)}
                          onChange={() => toggleMaterial(material.id)}
                          className="w-4 h-4 rounded border-forest/30 text-forest focus:ring-forest"
                        />
                        <span className="text-sm text-forest/70 group-hover:text-forest transition-colors">
                          {material.label}
                        </span>
                      </div>
                      <span className="text-xs text-forest/40">{material.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-forest">Price Range</h4>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="4000"
                    step="500"
                    value={priceMax}
                    onChange={(e) => setPriceMax(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-forest/10 rounded-full appearance-none cursor-pointer accent-forest"
                    style={{
                      background: `linear-gradient(to right, #2c3e2d 0%, #2c3e2d ${(priceMax / 4000) * 100}%, #e5e5e5 ${(priceMax / 4000) * 100}%, #e5e5e5 100%)`
                    }}
                  />
                  <div className="flex items-center justify-between text-sm font-semibold text-forest">
                    <span>{formatRupees(priceMin)}</span>
                    <span>{formatRupees(priceMax)}{priceMax >= 4000 ? '+' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-forest">Rating</h4>
                <div className="space-y-3">
                  {RATINGS.map((rating) => (
                    <label key={rating.stars} className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedRatings.includes(rating.stars)}
                          onChange={() => toggleRating(rating.stars)}
                          className="w-4 h-4 rounded border-forest/30 text-forest focus:ring-forest"
                        />
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-3 h-3 ${i < rating.stars ? "text-accent fill-accent" : "text-forest/10 fill-forest/10"}`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-forest/40">({rating.count})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-forest/5 p-4">
              <p className="text-sm text-forest/60">
                Showing <span className="font-semibold text-forest">1-{displayedProducts.length}</span> of <span className="font-semibold text-forest">{displayedProducts.length}</span> products
              </p>

              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-white border border-forest/10 rounded-xl text-sm text-forest focus:outline-none focus:border-forest"
                >
                  <option>Sort by: Popular</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest First</option>
                  <option>Best Rating</option>
                </select>

                {/* View Toggle */}
                <div className="flex items-center gap-1 p-1 bg-forest/5 rounded-xl">
                  <button
                    onClick={() => setView("grid")}
                    className={`p-2 rounded-lg transition-all ${view === "grid" ? "bg-white text-forest shadow-sm" : "text-forest/40"}`}
                    title="Grid View"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setView("list")}
                    className={`p-2 rounded-lg transition-all ${view === "list" ? "bg-white text-forest shadow-sm" : "text-forest/40"}`}
                    title="List View"
                  >
                    <List size={16} />
                  </button>
                </div>

                {/* View: Grid text */}
                <span className="hidden lg:block text-sm text-forest/60">
                  View: <span className="font-semibold text-forest capitalize">{view}</span>
                </span>
              </div>
            </div>

            {/* Products Grid */}
            <div className={`grid gap-6 ${view === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" : "grid-cols-1"}`}>
              {displayedProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>

            {/* No Results */}
            {displayedProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-lg font-semibold text-forest mb-2">No products found</p>
                <p className="text-sm text-forest/60">Try adjusting your filters</p>
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 py-8">
              <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-forest/10 text-forest/40 hover:text-forest hover:bg-forest/5 transition-colors">
                <ChevronRight size={16} className="rotate-180" />
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-forest text-white font-semibold text-sm shadow-lg shadow-forest/20">
                1
              </button>
              {[2, 3, 4, 5, 6].map((page) => (
                <button
                  key={page}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-forest/10 text-forest/60 hover:text-forest hover:bg-forest/5 transition-colors text-sm"
                >
                  {page}
                </button>
              ))}
              <span className="text-forest/40 px-2">...</span>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-forest/10 text-forest/60 hover:text-forest hover:bg-forest/5 transition-colors text-sm">
                107
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-forest/10 text-forest/40 hover:text-forest hover:bg-forest/5 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </main>
        </div>

        {/* Trust Bar */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 py-8 border-t border-forest/5">
          {[
            { icon: "⭐", title: "Premium Quality", subtitle: "Handcrafted with care" },
            { icon: "📦", title: "Secure Packaging", subtitle: "Safe & reliable" },
            { icon: "🇮🇳", title: "India Delivery", subtitle: "Fast & tracked" },
            { icon: "🔄", title: "Easy Returns", subtitle: "Hassle free" }
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-forest/5 text-2xl">
                {item.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-forest">{item.title}</h4>
                <p className="text-xs text-forest/50">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Mascot */}
      <div className="fixed bottom-8 right-8 z-50 hidden xl:block pointer-events-none">
        <div className="relative pointer-events-auto">
          <img 
            src="https://api.dicebear.com/7.x/bottts/svg?seed=groot&backgroundColor=f5f1e8" 
            alt="Groot Mascot" 
            className="w-32 h-32 drop-shadow-2xl hover:scale-110 transition-transform duration-500" 
          />
          <div className="absolute -top-2 -left-2 w-24 h-24 bg-gold/20 rounded-full blur-2xl -z-10" />
        </div>
      </div>
    </div>
  );
}
