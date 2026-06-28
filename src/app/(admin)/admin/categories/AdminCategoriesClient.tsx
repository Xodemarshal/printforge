"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "@/actions/products";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Trash2, Edit } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
}

interface AdminCategoriesClientProps {
  categories: Category[];
}

function CreateCategoryForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToast();
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await createCategoryAction(formData);

      if (result.error) {
        error("Creation Failed", result.error);
      } else {
        success("Category Created", result.message || "Category created successfully");
        // Reset form
        event.currentTarget.reset();
        router.refresh();
      }
    } catch (err) {
      error("Creation Failed", "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Create New Category</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
        <Input 
          name="name" 
          placeholder="Category Name" 
          className="bg-black border-gray-700 text-white placeholder:text-gray-400"
          required
        />
        <Input 
          name="slug" 
          placeholder="category-slug" 
          className="bg-black border-gray-700 text-white placeholder:text-gray-400"
          required
        />
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Category Image</label>
          <Input 
            name="image" 
            type="file" 
            accept="image/*"
            className="bg-black border-gray-700 text-white file:bg-gray-800 file:border-gray-600 file:text-gray-300"
          />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-forest hover:bg-forest-dark text-white"
        >
          {isLoading ? "Creating..." : "Create Category"}
        </Button>
      </form>
    </div>
  );
}

function CategoryRow({ category }: { category: Category }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { success, error } = useToast();
  const router = useRouter();

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await updateCategoryAction(formData);

      if (result.error) {
        error("Update Failed", result.error);
      } else {
        success("Category Updated", result.message || "Category updated successfully");
        setIsEditing(false);
        router.refresh();
      }
    } catch (err) {
      error("Update Failed", "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", category.id);
      formData.append("name", category.name);
      
      const result = await deleteCategoryAction(formData);
      
      if (result.error) {
        error("Delete Failed", result.error);
      } else {
        success("Category Deleted", result.message || "Category deleted successfully");
        setShowDeleteConfirm(false);
        router.refresh();
      }
    } catch (err) {
      error("Delete Failed", "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  if (isEditing) {
    return (
      <tr className="hover:bg-gray-800/50 transition-colors">
        <td colSpan={5} className="px-6 py-4">
          <form onSubmit={handleUpdate} encType="multipart/form-data" className="space-y-4">
            <input type="hidden" name="id" value={category.id} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input 
                name="name" 
                defaultValue={category.name}
                placeholder="Category Name" 
                className="bg-black border-gray-700 text-white placeholder:text-gray-400"
                required
              />
              <Input 
                name="slug" 
                defaultValue={category.slug}
                placeholder="category-slug" 
                className="bg-black border-gray-700 text-white placeholder:text-gray-400"
                required
              />
              <Input 
                name="image" 
                type="file" 
                accept="image/*"
                className="bg-black border-gray-700 text-white file:bg-gray-800 file:border-gray-600 file:text-gray-300"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-forest hover:bg-forest-dark text-white"
              >
                {isLoading ? "Saving..." : "Save"}
              </Button>
              <Button 
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="border-gray-700 text-gray-300 hover:text-white hover:border-gray-600"
              >
                Cancel
              </Button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-gray-800/50 transition-colors">
      <td className="px-6 py-4">
        {category.image_url ? (
          <img 
            src={category.image_url}
            alt={category.name}
            className="w-10 h-10 rounded-lg object-cover border border-gray-700"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
            <span className="text-gray-500 text-xs">No Image</span>
          </div>
        )}
      </td>
      <td className="px-6 py-4 text-sm text-white">{category.name}</td>
      <td className="px-6 py-4 text-sm text-gray-400">{category.slug}</td>
      <td className="px-6 py-4">
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-900/20 text-green-400 border border-green-800">
          Active
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="border-gray-600 text-gray-400 hover:text-white hover:border-gray-600 px-2 py-1 text-xs h-7"
          >
            <Edit size={12} />
          </Button>
          
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Delete "{category.name}"?</span>
              <Button
                onClick={handleDelete}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs h-7"
              >
                {isLoading ? "..." : "Yes"}
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                className="border-gray-600 text-gray-400 hover:text-white px-2 py-1 text-xs h-7"
              >
                No
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="outline"
              className="border-gray-600 text-gray-400 hover:text-red-400 hover:border-red-600 px-2 py-1 text-xs h-7"
            >
              <Trash2 size={12} />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

export function AdminCategoriesClient({ categories }: AdminCategoriesClientProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-yellow-500/80 mb-1">PrintForge Admin</p>
        <h1 className="text-3xl font-bold text-white">Product Categories</h1>
        <p className="text-gray-400 mt-1 text-sm">Organize storefront collections, hierarchy, and category banners.</p>
      </div>

      {/* Create Form */}
      <CreateCategoryForm />

      {/* Categories Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black border-b border-gray-800">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Image</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Name</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Slug</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {categories.map((category: any) => (
                <CategoryRow key={category.id} category={category} />
              ))}
            </tbody>
          </table>
        </div>
        {categories.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No categories created yet. Create your first category above.
          </div>
        )}
      </div>
    </div>
  );
}