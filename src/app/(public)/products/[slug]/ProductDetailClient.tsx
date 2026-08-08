"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star, Heart, Share2, Plus, Minus, ShieldCheck,
  Truck, RotateCcw, Award, ChevronRight, Check, Package2, Lock, KeyRound, Sparkles
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { productImage } from "@/lib/design";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { useWishlist } from "@/hooks/useWishlist";

const SHIPPING_FREE_THRESHOLD = 500;

interface ProductDetailClientProps {
  product: any;
  related: { items: any[] };
  preorder?: any;
  userPreorderAccess?: any;
}

const createMarkup = (html: string) => ({ __html: html });

const formatDescription = (description: string) => {
  if (!description) return '';
  if (description.includes('<') && description.includes('>')) {
    return description
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/g, '')
      .replace(/javascript:/gi, '')
      .trim();
  }
  const paragraphs = description.split('\n\n');
  const formattedParagraphs = paragraphs.map(p => {
    if (!p.trim()) return '';
    let formatted = p
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
    if (formatted.includes('<li>')) formatted = `<ul>${formatted}</ul>`;
    formatted = formatted.replace(/\n/g, '<br>');
    if (!formatted.startsWith('<h') && !formatted.startsWith('<ul') && !formatted.startsWith('<ol') && !formatted.startsWith('<blockquote')) {
      formatted = `<p>${formatted}</p>`;
    }
    return formatted;
  });
  return formattedParagraphs.filter(p => p).join('');
};

