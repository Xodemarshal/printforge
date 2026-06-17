import type { Metadata } from "next";
import { getProducts, searchProducts, getCategories } from "@/actions/products";
import { ListingPageClient } from "@/components/products/ListingPageClient";

export const metadata: Metadata = {
  title: "All Collections | Wooden Guardian",
  description: "Browse our wide range of handcrafted collectibles"
};

export default async function ShopPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const [result, categories] = await Promise.all([
    params.q
      ? searchProducts(
          {
            query: params.q,
            category: params.category,
            page: Number(params.page ?? 1)
          },
          null
        )
      : getProducts({
          query: params.q,
          category: params.category,
          page: Number(params.page ?? 1)
        }),
    getCategories()
  ]);

  const { items, total, page, pageSize } = result;

  return (
    <ListingPageClient 
      initialProducts={items as any[]}
      categories={categories}
      total={total}
      currentPage={page}
      pageSize={pageSize}
      title="All Collections"
      subtitle="Discover our wide range of handcrafted collectibles, made for true collectors."
    />
  );
}
