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
            <h1 className="text-3xl font-bold text-forest mb-2">My Wishlist</h1>
            <p className="text-forest/70">{items.length} saved items</p>
          </div>
          
          {items.length > 0 && (
            <Button
              onClick={clearWishlist}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Wishlist Items */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-forest/70">Loading your wishlist...</p>
          </div>
        ) : wishlistProducts.length === 0 ? (
          <div className="text-center py-16">
            <Heart size={64} className="text-forest/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-forest mb-2">Your wishlist is empty</h3>
            <p className="text-forest/70 mb-6">Save products you love to find them easily later.</p>
            <Link 
              href="/shop"
              className="inline-block bg-forest text-white px-6 py-3 rounded-lg font-semibold hover:bg-forest-dark transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistProducts.map((product: any) => (
              <div key={product.id} className="bg-cream/30 border border-forest/20 rounded-2xl p-4 group">
                <div className="relative mb-4">
                  <Link href={`/products/${product.slug}`}>
                    <img 
                      src={getImageUrl(product)}
                      alt={product.name}
                      className="w-full aspect-square object-cover rounded-xl group-hover:scale-105 transition-transform"
                    />
                  </Link>
                  <button
                    onClick={() => toggle(product.id)}
                    className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <X size={16} className="text-red-500" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <Link 
                      href={`/products/${product.slug}`}
                      className="font-semibold text-forest hover:text-forest-dark transition-colors"
                    >
                      {product.name}
                    </Link>
                    <p className="text-lg font-bold text-forest mt-1">
                      {formatCurrency(product.price)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-forest hover:bg-forest-dark text-white"
                    >
                      <ShoppingCart size={16} className="mr-2" />
                      Add to Cart
                    </Button>
                    <Link
                      href={`/products/${product.slug}`}
                      className="px-4 py-2 border border-forest/30 text-forest hover:bg-forest/5 rounded-lg transition-colors text-sm font-medium"
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
              className="inline-flex items-center gap-2 text-forest/70 hover:text-forest transition-colors"
            >
              Continue browsing products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}