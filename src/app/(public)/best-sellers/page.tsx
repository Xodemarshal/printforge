import type { Metadata } from "next";
import { getBestSellers, getCategories } from "@/actions/products";
import { ListingPageClient } from "@/components/products/ListingPageClient";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Best Sellers | Wooden Guardian",
  description: "Browse the top selling products."
};

export default async function BestSellersPage() {
  const [products, categories] = await Promise.all([
    getBestSellers(),
    getCategories()
  ]);

  return (
    <Suspense fallback={<div>Loading products...</div>}>
      <ListingPageClient 
        initialProducts={products as any[]}
        categories={categories}
        total={products.length}
        currentPage={1}
        pageSize={products.length}
        title="Best Sellers"
        subtitle="The most popular handcrafted pieces from our artisan workshop."
      />
    </Suspense>
  );
}