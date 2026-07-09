"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star, Heart, Share2, Plus, Minus, ShieldCheck,
  Truck, RotateCcw, Award, ChevronRight, Check, Package2
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

// Helper function to create HTML markup from text with basic formatting
const createMarkup = (html: string) => {
  return { __html: html };
};

// Helper to format description text for HTML display
const formatDescription = (description: string) => {
  if (!description) return '';
  
  // If it already looks like HTML (has tags), return as-is
  if (description.includes('<') && description.includes('>')) {
    // Clean up any malformed HTML and ensure it's safe
    return description
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/on\w+="[^"]*"/g, '') // Remove inline event handlers
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .trim();
  }
  
  // Otherwise format plain text into HTML with enhanced formatting
  const paragraphs = description.split('\n\n');
  const formattedParagraphs = paragraphs.map(p => {
    if (!p.trim()) return '';
    
    // Handle markdown-like formatting
    let formatted = p
      // Headers
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      // Lists
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Code
      .replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // If the paragraph starts with <li> tags, wrap it in <ul>
    if (formatted.includes('<li>')) {
      formatted = `<ul>${formatted}</ul>`;
    }
    
    // Add line breaks within paragraphs
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Only wrap in <p> if it's not already a header, list, or other block element
    if (!formatted.startsWith('<h') && !formatted.startsWith('<ul') && !formatted.startsWith('<ol') && !formatted.startsWith('<blockquote')) {
      formatted = `<p>${formatted}</p>`;
    }
    
    return formatted;
  });
  
  return formattedParagraphs.filter(p => p).join('');
};

