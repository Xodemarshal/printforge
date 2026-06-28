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
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-yellow-500/80 mb-1">PrintForge Admin</p>
        <h1 className="text-3xl font-bold text-white">Edit Product</h1>
        <p className="text-gray-400 mt-1 text-sm">Modify product catalog details, images, pricing, and manufacturing specs.</p>
      </div>
      <EditProductForm product={product} categories={categories} />
    </div>
  );
}
