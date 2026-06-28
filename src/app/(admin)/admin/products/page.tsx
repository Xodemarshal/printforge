import Link from "next/link";
import { getProducts } from "@/actions/products";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { Package, Plus, Upload, Search } from "lucide-react";

export default async function AdminProductsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const { items, total } = await getProducts({
    query: params.q,
    category: params.category,
    page: Number(params.page ?? 1)
  });

  const hasFilters = params.q || params.category;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Products</h1>
          <p className="text-gray-400 mt-1">
            {total !== undefined ? `${total} products` : (items ?? []).length + " products"} in catalog
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products/bulk-upload"
            className="flex items-center gap-2 bg-gray-900 border border-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:text-white hover:border-gray-600 transition-colors"
          >
            <Upload size={14} /> Bulk Upload
          </Link>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-forest-green hover:bg-forest-green/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={14} /> Add Product
          </Link>
        </div>
      </div>

      {/* Search / Filter */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <form action="/admin/products" method="get" className="flex flex-wrap gap-3 items-center">
          <Search size={15} className="text-gray-500" />
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Search products…"
            className="bg-black border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-forest-green outline-none flex-1 min-w-40"
          />
          <input
            name="category"
            defaultValue={params.category}
            placeholder="Category slug"
            className="bg-black border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-forest-green outline-none w-40"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-forest-green hover:bg-forest-green/90 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Search
          </button>
          {hasFilters && (
            <Link href="/admin/products" className="px-4 py-2 border border-gray-700 text-gray-400 hover:text-white rounded-lg text-sm transition-colors">
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black border-b border-gray-800">
              <tr className="text-gray-300 text-xs uppercase tracking-wider">
                <th className="px-5 py-3 text-left font-medium">Product</th>
                <th className="px-5 py-3 text-left font-medium">Slug</th>
                <th className="px-5 py-3 text-right font-medium">Price</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {(items ?? []).map((product: any) => (
                <tr key={product.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image_url || `https://picsum.photos/seed/${encodeURIComponent(product.slug)}/64/64`}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-700"
                      />
                      <div>
                        <p className="text-white font-medium text-sm">{product.name}</p>
                        {product.category && (
                          <p className="text-gray-500 text-xs">{product.category}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-400">{product.slug}</td>
                  <td className="px-5 py-3 text-right">
                    <p className="text-white font-semibold">₹{Number(product.price).toLocaleString("en-IN")}</p>
                    {product.estimated_total_cost > 0 && (
                      <p className="text-gray-500 text-xs">Cost: ₹{Number(product.estimated_total_cost).toLocaleString("en-IN")}</p>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      product.active
                        ? "bg-green-900/30 text-green-400"
                        : "bg-gray-800 text-gray-500"
                    }`}>
                      {product.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/admin/products/edit/${product.id}` as any}
                        className="text-xs text-[#3A6B1C] hover:text-green-400 font-medium border border-[#3A6B1C]/40 px-3 py-1.5 rounded-lg hover:bg-[#3A6B1C]/10 transition-colors"
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
          <div className="py-16 text-center">
            <Package size={48} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No products found</p>
            <Link href="/admin/products/new" className="mt-2 inline-block text-sm text-[#3A6B1C] hover:text-green-400">
              Create your first product →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
