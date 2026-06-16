import { ProductGrid } from "@/components/products/ProductGrid";

export function TrendingProducts({ products }: { products: any[] }) {
  return (
    <section className="page-shell py-10 lg:py-14">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-foreground/50">Trending</p>
        <h2 className="display-font text-4xl text-[#243223]">Popular this week</h2>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
