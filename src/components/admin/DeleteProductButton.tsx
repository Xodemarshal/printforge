"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProductAction } from "@/actions/products";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";

interface DeleteProductButtonProps {
  product: {
    id: string;
    name: string;
  };
}

export function DeleteProductButton({ product }: DeleteProductButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { success, error } = useToast();
  const router = useRouter();

  async function handleDelete() {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", product.id);
      formData.append("name", product.name);

      const result = await deleteProductAction(formData);

      if (result.error) {
        error("Delete Failed", result.error);
      } else {
        success("Product Deleted", result.message || "Product deleted successfully");
        setShowConfirm(false);
        // Refresh the page to update the product list
        router.refresh();
      }
    } catch (err) {
      error("Delete Failed", "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Delete "{product.name}"?</span>
        <Button
          onClick={handleDelete}
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs h-7"
        >
          {isLoading ? "..." : "Yes"}
        </Button>
        <Button
          onClick={() => setShowConfirm(false)}
          variant="outline"
          className="border-gray-600 text-gray-400 hover:text-white px-2 py-1 text-xs h-7"
        >
          No
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setShowConfirm(true)}
      variant="outline"
      className="border-gray-600 text-gray-400 hover:text-red-400 hover:border-red-600 px-2 py-1 text-xs h-7"
    >
      <Trash2 size={12} />
    </Button>
  );
}