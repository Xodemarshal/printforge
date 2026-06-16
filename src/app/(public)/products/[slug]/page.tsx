import type { Metadata } from "next";
import { getProductBySlug, getProducts } from "@/actions/products";
import { trackEvent } from "@/lib/utils";
import { ProductDetailClient } from "./ProductDetailClient";

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

  await trackEvent("product_viewed", null, { slug });
  const related = product.category_id ? await getProducts({ category: String(product.category_id) }) : { items: [] };

  return <ProductDetailClient product={product} related={related} />;
}
