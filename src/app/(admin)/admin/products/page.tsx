import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProducts } from "@/actions/products";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export default async function AdminProductsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const { items } = await getProducts({
    query: params.q,
    category: params.category,
    page: Number(params.page ?? 1)
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Products</h1>
          <p className="text-gray-400 mt-1">Manage your product catalog</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/admin/products/bulk-upload" 
            className="bg-gray-900 border border-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:text-white hover:border-gray-600 transition-colors"
          >
            Bulk Upload
          </Link>
          <Link 
            href="/admin/products/new" 
            className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Add Product
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <form action="/admin/products" method="get" className="flex gap-4">
          <Input 
            name="q" 
            placeholder="Search products..." 
            className="bg-black border-gray-700 text-white placeholder:text-gray-400"
          />
          <Input 
            name="category" 
            placeholder="Filter by category..." 
            className="bg-black border-gray-700 text-white placeholder:text-gray-400"
          />
          <Button type="submit" variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:border-gray-600">
            Filter
          </Button>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black border-b border-gray-800">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Image</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Name</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Slug</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Price</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {(items ?? []).map((product: any) => (
                <tr key={product.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <img 
                      src={product.image_url || `https://picsum.photos/seed/${encodeURIComponent(product.slug)}/80/80`}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-700"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-white">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{product.slug}</td>
                  <td className="px-6 py-4 text-sm text-white">₹{Number(product.price).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      product.active 
                        ? 'bg-green-900/20 text-green-400 border border-green-800' 
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}>
                      {product.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/admin/products/edit/${product.id}`}
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Edit
                      </Link>
                      <DeleteProductButton product={{ id: product.id, name: product.name }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!items || items.length === 0) && (
          <div className="text-center py-8 text-gray-400">
            No products found. <Link href="/admin/products/new" className="text-blue-400 hover:text-blue-300">Create your first product</Link>
          </div>
        )}
      </div>
    </div>
  );
}
