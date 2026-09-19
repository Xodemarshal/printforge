import type { Metadata } from "next";
import { getProducts, getCategories } from "@/actions/products";
import { getAllActivePreorderProductIds } from "@/actions/preorders";
import { ListingPageClient } from "@/components/products/ListingPageClient";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "New Arrivals | Crafted Tale",
  description: "Discover the latest products."
};

export default async function NewArrivalsPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const pageNumber = Math.max(1, Number(params?.page ?? 1));
  const [{ items, total, page, pageSize }, categories, preorderProductMap] = await Promise.all([
    getProducts({ page: pageNumber }),
    getCategories(),
    getAllActivePreorderProductIds()
  ]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListingPageClient 
        initialProducts={items as any[]}
        categories={categories}
        total={total}
        currentPage={page}
        pageSize={pageSize}
        title="New Arrivals"
        subtitle="Freshly crafted designs just added to our collection."
        preorderProductMap={preorderProductMap}
      />
    </Suspense>
  );
}
