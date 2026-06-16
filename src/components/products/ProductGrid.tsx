import { ProductCard } from "@/components/products/ProductCard";

export function ProductGrid({
  products
}: {
  products: Array<{
    id: string;
    slug: string;
    name: string;
    image_url?: string | null;
    price: number;
    rating?: number;
    review_count?: number;
  }>;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}
