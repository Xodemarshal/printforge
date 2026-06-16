import Link from "next/link";
import { ProductGrid } from "@/components/products/ProductGrid";

export function FeaturedProducts({ products }: { products: any[] }) {
  return (
    <section className="page-shell py-10 lg:py-14">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-foreground/50">New arrivals</p>
          <h2 className="display-font text-4xl text-[#243223]">Fresh from the workshop</h2>
        </div>
        <Link href="/shop" className="btn-outline px-4 py-2">
          Browse all
        </Link>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
