"use client";

import { bulkUploadProductsAction } from "@/actions/products";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Upload, Plus, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useToast } from "@/hooks/useToast";

export default function BulkUploadPage() {
  const [productCount, setProductCount] = useState(1);
  const [isPending, startTransition] = useTransition();
  const { success, error, info } = useToast();

  const addProductForm = () => {
    setProductCount(prev => prev + 1);
    info("Added new product form", "Fill in the details for the new product");
  };

  const removeProductForm = (index: number) => {
    if (productCount > 1) {
      setProductCount(prev => prev - 1);
      info("Removed product form", "Product form has been removed");
    }
  };

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        const response = await bulkUploadProductsAction(formData);
        
        if (response.success) {
          if (response.errors && response.errors.length > 0) {
            // Partial success
            success("Partial Upload Complete", response.message);
            response.errors.forEach((errorMsg, index) => {
              error(`Product ${index + 1} Failed`, errorMsg);
            });
          } else {
            // Full success
            success("Upload Complete", response.message || "All products uploaded successfully");
          }
        } else {
          error("Upload Failed", response.message || "Failed to upload products");
          if (response.errors) {
            response.errors.forEach((errorMsg, index) => {
              error(`Error ${index + 1}`, errorMsg);
            });
          }
        }
      } catch (err) {
        error("Upload Error", "An unexpected error occurred during upload");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/products" 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Products
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Bulk Product Upload</h1>
        <p className="text-gray-400 mt-1">Upload multiple products at once to save time</p>
      </div>

      {/* Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            {Array.from({ length: productCount }, (_, index) => (
              <div key={index} className="bg-black border border-gray-800 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">Product {index + 1}</h3>
                  {productCount > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeProductForm(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <Input 
                    name={`products[${index}][name]`}
                    placeholder="Product name"
                    className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400" 
                    required 
                  />
                  <Input 
                    name={`products[${index}][price]`}
                    type="number" 
                    step="0.01"
                    placeholder="Price (e.g., 29.99)"
                    className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400" 
                    required 
                  />
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <Input 
                    name={`products[${index}][category]`}
                    placeholder="Category"
                    className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400" 
                    required 
                  />
                  <Input 
                    name={`products[${index}][material]`}
                    placeholder="Material (e.g., PLA, PETG)"
                    className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400" 
                  />
                </div>

                <textarea 
                  name={`products[${index}][description]`}
                  placeholder="Product description"
                  rows={3}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-400 focus:border-gray-600"
                  required
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Product Images</label>
                  <input 
                    type="file" 
                    name={`products[${index}][images]`}
                    accept="image/*"
                    multiple
                    className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                  />
                </div>
              </div>
            ))}

            <button 
              type="button" 
              onClick={addProductForm}
              className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-300 transition-colors hover:text-white hover:border-gray-600"
            >
              <Plus size={16} />
              Add Another Product
            </button>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-800">
            <Button 
              type="submit" 
              disabled={isPending}
              className="flex items-center gap-2 bg-white text-black hover:bg-gray-100"
            >
              <Upload size={16} />
              {isPending ? 'Uploading...' : 'Upload All Products'}
            </Button>
            <Link 
              href="/admin/products"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-transparent px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-white hover:border-gray-600"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}