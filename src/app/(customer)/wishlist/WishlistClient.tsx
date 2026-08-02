"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { Heart, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { getProducts } from "@/actions/products";
import { productImage } from "@/lib/design";

export function WishlistClient() {
  const { items, toggle, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all products and filter by wishlist IDs
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await getProducts();
        const allProducts = result.items || [];
        
        // Filter products that are in the wishlist
        const wishlistItems = allProducts.filter(product => items.includes(product.id));
        setProducts(wishlistItems);
      } catch (error) {
        console.error('Failed to fetch wishlist products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [items]);

  // Get image URL with fallback
  const getImageUrl = (product: any): string => {
    if (product.image_url) return product.image_url;
    return productImage(product.slug);
  };

  const wishlistProducts = products;

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      imageUrl: getImageUrl(product)
    });
  };

  return (
    <div className="page-shell py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-emerald-400 mb-2">My Wishlist</h1>
            <p className="text-cream/60">{items.length} saved items</p>
          </div>
          
          {items.length > 0 && (
            <Button
              onClick={clearWishlist}
              variant="outline"
              className="border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-xl text-sm"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Wishlist Items */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-cream/60">Loading your wishlist...</p>
          </div>
        ) : wishlistProducts.length === 0 ? (
          <div className="text-center py-16">
            <Heart size={64} className="text-cream/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-emerald-400 mb-2">Your wishlist is empty</h3>
            <p className="text-cream/60 mb-6">Save products you love to find them easily later.</p>
            <Link 
              href="/shop"
              className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-500 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistProducts.map((product) => (
              <div key={product.id} className="bg-white/5 border border-white/10 rounded-3xl p-4 group backdrop-blur-md shadow-[0_10px_24px_rgba(0,0,0,0.2)]">
                <div className="relative mb-4 overflow-hidden rounded-2xl">
                  <Link href={`/products/${product.slug}`}>
                    <img 
                      src={getImageUrl(product)}
                      alt={product.name}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform"
                    />
                  </Link>
                  <button
                    onClick={() => toggle(product.id)}
                    className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full text-red-400 transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <Link 
                      href={`/products/${product.slug}`}
                      className="font-semibold text-cream hover:text-emerald-400 transition-colors line-clamp-1 text-base"
                    >
                      {product.name}
                    </Link>
                    <p className="text-lg font-bold text-emerald-400 mt-1">
                      {formatCurrency(product.price)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold py-2.5"
                    >
                      <ShoppingCart size={15} className="mr-1.5" />
                      Add to Cart
                    </Button>
                    <Link
                      href={`/products/${product.slug}`}
                      className="px-3.5 py-2.5 border border-white/15 text-cream hover:bg-white/10 rounded-xl transition-colors text-xs font-medium inline-flex items-center justify-center"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Continue Shopping */}
        {wishlistProducts.length > 0 && (
          <div className="text-center mt-12">
            <Link 
              href="/shop"
              className="inline-flex items-center gap-2 text-cream/60 hover:text-cream transition-colors text-sm"
            >
              Continue browsing products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}