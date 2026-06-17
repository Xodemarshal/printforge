"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProductAction } from "@/actions/products";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface NewProductClientProps {
  categories: any[];
}

export function NewProductClient({ categories }: NewProductClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToast();
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await createProductAction(formData);

      if (result.error) {
        error("Creation Failed", result.error);
      } else {
        success("Product Created", result.message || "Product created successfully");
        router.push("/admin/products");
      }
    } catch (err) {
      error("Creation Failed", "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4 rounded-2xl border p-6 bg-gray-900 border-gray-800">
      <Input 
        name="name" 
        placeholder="Product Name" 
        className="bg-black border-gray-700 text-white placeholder:text-gray-400"
        required
      />
      
      <Input 
        name="slug" 
        placeholder="product-slug" 
        className="bg-black border-gray-700 text-white placeholder:text-gray-400"
        required
      />
      
      <Textarea 
        name="description" 
        placeholder="Product Description" 
        className="bg-black border-gray-700 text-white placeholder:text-gray-400"
        required
      />
      
      <Input 
        name="price" 
        type="number" 
        step="0.01"
        placeholder="Price" 
        className="bg-black border-gray-700 text-white placeholder:text-gray-400"
        required
      />
      
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-300">Category</label>
        <select 
          name="category_id" 
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
        <Input 
          name="image" 
          type="file" 
          accept="image/*"
          className="bg-black border-gray-700 text-white file:bg-gray-800 file:border-gray-600 file:text-gray-300"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Gallery Images (Multiple)</label>
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
        placeholder="Video URL (YouTube/Vimeo/Direct)" 
        className="bg-black border-gray-700 text-white placeholder:text-gray-400"
      />
      
      <Input 
        name="material_info" 
        placeholder="Material Information" 
        className="bg-black border-gray-700 text-white placeholder:text-gray-400"
      />
      
      <Input 
        name="colorOptions" 
        placeholder="Color options (comma separated)" 
        className="bg-black border-gray-700 text-white placeholder:text-gray-400"
      />
      
      <label className="flex items-center gap-2 text-gray-300">
        <input 
          type="checkbox" 
          name="active" 
          defaultChecked
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
          {isLoading ? "Creating..." : "Create Product"}
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
