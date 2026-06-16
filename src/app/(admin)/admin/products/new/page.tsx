"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProductAction } from "@/actions/products";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export default function NewProductPage() {
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
    <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4 rounded-2xl border p-6">
      <h1 className="text-3xl font-semibold text-white">New Product</h1>
      
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
        placeholder="Price (USD)" 
        className="bg-black border-gray-700 text-white placeholder:text-gray-400"
        required
      />
      
      <Input 
        name="category_id" 
        placeholder="Category ID (optional)" 
        className="bg-black border-gray-700 text-white placeholder:text-gray-400"
      />
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Product Image</label>
        <Input 
          name="image" 
          type="file" 
          accept="image/*"
          className="bg-black border-gray-700 text-white file:bg-gray-800 file:border-gray-600 file:text-gray-300"
        />
      </div>
      
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
      
      <div className="flex gap-3">
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
