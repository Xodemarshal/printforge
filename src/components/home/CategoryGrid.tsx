import Link from "next/link";

export function CategoryGrid({ categories }: { categories: { id: string; slug: string; name: string; image_url?: string }[] }) {
  // Only show categories that have images uploaded by admin
  const categoriesWithImages = categories.filter(category => category.image_url);

  // If no categories have images, don't show the section
  if (categoriesWithImages.length === 0) {
    return null;
  }

  return (
    <section className="page-shell py-24 lg:py-32">
      <div className="mb-16 flex flex-col items-center text-center">
        <div className="flex items-center gap-4">
          <span className="h-px w-12 bg-emerald-400/30" />
          <span className="label-font">Product Categories</span>
          <span className="h-px w-12 bg-emerald-400/30" />
        </div>
        <h2 className="display-font mt-6 text-5xl text-emerald-400 md:text-7xl font-bold">Browse the Collection</h2>
        <p className="mt-6 max-w-xl text-lg text-cream/60 font-medium leading-relaxed">
          Discover our curated selection of innovative products, where each category offers unique solutions and creative designs.
        </p>
      </div>
      
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {categoriesWithImages.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group relative aspect-[3.5/5] overflow-hidden rounded-[48px] border border-white/10 bg-black/40 shadow-2xl shadow-black/20 transition-all duration-700 hover:-translate-y-3 hover:shadow-emerald-500/10 hover:border-emerald-500/30"
          >
            <img
              src={category.image_url!}
              alt={category.name}
              className="absolute inset-0 h-full w-full object-cover transition-all duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />
            
            <div className="absolute inset-4 rounded-[40px] border border-white/10 transition-all duration-500 group-hover:border-emerald-400/40" />

            <div className="absolute bottom-0 left-0 right-0 p-10">
              <div className="flex flex-col gap-2 transition-transform duration-500 group-hover:-translate-y-3">
                <span className="label-font !text-[9px]">Premium Collection</span>
                <span className="display-font text-3xl text-cream leading-tight">{category.name}</span>
                <div className="mt-6 flex items-center gap-3 opacity-0 transition-all duration-500 group-hover:opacity-100">
                  <span className="h-0.5 w-12 bg-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Explore</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
