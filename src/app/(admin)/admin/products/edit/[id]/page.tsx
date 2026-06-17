import { getProductById, getCategories } from "@/actions/products";
import { EditProductForm } from "./EditProductForm";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    getCategories()
  ]);

  if (!product) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-white">Edit Product</h1>
      <EditProductForm product={product} categories={categories} />
    </div>
  );
}
