import type { Metadata } from "next";
import { getProducts, getCategories } from "@/actions/products";
import { ListingPageClient } from "@/components/products/ListingPageClient";

export const metadata: Metadata = {
  title: "New Arrivals | Wooden Guardian",
  description: "Discover the latest products."
};

export default async function NewArrivalsPage() {
  const [{ items, total, page, pageSize }, categories] = await Promise.all([
    getProducts({ page: 1 }),
    getCategories()
  ]);

  return (
    <ListingPageClient 
      initialProducts={items as any[]}
      categories={categories}
      total={total}
      currentPage={page}
      pageSize={pageSize}
      title="New Arrivals"
      subtitle="Freshly crafted designs just added to our collection."
    />
  );
}
