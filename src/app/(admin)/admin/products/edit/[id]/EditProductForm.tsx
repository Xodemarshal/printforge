"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProductAction } from "@/actions/products";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category_id?: string;
  image_url?: string;
  material_info: string;
  color_options: string[];
  active: boolean;
}

interface EditProductFormProps {
  product: Product;
  categories: any[];
}

export function EditProductForm({ product, categories }: EditProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToast();
  const router = useRouter();

  async function clientAction(formData: FormData) {
    setIsLoading(true);
    
    try {
      const result = await updateProductAction(formData);
      
      if (result && result.error) {
        error("Update Failed", result.error);
      } else if (result && result.success) {
        success("Product Updated", result.message || "Product updated successfully");
        // Force a hard refresh to show updated data
        window.location.href = "/admin/products";
      }
    } catch (err) {
      console.error('Error:', err);
      error("Update Failed", err instanceof Error ? err.message : "Failed to update");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form 
      action={clientAction}
      className="space-y-4 rounded-2xl border p-6 bg-gray-900 border-gray-800"
    >
      <input type="hidden" name="id" value={product.id} />

      <Input
        name="name"
        defaultValue={product.name}
        placeholder="Product Name"
        className="bg-black border-gray-700 text-white placeholder:text-gray-400"
        required
      />

      <Input
        name="slug"
        defaultValue={product.slug}
        placeholder="product-slug"
        className="bg-black border-gray-700 text-white placeholder:text-gray-400"
        required
      />

      <Textarea
        name="description"
        defaultValue={product.description}
        placeholder="Product Description"
        className="bg-black border-gray-700 text-white placeholder:text-gray-400"
        required
      />

      <Input
        name="price"
        type="number"
        step="0.01"
        defaultValue={product.price}
        placeholder="Price"
        className="bg-black border-gray-700 text-white placeholder:text-gray-400"
        required
      />

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-300">Category</label>
        <select 
          name="category_id" 
          defaultValue={product.category_id || ""}
          className="w-full bg-black border border-gray-700 text-white rounded-md px-3 py-2 text-sm focus:ring-forest focus:border-forest"
          required
        >
          <option value="">Select a category</option>
          {categories.map((category: any) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Thumbnail Image</label>
        {product.image_url && (
          <div className="mb-2">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-20 h-20 rounded-lg object-cover border border-gray-700"
            />
            <p className="text-xs text-gray-400 mt-1">Current thumbnail</p>
          </div>
        )}
        <Input
          name="image"
          type="file"
          accept="image/*"
          className="bg-black border-gray-700 text-white file:bg-gray-800 file:border-gray-600 file:text-gray-300"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Gallery Images (New)</label>
        {(product as any).gallery_urls && (product as any).gallery_urls.length > 0 && (
          <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
            {(product as any).gallery_urls.map((url: string, i: number) => (
              <div key={i} className="shrink-0">
                <img src={url} alt={`Gallery ${i}`} className="w-16 h-16 rounded-lg object-cover border border-gray-700" />
              </div>
            ))}
          </div>
        )}
        <Input
          name="gallery"
          type="file"
          accept="image/*"
          multiple
          className="bg-black border-gray-700 text-white file:bg-gray-800 file:border-gray-600 file:text-gray-300"
        />
      </div>

      <Input
        name="video_url"
        defaultValue={(product as any).video_url || ""}
        placeholder="Video URL"
        className="bg-black border-gray-700 text-white placeholder:text-gray-400"
      />

      <Input
        name="material_info"
        defaultValue={product.material_info}
        placeholder="Material Information"
        className="bg-black border-gray-700 text-white placeholder:text-gray-400"
      />

      <Input
        name="colorOptions"
        defaultValue={product.color_options.join(", ")}
        placeholder="Color options (comma separated)"
        className="bg-black border-gray-700 text-white placeholder:text-gray-400"
      />

      <label className="flex items-center gap-2 text-gray-300">
        <input
          type="checkbox"
          name="active"
          defaultChecked={product.active}
          className="rounded border-gray-600 bg-black text-forest focus:ring-forest focus:ring-offset-0"
        />
        Active (visible to customers)
      </label>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-forest hover:bg-forest-dark text-white"
        >
          {isLoading ? "Updating..." : "Update Product"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
          className="border-gray-700 text-gray-300 hover:text-white hover:border-gray-600"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
