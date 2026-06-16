import { PAGE_SIZE } from "@/lib/constants";

export type ProductFilterInput = {
  query?: string;
  category?: string;
  page?: number;
};

export function filterProducts<
  T extends { name: string; description?: string | null; slug?: string; category?: string | null }
>(products: T[], input: ProductFilterInput = {}) {
  const query = (input.query ?? "").toLowerCase();
  const category = input.category;
  const page = input.page ?? 1;

  let filtered = products;
  if (query) {
    filtered = filtered.filter((product) =>
      [product.name, product.description ?? "", product.slug ?? ""].join(" ").toLowerCase().includes(query)
    );
  }
  if (category) {
    filtered = filtered.filter(
      (product) =>
        product.category === category ||
        (product as { category_id?: string | null }).category_id === category
    );
  }

  const total = filtered.length;
  const start = (page - 1) * PAGE_SIZE;
  return {
    total,
    page,
    pageSize: PAGE_SIZE,
    items: filtered.slice(start, start + PAGE_SIZE)
  };
}
