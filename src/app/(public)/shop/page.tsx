import { Suspense } from "react";
import type { Metadata } from "next";
import { getProducts, searchProducts, getCategories } from "@/actions/products";
import { getAllActivePreorderProductIds } from "@/actions/preorders";
import { ListingPageClient } from "@/components/products/ListingPageClient";

export const metadata: Metadata = {
  title: "All Collections | Crafted Tale",
  description: "Browse our wide range of handcrafted collectibles"
};

export default async function ShopPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const pageNumber = Math.max(1, Number(params.page ?? 1));
  const [result, categories, preorderProductMap] = await Promise.all([
    params.q
      ? searchProducts(
          {
            query: params.q,
            category: params.category,
            page: pageNumber
          },
          null
        )
      : getProducts({
          query: params.q,
          category: params.category,
          page: pageNumber
        }),
    getCategories(),
    getAllActivePreorderProductIds()
  ]);

  const { items, total, page, pageSize } = result;

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f1810]" />}>
      <ListingPageClient 
        initialProducts={items as any[]}
        categories={categories}
        total={total}
        currentPage={page}
        pageSize={pageSize}
        title="All Collections"
        subtitle="Discover our wide range of handcrafted collectibles, made for true collectors."
        preorderProductMap={preorderProductMap}
      />
    </Suspense>
  );
}
