"use client";

import Link from "next/link";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { Heart, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

// Mock product data - in real app, you'd fetch this based on wishlist IDs
const mockProducts = [
  {
    id: "prod-1",
    name: "Desk Lamp",
    slug: "desk-lamp", 
    price: 14.99,
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center"
  },
  {
    id: "prod-2",
    name: "Phone Stand",
    slug: "phone-stand",
    price: 4.99,
    image_url: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop&crop=center"
  }
];

export function WishlistClient() {
  const { items, toggle, clearWishlist } = useWishlist();
  const { addItem } = useCart();

  // Filter mock products to only show wishlist items
  const wishlistProducts = mockProducts.filter(product => items.includes(product.id));

  const handleAddToCart = (product: typeof mockProducts[0]) => {
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imageUrl: product.image_url
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
        {wishlistProducts.length === 0 ? (
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
            {wishlistProducts.map((product) => (
              <div key={product.id} className="bg-cream/30 border border-forest/20 rounded-2xl p-4 group">
                <div className="relative mb-4">
                  <Link href={`/products/${product.slug}`}>
                    <img 
                      src={product.image_url}
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