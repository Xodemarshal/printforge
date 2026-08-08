import { ProductGrid } from "@/components/products/ProductGrid";

export function BestSellers({ products, preorderProductMap = {} }: { products: any[]; preorderProductMap?: Record<string, string> }) {
  return (
    <section className="page-shell py-10 lg:py-14">
      <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400/70">Best sellers</p>
          <h2 className="display-font text-4xl text-emerald-400 font-bold">Collector favorites</h2>
      </div>
      <ProductGrid products={products} preorderProductMap={preorderProductMap} />
    </section>
  );
}
