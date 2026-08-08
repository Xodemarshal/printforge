export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getCategories, getProducts } from "@/actions/products";
import { getAllActivePreorderProductIds } from "@/actions/preorders";
import { ListingPageClient } from "@/components/products/ListingPageClient";

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    return categories.map((category: any) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.error("Error generating static params for categories:", error);
    return [];
  }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c: any) => c.slug === slug);

  return {
    title: `${category?.name || slug} | ArchiveVault`,
    description: `Browse our ${category?.name || slug} collection`
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const [categories, preorderProductMap] = await Promise.all([
      getCategories(),
      getAllActivePreorderProductIds()
    ]);

    // Try exact match first, then case-insensitive, then singular/plural
    let category = categories.find((c: any) => c.slug === slug);
    if (!category) {
      category = categories.find((c: any) => c.slug.toLowerCase() === slug.toLowerCase());
    }
    if (!category) {
      const singularSlug = slug.endsWith('s') ? slug.slice(0, -1) : slug + 's';
      category = categories.find((c: any) =>
        c.slug === singularSlug || c.slug.toLowerCase() === singularSlug.toLowerCase()
      );
    }

    if (!category) {
      return (
        <ListingPageClient
          initialProducts={[]}
          categories={categories}
          total={0}
          currentPage={1}
          pageSize={12}
          title="Category Not Found"
          subtitle={`The category "${slug}" doesn't exist. Available categories are listed in the sidebar.`}
          preorderProductMap={preorderProductMap}
        />
      );
    }

    const { items, total, page, pageSize } = await getProducts({ category: category.id });

    return (
      <ListingPageClient
        initialProducts={items as any[]}
        categories={categories}
        total={total}
        currentPage={page}
        pageSize={pageSize}
        title={category.name}
        subtitle={`Explore our ${category.name.toLowerCase()} collection - handcrafted with precision and care.`}
        preorderProductMap={preorderProductMap}
      />
    );
  } catch (error) {
    console.error('❌ ERROR loading category page:', error);
    return (
      <div className="min-h-screen bg-alabaster flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-3xl font-bold text-forest mb-4">Something went wrong</h1>
          <p className="text-forest/60 mb-8">Unable to load this category. Please try again later.</p>
          <p className="text-xs text-red-500 mb-4">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
          <a
            href="/shop"
            className="inline-block px-6 py-3 bg-forest text-white rounded-xl font-bold hover:bg-forest/90 transition-colors"
          >
            View All Products
          </a>
        </div>
      </div>
    );
  }
}