export function ProductDetailClient({ product, related, preorder, userPreorderAccess }: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { success } = useToast();
  const { toggle, isInWishlist } = useWishlist();

  const materials = product.material_options || [];
  const sizes = product.size_options || [];
  const colors = product.color_options || [];

  const [selectedMaterial, setSelectedMaterial] = useState(materials[0]);
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const buildMediaArray = () => {
    const media: { type: 'image' | 'video'; url: string }[] = [];
    if (product.image_url) media.push({ type: 'image', url: product.image_url });
    if (product.gallery_urls && Array.isArray(product.gallery_urls)) {
      product.gallery_urls.forEach((url: string) => { if (url) media.push({ type: 'image', url }); });
    }
    if (product.video_url) media.push({ type: 'video', url: product.video_url });
    return media;
  };

  const mediaItems = buildMediaArray();
  const hasMedia = mediaItems.length > 0;
  const rating = product.rating || 0;
  const reviewCount = product.review_count || 0;
  const hasReviews = rating > 0 && reviewCount > 0;
  const descriptionHtml = formatDescription(
    product.description || product.long_description || "Premium quality product handcrafted with care."
  );

  const effectiveBasePrice = userPreorderAccess?.hasAccess
    ? userPreorderAccess.finalCheckoutPrice
    : Number(product.price);

  const handleAddToCart = () => {
    const firstImage = mediaItems.find(m => m.type === 'image')?.url || productImage(product.slug);
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: effectiveBasePrice + (typeof selectedSize === 'object' ? selectedSize.extra || 0 : 0),
      quantity,
      imageUrl: firstImage
    });
  };

  const colorMap: Record<string, string> = {
    natural: "bg-amber-700",
    black: "bg-gray-900",
    white: "bg-white border-2 border-white/20",
    green: "bg-emerald-700",
    blue: "bg-blue-600",
    forest: "bg-emerald-800"
  };

  const getColorClass = (color: string) => {
    const key = Object.keys(colorMap).find(k => color.toLowerCase().includes(k));
    return colorMap[key || "natural"];
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0f1810 0%, #0a130c 60%, #050a06 100%)' }}>

      {/* Breadcrumb */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-cream/60">
            <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link href="/shop" className="hover:text-emerald-400 transition-colors">Shop</Link>
            <ChevronRight size={14} />
            <span className="text-cream font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

          {/* ─── Left: Gallery ─── */}
          <div className="space-y-4">
            {/* Thumbnails */}
            {mediaItems.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {mediaItems.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-emerald-400'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    {media.type === 'image' ? (
                      <img src={media.url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <svg className="w-8 h-8 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            {hasMedia ? (
              <div className="relative aspect-square bg-white/5 rounded-3xl overflow-hidden border border-white/10 group backdrop-blur-md">
                {mediaItems[selectedImage].type === 'image' ? (
                  <img
                    src={mediaItems[selectedImage].url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-black">
                    <iframe
                      src={
                        mediaItems[selectedImage].url.includes('youtube.com') || mediaItems[selectedImage].url.includes('youtu.be')
                          ? `https://www.youtube.com/embed/${mediaItems[selectedImage].url.split('v=')[1] || mediaItems[selectedImage].url.split('/').pop()}?rel=0`
                          : mediaItems[selectedImage].url
                      }
                      className="w-full h-full"
                      allowFullScreen
                      title="Product Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                )}

                {/* Wishlist overlay */}
                <button
                  onClick={() => toggle(product.id)}
                  className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md border transition-all ${
                    isInWishlist(product.id)
                      ? 'bg-red-500/20 border-red-500/40 text-red-400'
                      : 'bg-white/10 border-white/10 text-cream/70 hover:text-red-400 hover:border-red-500/30'
                  }`}
                >
                  <Heart size={20} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                </button>

                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white">
                    {product.badge}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative aspect-square bg-white/5 rounded-3xl overflow-hidden border border-white/10 flex items-center justify-center">
                <div className="text-center text-cream/40">
                  <Package2 size={64} className="mx-auto mb-4" />
                  <p className="text-sm font-medium">No image available</p>
                </div>
              </div>
            )}
          </div>

          {/* ─── Right: Product Info ─── */}
          <div className="space-y-6">

            {/* Title + Rating */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400/70">
                {product.category_name || 'Collectible'}
              </p>
              <h1 className="text-3xl lg:text-4xl font-bold text-cream display-font">{product.name}</h1>

              {hasReviews && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "fill-white/20 text-white/20"}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-cream/60">
                    {rating.toFixed(1)} ({reviewCount} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-4xl font-bold text-emerald-400">
                  {formatCurrency(effectiveBasePrice + (typeof selectedSize === 'object' ? selectedSize.extra || 0 : 0))}
                </span>
                {userPreorderAccess?.hasAccess && userPreorderAccess.reservationFeePaid > 0 && (
                  <span className="text-lg line-through text-cream/30">
                    {formatCurrency(Number(product.price) + (typeof selectedSize === 'object' ? selectedSize.extra || 0 : 0))}
                  </span>
                )}
              </div>

              {/* Description */}
              <div
                className="rich-text-description leading-relaxed text-cream/90"
                dangerouslySetInnerHTML={createMarkup(descriptionHtml)}
              />
            </div>

            {/* Feature badges */}
            <div className="grid grid-cols-3 gap-3 py-4 border-y border-white/10">
              <div className="flex items-center gap-2 text-cream/70">
                <Check size={14} className="text-emerald-400 shrink-0" />
                <span className="text-xs font-medium">In Stock</span>
              </div>
              <div className="flex items-center gap-2 text-cream/70">
                <Truck size={14} className="text-emerald-400 shrink-0" />
                <span className="text-xs font-medium">Fast Ship</span>
              </div>
              <div className="flex items-center gap-2 text-cream/70">
                <Award size={14} className="text-emerald-400 shrink-0" />
                <span className="text-xs font-medium">Premium</span>
              </div>
            </div>

            {/* Material selector */}
            {materials.length > 1 && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400/70">Material</label>
                <div className="flex flex-wrap gap-2">
                  {materials.map((material: any) => {
                    const name = typeof material === 'string' ? material : material.name;
                    const isSelected = selectedMaterial === material;
                    return (
                      <button
                        key={name}
                        onClick={() => setSelectedMaterial(material)}
                        className={`px-4 py-2 rounded-xl border-2 transition-all font-medium text-sm ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white/5 border-white/10 text-cream/70 hover:border-emerald-500/50 hover:text-cream'
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size selector */}
            {sizes.length > 1 && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400/70">Size</label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size: any) => {
                    const sizeName = typeof size === 'string' ? size : size.name;
                    const extra = typeof size === 'object' ? size.extra : 0;
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={sizeName}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-xl border-2 transition-all font-medium text-sm ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white/5 border-white/10 text-cream/70 hover:border-emerald-500/50 hover:text-cream'
                        }`}
                      >
                        {sizeName}
                        {extra > 0 && <span className="text-xs ml-1 opacity-70">(+{formatCurrency(extra)})</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color selector */}
            {colors.length > 1 && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400/70">Color</label>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color: any) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-emerald-400 bg-white/10'
                            : 'border-white/10 bg-white/5 hover:border-white/30'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full ${getColorClass(color)}`} />
                        <span className="text-sm font-medium text-cream/80">{color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity + CTA */}
            <div className="space-y-4 pt-2">
              {/* Quantity + Dimensions row */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400/70">Qty</span>
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 text-cream/70 hover:text-cream hover:bg-white/10 transition-colors"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="px-5 py-3 font-bold text-cream border-x border-white/10">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-3 text-cream/70 hover:text-cream hover:bg-white/10 transition-colors"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>

                {/* Dimensions */}
                {product.dimensions && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                    <Package2 size={14} className="text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-400/70">Dimensions</p>
                      <p className="text-sm font-semibold text-cream">{product.dimensions}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ─── Preorder Gatekeeper ─── */}
              {preorder && !userPreorderAccess?.hasAccess ? (
                <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-3">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                    <Lock size={16} />
                    <span>Vault Release — Reserved for Priority Pass Holders</span>
                  </div>
                  <p className="text-xs text-cream/50 leading-relaxed">
                    This item is in Collector Vault Access stage. Standard checkout is locked until your
                    Priority Access Pass (₹{preorder.reservation_fee || 10}) is secured and approved.
                  </p>
                  <Link
                    href={`/prebook/${preorder.id}`}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-950/40"
                  >
                    <Sparkles size={15} />
                    <span>GET PRIORITY ACCESS PASS (₹{preorder.reservation_fee || 10})</span>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Approved prebooker banner */}
                  {userPreorderAccess?.hasAccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                      <KeyRound size={15} className="shrink-0" />
                      <span>✦ Collector Pass Approved! Your ₹{userPreorderAccess.reservationFeePaid} token is credited to your total.</span>
                    </div>
                  )}

                  {/* Cart buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 py-4 rounded-xl font-bold text-sm bg-white/10 border border-white/10 text-cream hover:bg-white/15 hover:border-white/20 transition-all"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => { handleAddToCart(); router.push('/checkout'); }}
                      className="flex-1 py-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-950/40"
                    >
                      Buy Now
                    </button>
                  </div>
                </>
              )}

              {/* Wishlist / Share */}
              <div className="flex items-center gap-6 pt-1">
                <button
                  onClick={() => toggle(product.id)}
                  className="flex items-center gap-2 text-sm text-cream/50 hover:text-red-400 transition-colors"
                >
                  <Heart size={16} fill={isInWishlist(product.id) ? "currentColor" : "none"} className={isInWishlist(product.id) ? "text-red-400" : ""} />
                  {isInWishlist(product.id) ? 'Wishlisted' : 'Wishlist'}
                </button>
                <button className="flex items-center gap-2 text-sm text-cream/50 hover:text-cream transition-colors">
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.items && related.items.length > 0 && (
          <div className="mt-20 pt-12 border-t border-white/10">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400/70 mb-2">You may also like</p>
            <h2 className="text-2xl font-bold text-cream display-font mb-8">Related Pieces</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.items.slice(0, 4).map((item: any) => (
                <Link key={item.id} href={`/products/${item.slug}`} className="group">
                  <div className="aspect-square bg-white/5 rounded-2xl overflow-hidden mb-3 border border-white/10 group-hover:border-emerald-500/30 transition-colors">
                    <img
                      src={item.image_url || productImage(item.slug)}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = productImage(item.slug);
                      }}
                    />
                  </div>
                  <h3 className="font-semibold text-sm mb-1 text-cream group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="font-bold text-emerald-400 text-sm">{formatCurrency(item.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rich text description styles */}
      <style jsx>{`
        .rich-text-description { line-height: 1.75; }
        .rich-text-description h1,
        .rich-text-description h2,
        .rich-text-description h3,
        .rich-text-description h4,
        .rich-text-description h5,
        .rich-text-description h6 {
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: #6ee7b7; /* emerald-300 */
        }
        .rich-text-description h1 { font-size: 1.5rem; }
        .rich-text-description h2 { font-size: 1.25rem; }
        .rich-text-description h3 { font-size: 1.125rem; }
        .rich-text-description p { margin-bottom: 0.875rem; }
        .rich-text-description ul, .rich-text-description ol { margin-left: 1.25rem; margin-bottom: 0.875rem; }
        .rich-text-description ul { list-style-type: disc; }
        .rich-text-description ol { list-style-type: decimal; }
        .rich-text-description li { margin-bottom: 0.375rem; }
        .rich-text-description strong, .rich-text-description b {
          font-weight: 600;
          color: #a7f3d0; /* emerald-200 */
        }
        .rich-text-description em, .rich-text-description i { font-style: italic; }
        .rich-text-description a {
          color: #34d399; /* emerald-400 */
          text-decoration: underline;
          text-decoration-color: rgba(52, 211, 153, 0.4);
        }
        .rich-text-description a:hover { text-decoration-color: #34d399; }
        .rich-text-description blockquote {
          border-left: 3px solid #34d399;
          padding-left: 1rem;
          margin: 0 0 0.875rem 0;
          font-style: italic;
          opacity: 0.8;
        }
        .rich-text-description code {
          font-family: 'Courier New', monospace;
          background-color: rgba(255,255,255,0.08);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.85em;
          color: #6ee7b7;
        }
        .rich-text-description pre {
          background-color: rgba(255,255,255,0.05);
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin-bottom: 0.875rem;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .rich-text-description img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 1rem 0;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .rich-text-description table { width: 100%; border-collapse: collapse; margin-bottom: 0.875rem; }
        .rich-text-description th, .rich-text-description td {
          border: 1px solid rgba(255,255,255,0.1);
          padding: 0.5rem 0.75rem;
          text-align: left;
        }
        .rich-text-description th {
          background-color: rgba(52,211,153,0.1);
          font-weight: 600;
          color: #6ee7b7;
        }
        .rich-text-description hr {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.1);
          margin: 1.25rem 0;
        }
      `}</style>
    </div>
  );
}
