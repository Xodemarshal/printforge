import type { Metadata } from "next";
import { getCategories, getProducts } from "@/actions/products";
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
    title: `${category?.name || slug} | Wooden Guardian`,
    description: `Browse our ${category?.name || slug} collection`
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  console.log('=== CATEGORY PAGE LOADED ===');
  console.log('Slug:', slug);

  try {
    const categories = await getCategories();
    console.log('Total categories fetched:', categories.length);

    // Try exact match first
    let category = categories.find((c: any) => c.slug === slug);

    // If not found, try case-insensitive match
    if (!category) {
      category = categories.find((c: any) => c.slug.toLowerCase() === slug.toLowerCase());
    }

    // If still not found, try singular/plural variations
    if (!category) {
      const singularSlug = slug.endsWith('s') ? slug.slice(0, -1) : slug + 's';
      category = categories.find((c: any) => c.slug === singularSlug || c.slug.toLowerCase() === singularSlug.toLowerCase());
    }

    console.log('Category match result:', {
      requestedSlug: slug,
      foundCategory: category?.name,
      foundSlug: category?.slug,
      categoryId: category?.id,
      allCategories: categories.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug }))
    });

    // If category doesn't exist, show empty state with all categories
    if (!category) {
      console.log('❌ Category not found, showing empty state');
      return (
        <ListingPageClient
          initialProducts={[]}
          categories={categories}
          total={0}
          currentPage={1}
          pageSize={12}
          title="Category Not Found"
          subtitle={`The category "${slug}" doesn't exist. Available categories are listed in the sidebar.`}
        />
      );
    }

    console.log('✅ Category found, fetching products for category ID:', category.id);
    const { items, total, page, pageSize } = await getProducts({ category: category.id });

    console.log('Products result:', {
      categoryId: category.id,
      categoryName: category.name,
      productsFound: items.length,
      total,
      firstProduct: items[0] ? { name: items[0].name, category_id: items[0].category_id } : null
    });

    return (
      <ListingPageClient
        initialProducts={items as any[]}
        categories={categories}
        total={total}
        currentPage={page}
        pageSize={pageSize}
        title={category.name}
        subtitle={`Explore our ${category.name.toLowerCase()} collection - handcrafted with precision and care.`}
      />
    );
  } catch (error) {
    console.error('❌ ERROR loading category page:', error);

    // Fallback error state
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
