import type { Metadata } from "next";
import { getProducts } from "@/actions/products";
import { ProductGrid } from "@/components/products/ProductGrid";

export const metadata: Metadata = {
  title: "New Arrivals | PrintForge",
  description: "Discover the latest products."
};

export default async function NewArrivalsPage() {
  const { items } = await getProducts();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-semibold">New Arrivals</h1>
      <div className="mt-8">
        <ProductGrid products={items as any[]} />
      </div>
    </div>
  );
}
