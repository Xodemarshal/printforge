"use client";

import { useState } from "react";
import { STLViewer } from "@/components/stl/STLViewer";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { WishlistToggleButton } from "@/components/products/WishlistToggleButton";
import { productImage } from "@/lib/design";

interface ProductDetailClientProps {
  product: any;
  related: { items: any[] };
}

export function ProductDetailClient({ product, related }: ProductDetailClientProps) {
  // Get available media in order of preference
  const availableMedia = [
    product.image_url,
    product.video_url,
    product.model_url
  ].filter(Boolean);

  // Use first available media or fallback to generated image
  const mediaUrls = availableMedia.length > 0 ? availableMedia : [productImage(product.slug)];
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const selectedMedia = mediaUrls[selectedMediaIndex];

  return (
    <div className="page-shell py-8 lg:py-10">
      <div className="panel-alabaster rounded-[34px] p-4 lg:p-6">
        <div className="grid gap-6 lg:grid-cols-[96px_1.1fr_0.9fr]">
          <div className="flex gap-3 overflow-x-auto lg:flex-col">
            {mediaUrls.map((media, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedMediaIndex(index)}
                className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border p-1 shadow-sm lg:h-24 lg:w-24 transition-colors ${selectedMediaIndex === index
                  ? 'border-forest/50 bg-forest/10'
                  : 'border-forest/20 bg-cream/80 hover:border-forest/30'
                  }`}
              >
                <img src={media} alt={`${product.name} thumbnail ${index + 1}`} className="h-full w-full rounded-[14px] object-cover" />
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-[30px] border border-forest/15 bg-cream shadow-lg shadow-forest/10">
              <img
                src={selectedMedia}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            </div>
            {product.model_url ? (
              <div className="rounded-[30px] border border-forest/15 bg-cream/90 p-4 shadow-sm">
                <STLViewer url={product.model_url} filename={product.slug} />
              </div>
            ) : null}
          </div>

          <aside className="rounded-[30px] border border-forest/15 panel-alabaster p-6 shadow-lg shadow-forest/10">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-secondary-light">Premium Product</p>
              <h1 className="display-font text-5xl leading-[0.95] text-primary-dark font-bold">{product.name}</h1>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-forest text-cream">
                  {product.rating} stars
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-cream">
                  {product.review_count} reviews
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-primary-dark">
                  {formatCurrency(Number(product.price))}
                </span>
              </div>
              <p className="text-sm leading-7 text-secondary-medium">{product.description}</p>

              <div className="rounded-[24px] border border-forest/10 bg-cream/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-secondary-light">Material Information</p>
                <p className="mt-2 text-sm text-primary-medium font-medium">{product.material_info}</p>
              </div>

              <div className="rounded-[24px] border border-forest/10 bg-cream/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-secondary-light">Available Colors</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Array.isArray(product.color_options) && product.color_options.length > 0 ? (
                    product.color_options.map((color: string) => (
                      <span key={color} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-moss text-cream">
                        {color}
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-moss text-cream">
                      Natural finish
                    </span>
                  )}
                </div>
              </div>

              <div className="grid gap-3 pt-2">
                <AddToCartButton
                  product={{
                    id: product.id,
                    productId: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: Number(product.price),
                    quantity: 1,
                    imageUrl: selectedMedia
                  }}
                />
                <Button className="btn-artisan-outline w-full">
                  Buy Now
                </Button>
                <WishlistToggleButton productId={product.id} />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[30px] panel-alabaster p-6 shadow-lg shadow-forest/10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-secondary-light">Product Details</p>
              <h2 className="display-font text-3xl text-primary-dark font-semibold">Specifications</h2>
            </div>
          </div>
          <pre className="mt-4 overflow-auto rounded-[24px] border border-forest/10 bg-cream/80 p-4 text-sm text-primary-medium font-mono">
            {JSON.stringify(product.specifications, null, 2)}
          </pre>
        </div>

        <aside className="rounded-[30px] panel-alabaster p-6 shadow-lg shadow-forest/10">
          <h2 className="display-font text-3xl text-primary-dark font-semibold">Related Products</h2>
          <div className="mt-4 grid gap-3">
            {(related.items as any[]).slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-2xl border border-forest/10 bg-cream/80 p-3 hover:bg-cream transition-colors"
              >
                <img
                  src={item.image_url || productImage(item.slug)}
                  alt={item.name}
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-primary-medium">{item.name}</p>
                  <p className="text-xs text-secondary-light">{formatCurrency(Number(item.price))}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}