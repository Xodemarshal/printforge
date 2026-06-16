import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProductGrid } from "@/components/products/ProductGrid";
import { mockData } from "@/lib/mock-supabase";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug} | PrintForge`,
    description: `Products in ${slug}`
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createAdminClient();
  const categoryResult = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
  const category = categoryResult.error ? mockData.categories.find((item) => item.slug === slug) : categoryResult.data;
  const productsResult = await supabase.from("products").select("*").eq("category_id", category?.id ?? "");
  const products = productsResult.error
    ? (mockData.products as any[]).filter((product) => product.category_id === category?.id)
    : productsResult.data;
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-semibold">{category?.name ?? "Category"}</h1>
      <div className="mt-8">
        <ProductGrid products={products ?? []} />
      </div>
    </div>
  );
}
