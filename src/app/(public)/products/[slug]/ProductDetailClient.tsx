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
  const rating = product.rating || 4.8;
  const reviewCount = product.review_count || 128;

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
    <div className="min-h-screen bg-alabaster">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-forest">Home</Link>
            <ChevronRight size={14} />
            <Link href="/shop" className="hover:text-forest">Shop</Link>
            <ChevronRight size={14} />
            <span className="text-forest font-medium">{product.name}</span>
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
                    className={`relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-forest' : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
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
              <div className="relative aspect-square bg-white rounded-3xl overflow-hidden border border-gray-100 group">
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
                    ? "bg-red-50 text-red-500"
                    : "bg-white/90 backdrop-blur text-gray-600 hover:text-red-500"
                    }`}
                >
                  <Heart size={20} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                </button>

                {product.badge && (
                  <div className="absolute top-4 left-4 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold">
                    {product.badge}
                  </div>
                )}
              </div>
            ) : (
              // Fallback: No media uploaded
              <div className="relative aspect-square bg-cream/50 rounded-3xl overflow-hidden border border-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Package2 size={64} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm font-medium">No image available</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl lg:text-4xl font-bold text-forest">{product.name}</h1>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < Math.floor(rating) ? "text-accent fill-accent" : "text-gray-200 fill-gray-200"}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {rating} ({reviewCount} reviews)
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-forest">
                  {formatCurrency(
                    Number(product.price) + (typeof selectedSize === 'object' ? selectedSize.extra || 0 : 0)
                  )}
                </span>
              </div>

              <p className="text-gray-600 leading-relaxed">
                {product.description || product.long_description || "Premium quality product handcrafted with care"}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 py-4 border-y border-gray-100">
              <div className="flex items-center gap-2 text-forest">
                <Check size={16} className="shrink-0" />
                <span className="text-xs font-medium">In Stock</span>
              </div>
              <div className="flex items-center gap-2 text-forest">
                <Truck size={16} className="shrink-0" />
                <span className="text-xs font-medium">Fast Ship</span>
              </div>
              <div className="flex items-center gap-2 text-forest">
                <Award size={16} className="shrink-0" />
                <span className="text-xs font-medium">Premium</span>
              </div>
            </div>

            {materials.length > 1 && (
              <div className="space-y-3">
                <label className="text-sm font-bold text-forest uppercase tracking-wider">Material</label>
                <div className="flex flex-wrap gap-2">
                  {materials.map((material: any) => (
                    <button
                      key={typeof material === 'string' ? material : material.name}
                      onClick={() => setSelectedMaterial(material)}
                      className={`px-4 py-2 rounded-xl border-2 transition-all font-medium text-sm ${selectedMaterial === material
                        ? "border-forest bg-forest text-white"
                        : "border-gray-200 hover:border-forest/50"
                        }`}
                    >
                      {typeof material === 'string' ? material : material.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sizes.length > 1 && (
              <div className="space-y-3">
                <label className="text-sm font-bold text-forest uppercase tracking-wider">Size</label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size: any) => {
                    const sizeName = typeof size === 'string' ? size : size.name;
                    const extra = typeof size === 'object' ? size.extra : 0;
                    return (
                      <button
                        key={sizeName}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-xl border-2 transition-all font-medium text-sm ${selectedSize === size
                          ? "border-forest bg-forest text-white"
                          : "border-gray-200 hover:border-forest/50"
                          }`}
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
                <label className="text-sm font-bold text-forest uppercase tracking-wider">Color</label>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color: any) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all ${selectedColor === color
                        ? "border-forest"
                        : "border-transparent hover:border-gray-200"
                        }`}
                    >
                      <div className={`w-6 h-6 rounded-full ${getColorClass(color)}`} />
                      <span className="text-sm font-medium">{color}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-6 py-3 font-bold border-x-2 border-gray-200">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-forest text-white py-4 rounded-xl font-bold text-sm hover:bg-forest/90 transition-all"
                >
                  Add to Cart
                </Button>
                <Button
                  onClick={() => {
                    handleAddToCart();
                    router.push('/checkout');
                  }}
                  className="flex-1 bg-accent text-white py-4 rounded-xl font-bold text-sm hover:bg-accent/90 transition-all"
                >
                  Buy Now
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <button
                  onClick={() => toggle(product.id)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition-colors"
                >
                  <Heart size={18} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                  Wishlist
                </button>
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-forest transition-colors">
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            </div>

            <div className="bg-forest/5 rounded-2xl p-6 space-y-3">
              {[
                { icon: <ShieldCheck size={20} />, text: "Secure Payment" },
                { icon: <Truck size={20} />, text: "Free Shipping over $50" },
                { icon: <RotateCcw size={20} />, text: "10-Day Returns" }
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-forest">
                  {feature.icon}
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {related.items && related.items.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-forest mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.items.slice(0, 4).map((item: any) => (
                <Link key={item.id} href={`/products/${item.slug}`} className="group">
                  <div className="aspect-square bg-white rounded-2xl overflow-hidden mb-3 border border-gray-100">
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
                  <h3 className="font-semibold text-sm mb-1 group-hover:text-forest transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-forest font-bold">{formatCurrency(item.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
