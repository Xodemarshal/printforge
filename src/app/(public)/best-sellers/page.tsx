import type { Metadata } from "next";
import { getBestSellers } from "@/actions/products";
import { ProductGrid } from "@/components/products/ProductGrid";

export const metadata: Metadata = {
  title: "Best Sellers | PrintForge",
  description: "Browse the top selling products."
};

export default async function BestSellersPage() {
  const products = await getBestSellers();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Best Sellers</h1>
      <div className="mt-8">
        <ProductGrid products={products as any[]} />
      </div>
    </div>
  );
}
