import { getProductById } from "@/actions/products";
import { EditProductForm } from "./EditProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-semibold text-white mb-2">Product Not Found</h1>
        <p className="text-gray-400">The product you're looking for doesn't exist.</p>
      </div>
    );
  }

  return <EditProductForm product={product} />;
}
