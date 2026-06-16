import type { Metadata } from "next";
import Link from "next/link";
import { getProducts, searchProducts } from "@/actions/products";
import { ProductGrid } from "@/components/products/ProductGrid";
import { DESIGN_IMAGES } from "@/lib/design";

export const metadata: Metadata = {
  title: "Collections | Wooden Guardian",
  description: "Browse all products"
};

export default async function ShopPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const result = params.q
    ? await searchProducts(
        {
          query: params.q,
          category: params.category,
          page: Number(params.page ?? 1)
        },
        null
      )
    : await getProducts({
        query: params.q,
        category: params.category,
        page: Number(params.page ?? 1)
      });
  const { items, total, page, pageSize } = result;

  return (
    <div className="page-shell py-6 lg:py-8">
      <div className="panel-soft overflow-hidden rounded-[34px] p-4 lg:p-6">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4 rounded-[28px] border border-black/10 bg-[#f6eddc] p-5">
            <div className="overflow-hidden rounded-[24px] border border-black/10">
              <img src={DESIGN_IMAGES.collection1} alt="Shop preview" className="h-56 w-full object-cover" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-foreground/50">Collections</p>
              <h1 className="display-font mt-2 text-4xl text-[#243223]">All collections</h1>
            </div>
            <form className="space-y-3" action="/shop" method="get">
              <input
                name="q"
                placeholder="Search"
                defaultValue={params.q}
                className="w-full rounded-full border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none"
              />
              <input
                name="category"
                placeholder="Category slug"
                defaultValue={params.category}
                className="w-full rounded-full border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none"
              />
              <button className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
                Apply
              </button>
            </form>
            <div className="rounded-[24px] border border-black/10 bg-white/75 p-4 text-sm text-foreground/70">
              <p className="font-medium text-[#243223]">Filter by</p>
              <p className="mt-2">Material, color, product type, and price range can be layered here.</p>
            </div>
          </aside>
          <section className="space-y-6">
            <div className="flex flex-col gap-4 rounded-[28px] border border-black/10 bg-[#fffaf1] p-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-foreground/50">Product catalog</p>
                <h2 className="display-font text-4xl text-[#243223]">Showing the full collection</h2>
              </div>
              <div className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm text-foreground/70">
                Showing {items.length} of {total}
              </div>
            </div>
            <ProductGrid products={items as any[]} />
            <div className="flex items-center justify-between rounded-[24px] border border-black/10 bg-white/70 px-5 py-4 text-sm">
              <span>
                Page {page} of {Math.max(1, Math.ceil(total / pageSize))}
              </span>
              <Link href="/upload-design" className="font-medium text-[#2d3c28] underline">
                Need something custom? Upload a design.
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
