"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Star, Heart, Share2, Plus, Minus, ShieldCheck, 
  Globe, RotateCcw, Award, ChevronRight, Package
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { productImage } from "@/lib/design";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { useWishlist } from "@/hooks/useWishlist";

interface ProductDetailClientProps {
  product: any;
  related: { items: any[] };
}

export function ProductDetailClient({ product, related }: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { success } = useToast();
  const { toggle, isInWishlist } = useWishlist();

  // Dynamic color options from product
  const colorOptions = Array.isArray(product.color_options) && product.color_options.length > 0 
    ? product.color_options 
    : ["Natural"];
    
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("Details");

  // Get images with proper fallback
  const getImageUrl = (url: string | null | undefined): string => {
    if (url && url.trim()) return url;
    return productImage(product.slug);
  };

  const mediaUrls = [getImageUrl(product.image_url)];
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  // Color class mapping
  const colorClassMap: Record<string, string> = {
    "Natural": "bg-[#8b5e3c]",
    "Forest": "bg-forest",
    "Green": "bg-moss",
    "Grey": "bg-gray-500",
    "Black": "bg-black",
    "White": "bg-white border-2 border-forest/20",
    "Brown": "bg-[#8b4513]",
    "Blue": "bg-blue-600",
    "Red": "bg-red-600",
  };

  const getColorClass = (color: string): string => {
    const key = Object.keys(colorClassMap).find(k => color.toLowerCase().includes(k.toLowerCase()));
    return key ? colorClassMap[key] : "bg-forest";
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      quantity,
      imageUrl: mediaUrls[0]
    });
    success("Added to Cart", `${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const rating = product.rating || 4.5;
  const reviewCount = product.review_count || 0;
  const badge = product.featured ? "Bestseller" : product.best_seller ? "New Arrival" : null;

  return (
    <div className="page-shell py-8 lg:py-12 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-forest/40">
        <Link href="/" className="hover:text-forest transition-colors">Home</Link>
        <ChevronRight size={10} />
        <Link href="/shop" className="hover:text-forest transition-colors">Shop</Link>
        <ChevronRight size={10} />
        <span className="text-forest/80">{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Image */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-[32px] overflow-hidden bg-cream border border-forest/5 group">
            <img 
              src={mediaUrls[selectedMediaIndex]} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = productImage(product.slug);
              }}
            />
            
            <button
              onClick={() => toggle(product.id)}
              className={`absolute top-6 right-6 p-3 rounded-full backdrop-blur-md transition-all ${
                isInWishlist(product.id) ? "bg-accent/10 text-accent shadow-lg" : "bg-white/80 text-forest/40 hover:text-accent"
              }`}
            >
              <Heart size={20} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
            </button>

            {badge && (
              <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-gold text-white text-[10px] font-bold uppercase tracking-widest">
                {badge}
              </div>
            )}
          </div>
        </div>

        {/* Right: Info & Selection */}
        <div className="space-y-6 sm:space-y-10">
          <div className="space-y-3 sm:space-y-4">
            <h1 className="display-font text-3xl sm:text-4xl lg:text-5xl font-bold text-forest">{product.name}</h1>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < Math.floor(rating) ? "text-gold fill-gold" : "text-forest/10 fill-forest/10"} />
                  ))}
                </div>
                <span className="text-xs font-bold text-forest">{rating.toFixed(1)} <span className="text-forest/40 font-medium">({reviewCount} reviews)</span></span>
              </div>
            </div>
            
            <p className="text-2xl sm:text-3xl font-bold text-forest">{formatCurrency(product.price)}</p>
            
            <p className="text-sm text-forest/50 leading-relaxed max-w-lg">
              {product.description || "Handcrafted with premium materials and attention to detail."}
            </p>
          </div>

          {/* USP Badges */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
             <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-forest/5 text-forest border border-forest/5">
                <Award size={14} className="sm:w-4 sm:h-4 text-gold" />
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Handcrafted</span>
             </div>
             <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-forest/5 text-forest border border-forest/5">
                <Star size={14} className="sm:w-4 sm:h-4 text-gold" />
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Premium Quality</span>
             </div>
             {product.material_info && (
               <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-forest/5 text-forest border border-forest/5">
                  <Package size={14} className="sm:w-4 sm:h-4 text-gold" />
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">{product.material_info}</span>
               </div>
             )}
          </div>

          {/* Color Selection */}
          {colorOptions.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-forest/5">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest">Color Options</h4>
              <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2">
                {colorOptions.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className="flex flex-col items-center gap-2 sm:gap-3 group shrink-0"
                  >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all ${
                      selectedColor === color ? "border-forest p-1 ring-2 ring-forest/20" : "border-transparent"
                    }`}>
                      <div className={`w-full h-full rounded-full ${getColorClass(color)} shadow-inner`} />
                    </div>
                    <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      selectedColor === color ? "text-forest" : "text-forest/30 group-hover:text-forest/60"
                    }`}>
                      {color}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4 sm:space-y-6 pt-6 sm:pt-10 border-t border-forest/5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center bg-forest/5 rounded-2xl p-1 border border-forest/10 w-full sm:w-auto">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-forest/60 hover:text-forest transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="flex-1 sm:w-12 text-center text-sm font-bold text-forest">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-forest/60 hover:text-forest transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="flex gap-3 flex-1">
                <Button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-forest text-alabaster h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px] sm:text-[11px] shadow-lg shadow-forest/20 hover:bg-forest/90 transition-all"
                >
                  Add to Cart
                </Button>
                
                <Button 
                  onClick={handleBuyNow}
                  className="flex-1 bg-gold text-white h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px] sm:text-[11px] shadow-lg hover:bg-gold/90 transition-all"
                >
                  Buy Now
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-6 sm:gap-8">
               <button 
                onClick={() => toggle(product.id)}
                className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-forest/50 hover:text-accent transition-colors"
               >
                 <Heart size={14} className={`sm:w-4 sm:h-4 ${isInWishlist(product.id) ? "text-accent" : ""}`} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                 {isInWishlist(product.id) ? "In Wishlist" : "Add to Wishlist"}
               </button>
               <button className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-forest/50 hover:text-forest transition-colors">
                 <Share2 size={14} className="sm:w-4 sm:h-4" />
                 Share
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-t border-forest/5">
        {[
          { icon: <Award size={20} />, title: "Premium Quality", sub: "Handcrafted with care" },
          { icon: <ShieldCheck size={20} />, title: "Secure Packaging", sub: "Safe & reliable" },
          { icon: <Globe size={20} />, title: "India Delivery", sub: "Fast & tracked" },
          { icon: <RotateCcw size={20} />, title: "Easy Returns", sub: "Hassle free" }
        ].map((item) => (
          <div key={item.title} className="flex items-center gap-4 group cursor-default">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-forest/5 text-forest group-hover:scale-110 transition-transform duration-500">
              {item.icon}
            </div>
            <div>
              <h4 className="text-xs font-bold text-forest uppercase tracking-widest">{item.title}</h4>
              <p className="text-[10px] text-forest/40">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Related Products */}
      {related.items.length > 0 && (
        <div className="border-t border-forest/5 pt-12">
          <h2 className="display-font text-2xl font-bold text-forest mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {related.items.slice(0, 4).map((item: any) => (
              <Link key={item.id} href={`/products/${item.slug}`} className="group">
                <div className="aspect-square rounded-2xl overflow-hidden bg-cream border border-forest/5 mb-3">
                  <img 
                    src={getImageUrl(item.image_url)}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = productImage(item.slug);
                    }}
                  />
                </div>
                <h3 className="font-semibold text-forest text-sm group-hover:text-forest/70 transition-colors">{item.name}</h3>
                <p className="text-sm font-bold text-gold mt-1">{formatCurrency(item.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
