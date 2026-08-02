import Link from "next/link";
import { ProductGrid } from "@/components/products/ProductGrid";

export function FeaturedProducts({ products }: { products: any[] }) {
  return (
    <section className="page-shell py-10 lg:py-14">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400/70">New arrivals</p>
          <h2 className="display-font text-4xl text-emerald-400 font-bold">Fresh from the workshop</h2>
        </div>
        <Link href="/shop" className="px-5 py-2.5 text-sm font-bold rounded-2xl border border-white/10 text-cream/70 hover:bg-white/5 hover:text-cream transition-all">
          Browse all
        </Link>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
