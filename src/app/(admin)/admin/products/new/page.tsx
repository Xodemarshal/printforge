import { getCategories } from "@/actions/products";
import { NewProductClient } from "./NewProductClient";
export const dynamic = "force-dynamic";
export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-white">New Product</h1>
      <NewProductClient categories={categories} />
    </div>
  );
}
