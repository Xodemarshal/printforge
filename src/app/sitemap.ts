import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 86400; // Revalidate at most once per day

interface ProductRow {
  id: string;
  slug: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface CategoryRow {
  id: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://archivevault.in";

  // 1. Static Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/best-sellers`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/new-arrivals`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/upload-stl`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/upload-design`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  let categoryRoutes: MetadataRoute.Sitemap = [];
  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    const supabase = createAdminClient();

    // 2. Dynamic Categories
    const { data: categories, error: categoryError } = await supabase
      .from("categories")
      .select("slug, created_at, updated_at");

    if (!categoryError && categories) {
      categoryRoutes = (categories as CategoryRow[]).map((category) => ({
        url: `${baseUrl}/categories/${category.slug}`,
        lastModified: category.updated_at ? new Date(category.updated_at) : category.created_at ? new Date(category.created_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
  }

  try {
    const supabase = createAdminClient();

    // 3. Dynamic Products (only active ones)
    const { data: products, error: productError } = await supabase
      .from("products")
      .select("slug, active, created_at, updated_at");

    if (!productError && products) {
      productRoutes = (products as ProductRow[])
        .filter((product) => product.active !== false)
        .map((product) => ({
          url: `${baseUrl}/products/${product.slug}`,
          lastModified: product.updated_at ? new Date(product.updated_at) : product.created_at ? new Date(product.created_at) : new Date(),
          changeFrequency: "daily",
          priority: 0.8,
        }));
    }
  } catch (error) {
    console.error("Error fetching products for sitemap:", error);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
