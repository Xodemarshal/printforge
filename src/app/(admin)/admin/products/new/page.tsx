import { getCategories } from "@/actions/products";
import { NewProductClient } from "./NewProductClient";
export const dynamic = "force-dynamic";
export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-yellow-500/80 mb-1">PrintForge Admin</p>
        <h1 className="text-3xl font-bold text-white">New Product</h1>
        <p className="text-gray-400 mt-1 text-sm">Add a new product to your catalog, with specifications and manufacturing cost configuration.</p>
      </div>
      <NewProductClient categories={categories} />
    </div>
  );
}
