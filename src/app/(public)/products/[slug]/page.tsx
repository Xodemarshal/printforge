import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProductBySlug, getProducts } from "@/actions/products";
import { getPreorderForProduct, getUserPreorderForProduct } from "@/actions/preorders";
import { trackEvent } from "@/lib/utils";
import { ProductDetailClient } from "./ProductDetailClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product?.name ?? "Product",
    description: product?.description ?? "Product details"
  };
}

export default async function ProductPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-primary-dark">Product not found.</div>;
  }

  const supabase = createAdminClient();
  try {
    await supabase.rpc("increment_product_view_count", { product_id: product.id });
  } catch (error) {
    console.warn("Failed to increment product view count:", error);
  }
  await trackEvent("product_viewed", null, { slug });
  
  const [related, preorder, userPreorderAccess] = await Promise.all([
    product.category_id ? getProducts({ category: String(product.category_id) }) : Promise.resolve({ items: [] }),
    getPreorderForProduct(product.id),
    getUserPreorderForProduct(product.id)
  ]);

  return (
    <ProductDetailClient
      product={product}
      related={related}
      preorder={preorder}
      userPreorderAccess={userPreorderAccess}
    />
  );
}
