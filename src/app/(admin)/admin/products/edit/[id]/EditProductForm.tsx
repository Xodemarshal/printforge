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
  gallery_urls?: string[];
  video_url?: string;
  material_info: string;
  color_options: string[];
  active: boolean;
  filament_weight_grams?: number;
  estimated_power_cost?: number;
  estimated_packaging_cost?: number;
  estimated_total_cost?: number;
}

interface EditProductFormProps {
  product: Product;
  categories: any[];
}

export function EditProductForm({ product, categories }: EditProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToast();
  const router = useRouter();

  // State for live calculations
  const [currentPrice, setCurrentPrice] = useState(product.price ?? 0);
  const [filamentGrams, setFilamentGrams] = useState(product.filament_weight_grams ?? 0);
  const [powerCost, setPowerCost] = useState(product.estimated_power_cost ?? 0);
  const [packagingCost, setPackagingCost] = useState(product.estimated_packaging_cost ?? 0);

  // Constants
  const FILAMENT_COST_PER_GRAM = 0.80; // ₹800 per kg

  // Calculations
  const estimatedTotalCost = (filamentGrams * FILAMENT_COST_PER_GRAM) + powerCost + packagingCost;
  const estimatedMargin = currentPrice > 0 
    ? ((currentPrice - estimatedTotalCost) / currentPrice) * 100 
    : 0;

  async function clientAction(formData: FormData) {
    setIsLoading(true);
    
    try {
      const result = await updateProductAction(formData);
      
      if (result && result.error) {
        error("Update Failed", result.error);
      } else if (result && result.success) {
        success("Product Updated", result.message || "Product updated successfully");
        // Redirect back to product list to see updated costs
        router.push("/admin/products");
        router.refresh();
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
      {/* Hidden Fields for the Server Action */}
      <input type="hidden" name="id" value={product.id} />
      <input type="hidden" name="estimated_total_cost" value={estimatedTotalCost} />

      <div>
        <label className="text-sm font-medium text-gray-300 block mb-1.5">Product Name</label>
        <Input
          name="name"
          defaultValue={product.name}
          placeholder="Product Name"
          className="bg-black border-gray-700 text-white placeholder:text-gray-400"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-300 block mb-1.5">Slug</label>
          <Input
            name="slug"
            defaultValue={product.slug}
            placeholder="product-slug"
            className="bg-black border-gray-700 text-white placeholder:text-gray-400"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300 block mb-1.5">Selling Price (₹)</label>
          <Input
            name="price"
            type="number"
            step="0.01"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(Number(e.target.value))}
            placeholder="Price"
            className="bg-black border-gray-700 text-white placeholder:text-gray-400 font-bold"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-300 block mb-1.5">Description</label>
        <Textarea
          name="description"
          defaultValue={product.description}
          placeholder="Product Description"
          className="bg-black border-gray-700 text-white placeholder:text-gray-400"
          required
        />
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Thumbnail Image</label>
          {product.image_url && (
            <div className="mb-2">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-20 h-20 rounded-lg object-cover border border-gray-700"
              />
            </div>
          )}
          <Input
            name="image"
            type="file"
            accept="image/*"
            className="bg-black border-gray-700 text-white file:bg-gray-800 file:border-gray-600 file:text-gray-300 text-xs"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Add Gallery Images</label>
          <Input
            name="gallery"
            type="file"
            accept="image/*"
            multiple
            className="bg-black border-gray-700 text-white file:bg-gray-800 file:border-gray-600 file:text-gray-300 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-300 block mb-1.5">Material Info</label>
          <Input
            name="material_info"
            defaultValue={product.material_info}
            placeholder="e.g. PLA, PETG"
            className="bg-black border-gray-700 text-white placeholder:text-gray-400"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300 block mb-1.5">Color Options</label>
          <Input
            name="colorOptions"
            defaultValue={product.color_options?.join(", ")}
            placeholder="Red, Blue, Black"
            className="bg-black border-gray-700 text-white placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Manufacturing Cost Section */}
      <div className="pt-4 pb-2 border-t border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">Manufacturing & Profit Analysis</p>
          <div className="flex gap-4 text-xs">
            <span className="text-gray-400">Total Cost: <span className="text-white font-bold">₹{estimatedTotalCost.toFixed(2)}</span></span>
            <span className="text-gray-400">Live Margin: <span className={`font-bold ${estimatedMargin >= 20 ? 'text-green-400' : 'text-red-400'}`}>{estimatedMargin.toFixed(1)}%</span></span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Filament (Grams)</label>
            <Input
              name="filament_weight_grams"
              type="number"
              step="0.1"
              value={filamentGrams}
              onChange={e => setFilamentGrams(Number(e.target.value))}
              className="bg-black border-gray-700 text-white text-sm"
            />
            <p className="text-[10px] text-gray-600 mt-1">₹0.80/g = ₹{(filamentGrams * 0.80).toFixed(2)}</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Power Cost (₹)</label>
            <Input
              name="estimated_power_cost"
              type="number"
              step="0.5"
              value={powerCost}
              onChange={e => setPowerCost(Number(e.target.value))}
              className="bg-black border-gray-700 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Packaging (₹)</label>
            <Input
              name="estimated_packaging_cost"
              type="number"
              step="0.5"
              value={packagingCost}
              onChange={e => setPackagingCost(Number(e.target.value))}
              className="bg-black border-gray-700 text-white text-sm"
            />
          </div>
        </div>
      </div>

      <div className="py-2">
        <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            name="active"
            defaultChecked={product.active}
            className="w-4 h-4 rounded border-gray-600 bg-black text-forest-green focus:ring-forest focus:ring-offset-0"
          />
          <span className="text-sm">Active (visible to customers)</span>
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-forest-green hover:bg-forest-green/90 text-white px-8"
        >
          {isLoading ? "Saving..." : "Update Product"}
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