export function ProductDetailClient({ product, related }: ProductDetailClientProps) {
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

  // Build media array from uploaded content only
  const buildMediaArray = () => {
    const media: { type: 'image' | 'video'; url: string }[] = [];

    // Add main image if exists
    if (product.image_url) {
      media.push({ type: 'image', url: product.image_url });
    }

    // Add gallery images if exist
    if (product.gallery_urls && Array.isArray(product.gallery_urls)) {
      product.gallery_urls.forEach((url: string) => {
        if (url) {
          media.push({ type: 'image', url });
        }
      });
    }

    // Add video if exists
    if (product.video_url) {
      media.push({ type: 'video', url: product.video_url });
    }

    return media;
  };

  const mediaItems = buildMediaArray();
  const hasMedia = mediaItems.length > 0;
  // Use actual rating/review data or hide it
  const rating = product.rating || 0;
  const reviewCount = product.review_count || 0;
  const hasReviews = rating > 0 && reviewCount > 0;
  
  // Format the description for HTML display
  const descriptionHtml = formatDescription(
    product.description || product.long_description || "Premium quality product handcrafted with care"
  );

  const handleAddToCart = () => {
    const firstImage = mediaItems.find(m => m.type === 'image')?.url || productImage(product.slug);
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price) + (typeof selectedSize === 'object' ? selectedSize.extra || 0 : 0),
      quantity,
      imageUrl: firstImage
    });
    // Toast is handled by useCart hook - no need for duplicate
  };

  const colorMap: Record<string, string> = {
    natural: "bg-amber-700",
    black: "bg-gray-900",
    white: "bg-white border-2 border-gray-200",
    green: "bg-green-700",
    blue: "bg-blue-600",
    forest: "bg-forest"
  };

  const getColorClass = (color: string) => {
    const key = Object.keys(colorMap).find(k => color.toLowerCase().includes(k));
    return colorMap[key || "natural"];
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f1810' }}>
      <div className="border-b border-gray-800" style={{ backgroundColor: '#0a130c', borderColor: 'rgb(197, 160, 89)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm" style={{ color: 'rgb(197, 160, 89)' }}>
            <Link href="/" className="hover:opacity-80 transition-opacity" style={{ color: 'rgb(197, 160, 89)' }}>Home</Link>
            <ChevronRight size={14} />
            <Link href="/shop" className="hover:opacity-80 transition-opacity" style={{ color: 'rgb(197, 160, 89)' }}>Shop</Link>
            <ChevronRight size={14} />
            <span className="font-medium" style={{ color: 'rgb(197, 160, 89)' }}>{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

          {/* Left - Images/Video Gallery */}
          <div className="space-y-4">
            {/* Thumbnails - Only show if multiple media items */}
            {mediaItems.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {mediaItems.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-gray-700' : 'border-gray-800 hover:border-gray-600'
                      }`}
                    style={selectedImage === index ? { borderColor: 'rgb(197, 160, 89)' } : { borderColor: '#374151' }}
                  >
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                        <svg className="w-8 h-8" style={{ color: 'rgb(197, 160, 89)' }} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Main Media Display */}
            {hasMedia ? (
              <div className="relative aspect-square bg-gray-900/50 rounded-3xl overflow-hidden border border-gray-800 group" style={{ borderColor: 'rgb(197, 160, 89)' }}>
                {mediaItems[selectedImage].type === 'image' ? (
                  <img
                    src={mediaItems[selectedImage].url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-black">
                    <iframe
                      src={mediaItems[selectedImage].url.includes('youtube.com') || mediaItems[selectedImage].url.includes('youtu.be')
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

                <button
                  onClick={() => toggle(product.id)}
                  className={`absolute top-4 right-4 p-3 rounded-full transition-all ${isInWishlist(product.id)
                    ? "bg-red-900 text-red-300"
                    : "bg-gray-900/90 backdrop-blur hover:bg-gray-800"
                    }`}
                  style={{ color: isInWishlist(product.id) ? '#f87171' : 'rgb(197, 160, 89)' }}
                >
                  <Heart size={20} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                </button>

                {product.badge && (
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ backgroundColor: 'rgb(197, 160, 89)', color: '#0f1810' }}
                  >
                    {product.badge}
                  </div>
                )}
              </div>
            ) : (
              // Fallback: No media uploaded
              <div className="relative aspect-square bg-gray-900/50 rounded-3xl overflow-hidden border border-gray-800 flex items-center justify-center" style={{ borderColor: 'rgb(197, 160, 89)' }}>
                <div className="text-center" style={{ color: 'rgb(197, 160, 89)' }}>
                  <Package2 size={64} className="mx-auto mb-4 opacity-50" />
                  <p className="text-sm font-medium">No image available</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6" style={{ color: 'rgb(197, 160, 89)' }}>
            <div className="space-y-4">
              <h1 className="text-3xl lg:text-4xl font-bold" style={{ color: 'rgb(197, 160, 89)' }}>{product.name}</h1>

              {/* Only show rating if there are actual reviews */}
              {hasReviews && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < Math.floor(rating) ? "fill-current" : "text-gray-200 fill-gray-200"}
                        style={{ color: i < Math.floor(rating) ? 'rgb(197, 160, 89)' : undefined }}
                      />
                    ))}
                  </div>
                  <span className="text-sm" style={{ color: 'rgb(197, 160, 89)' }}>
                    {rating.toFixed(1)} ({reviewCount} reviews)
                  </span>
                </div>
              )}

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold" style={{ color: 'rgb(197, 160, 89)' }}>
                  {formatCurrency(
                    Number(product.price) + (typeof selectedSize === 'object' ? selectedSize.extra || 0 : 0)
                  )}
                </span>
              </div>

              {/* Product Description with HTML markup support */}
              <div 
                className="rich-text-description space-y-4 leading-relaxed max-w-full overflow-hidden"
                style={{ color: 'rgb(197, 160, 89)' }}
                dangerouslySetInnerHTML={createMarkup(descriptionHtml)}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 py-4 border-y border-gray-800" style={{ borderColor: 'rgb(197, 160, 89)' }}>
              <div className="flex items-center gap-2" style={{ color: 'rgb(197, 160, 89)' }}>
                <Check size={16} className="shrink-0" />
                <span className="text-xs font-medium">In Stock</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: 'rgb(197, 160, 89)' }}>
                <Truck size={16} className="shrink-0" />
                <span className="text-xs font-medium">Fast Ship</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: 'rgb(197, 160, 89)' }}>
                <Award size={16} className="shrink-0" />
                <span className="text-xs font-medium">Premium</span>
              </div>
            </div>

            {materials.length > 1 && (
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgb(197, 160, 89)' }}>Material</label>
                <div className="flex flex-wrap gap-2">
                  {materials.map((material: any) => (
                    <button
                      key={typeof material === 'string' ? material : material.name}
                      onClick={() => setSelectedMaterial(material)}
                      className={`px-4 py-2 rounded-xl border-2 transition-all font-medium text-sm ${selectedMaterial === material
                        ? "bg-gray-800 text-white border-gray-700"
                        : "border-gray-700 hover:border-gray-600 text-gray-300"
                        }`}
                      style={selectedMaterial === material ? 
                        { backgroundColor: 'rgb(197, 160, 89)', borderColor: 'rgb(197, 160, 89)', color: '#0f1810' } : 
                        { borderColor: 'rgb(197, 160, 89)', color: 'rgb(197, 160, 89)' }
                      }
                    >
                      {typeof material === 'string' ? material : material.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sizes.length > 1 && (
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgb(197, 160, 89)' }}>Size</label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size: any) => {
                    const sizeName = typeof size === 'string' ? size : size.name;
                    const extra = typeof size === 'object' ? size.extra : 0;
                    return (
                      <button
                        key={sizeName}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-xl border-2 transition-all font-medium text-sm ${selectedSize === size
                          ? "bg-gray-800 text-white border-gray-700"
                          : "border-gray-700 hover:border-gray-600 text-gray-300"
                          }`}
                        style={selectedSize === size ? 
                          { backgroundColor: 'rgb(197, 160, 89)', borderColor: 'rgb(197, 160, 89)', color: '#0f1810' } : 
                          { borderColor: 'rgb(197, 160, 89)', color: 'rgb(197, 160, 89)' }
                        }
                      >
                        {sizeName}
                        {extra > 0 && <span className="text-xs ml-1">(+{formatCurrency(extra)})</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {colors.length > 1 && (
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgb(197, 160, 89)' }}>Color</label>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color: any) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all ${selectedColor === color
                        ? "border-gray-700"
                        : "border-transparent hover:border-gray-600"
                        }`}
                      style={selectedColor === color ? 
                        { borderColor: 'rgb(197, 160, 89)' } : 
                        { borderColor: 'transparent' }
                      }
                    >
                      <div className={`w-6 h-6 rounded-full ${getColorClass(color)}`} />
                      <span className="text-sm font-medium" style={{ color: 'rgb(197, 160, 89)' }}>{color}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 hover:bg-gray-800 transition-colors"
                    style={{ color: 'rgb(197, 160, 89)' }}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-6 py-3 font-bold border-x-2 border-gray-700" style={{ color: 'rgb(197, 160, 89)' }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 hover:bg-gray-800 transition-colors"
                    style={{ color: 'rgb(197, 160, 89)' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 py-4 rounded-xl font-bold text-sm hover:opacity-90 transition-all"
                  style={{ backgroundColor: 'rgb(197, 160, 89)', color: '#0f1810' }}
                >
                  Add to Cart
                </Button>
                <Button
                  onClick={() => {
                    handleAddToCart();
                    router.push('/checkout');
                  }}
                  className="flex-1 py-4 rounded-xl font-bold text-sm hover:opacity-90 transition-all"
                  style={{ backgroundColor: 'rgb(197, 160, 89)', color: '#0f1810' }}
                >
                  Buy Now
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <button
                  onClick={() => toggle(product.id)}
                  className="flex items-center gap-2 text-sm hover:opacity-80 transition-colors"
                  style={{ color: 'rgb(197, 160, 89)' }}
                >
                  <Heart size={18} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                  Wishlist
                </button>
                <button className="flex items-center gap-2 text-sm hover:opacity-80 transition-colors" style={{ color: 'rgb(197, 160, 89)' }}>
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-2xl p-6 space-y-3" style={{ borderColor: 'rgb(197, 160, 89)' }}>
              {[
                { icon: <ShieldCheck size={20} />, text: "Secure Payment" },
                { icon: <Truck size={20} />, text: "Free Shipping over $50" },
                { icon: <RotateCcw size={20} />, text: "10-Day Returns" }
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3" style={{ color: 'rgb(197, 160, 89)' }}>
                  {feature.icon}
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {related.items && related.items.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8" style={{ color: 'rgb(197, 160, 89)' }}>You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.items.slice(0, 4).map((item: any) => (
                <Link key={item.id} href={`/products/${item.slug}`} className="group">
                  <div className="aspect-square bg-gray-900/50 rounded-2xl overflow-hidden mb-3 border border-gray-800" style={{ borderColor: 'rgb(197, 160, 89)' }}>
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
                  <h3 className="font-semibold text-sm mb-1 group-hover:opacity-80 transition-colors" style={{ color: 'rgb(197, 160, 89)' }}>
                    {item.name}
                  </h3>
                  <p className="font-bold" style={{ color: 'rgb(197, 160, 89)' }}>{formatCurrency(item.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* CSS for rich text description styling */}
      <style jsx>{`
        .rich-text-description {
          line-height: 1.7;
        }
        .rich-text-description h1,
        .rich-text-description h2,
        .rich-text-description h3,
        .rich-text-description h4,
        .rich-text-description h5,
        .rich-text-description h6 {
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: rgb(197, 160, 89);
        }
        .rich-text-description h1 { font-size: 1.875rem; }
        .rich-text-description h2 { font-size: 1.5rem; }
        .rich-text-description h3 { font-size: 1.25rem; }
        .rich-text-description h4 { font-size: 1.125rem; }
        .rich-text-description h5 { font-size: 1rem; }
        .rich-text-description h6 { font-size: 0.875rem; }
        
        .rich-text-description p {
          margin-bottom: 1rem;
        }
        
        .rich-text-description ul,
        .rich-text-description ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .rich-text-description li {
          margin-bottom: 0.5rem;
        }
        
        .rich-text-description ul {
          list-style-type: disc;
        }
        
        .rich-text-description ol {
          list-style-type: decimal;
        }
        
        .rich-text-description strong,
        .rich-text-description b {
          font-weight: 600;
          color: rgb(197, 160, 89);
        }
        
        .rich-text-description em,
        .rich-text-description i {
          font-style: italic;
          color: rgb(197, 160, 89);
        }
        
        .rich-text-description a {
          color: rgb(197, 160, 89);
          text-decoration: underline;
          text-decoration-color: rgba(197, 160, 89, 0.4);
        }
        
        .rich-text-description a:hover {
          text-decoration-color: rgb(197, 160, 89);
        }
        
        .rich-text-description blockquote {
          border-left: 3px solid rgb(197, 160, 89);
          padding-left: 1rem;
          margin-left: 0;
          margin-right: 0;
          margin-bottom: 1rem;
          font-style: italic;
          color: rgba(197, 160, 89, 0.9);
        }
        
        .rich-text-description code {
          font-family: 'Courier New', monospace;
          background-color: rgba(0, 0, 0, 0.2);
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        
        .rich-text-description pre {
          background-color: rgba(0, 0, 0, 0.2);
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin-bottom: 1rem;
        }
        
        .rich-text-description img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        
        .rich-text-description table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1rem;
        }
        
        .rich-text-description th,
        .rich-text-description td {
          border: 1px solid rgba(197, 160, 89, 0.3);
          padding: 0.5rem;
          text-align: left;
        }
        
        .rich-text-description th {
          background-color: rgba(197, 160, 89, 0.1);
          font-weight: 600;
        }
        
        .rich-text-description hr {
          border: none;
          border-top: 1px solid rgba(197, 160, 89, 0.3);
          margin: 1.5rem 0;
        }
      `}</style>
    </div>
  );
}
