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

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found on Crafted Tale."
    };
  }

  const title = product.name;
  const rawDescription = product.description || product.long_description || "";
  const cleanDescription = rawDescription
    .replace(/<[^>]*>?/gm, "")
    .slice(0, 160)
    .trim();
  const description = cleanDescription || `Shop ${product.name} at Crafted Tale. Premium 3D printed creations.`;
  const url = `https://craftedtale.in/products/${product.slug}`;
  const imageUrl = product.image_url || "/design/logo.png";

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${product.name} | Crafted Tale`,
      description,
      url,
      siteName: "Crafted Tale",
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: imageUrl,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Crafted Tale`,
      description,
      images: [imageUrl],
    },
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
