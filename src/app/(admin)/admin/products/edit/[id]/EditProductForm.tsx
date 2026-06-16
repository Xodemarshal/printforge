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
}

export function EditProductForm({ product }: EditProductFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { success, error } = useToast();
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData(event.currentTarget);
            const result = await updateProductAction(formData);

            if (result.error) {
                error("Update Failed", result.error);
            } else {
                success("Product Updated", result.message || "Product updated successfully");
                router.push("/admin/products");
            }
        } catch (err) {
            error("Update Failed", "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4 rounded-2xl border p-6">
            <h1 className="text-3xl font-semibold text-white">Edit Product</h1>
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
                placeholder="Price (USD)"
                className="bg-black border-gray-700 text-white placeholder:text-gray-400"
                required
            />

            <Input
                name="category_id"
                defaultValue={product.category_id || ""}
                placeholder="Category ID (optional)"
                className="bg-black border-gray-700 text-white placeholder:text-gray-400"
            />

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Product Image</label>
                {product.image_url && (
                    <div className="mb-2">
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-20 h-20 rounded-lg object-cover border border-gray-700"
                        />
                        <p className="text-xs text-gray-400 mt-1">Current image</p>
                    </div>
                )}
                <Input
                    name="image"
                    type="file"
                    accept="image/*"
                    className="bg-black border-gray-700 text-white file:bg-gray-800 file:border-gray-600 file:text-gray-300"
                />
            </div>

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

            <div className="flex gap-3">
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