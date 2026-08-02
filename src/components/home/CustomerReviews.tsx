export function CustomerReviews({ reviews }: { reviews: { id: string; comment: string; name: string }[] }) {
  return (
    <section className="page-shell py-10 lg:py-14">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-400/70">Collective voice</p>
        <h2 className="display-font text-4xl text-emerald-400 font-bold">Customer reviews</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {reviews.map((review) => (
          <blockquote key={review.id} className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-[0_10px_24px_rgba(0,0,0,0.2)]">
            <p className="text-sm leading-7 text-cream/70">&ldquo;{review.comment}&rdquo;</p>
            <footer className="mt-4 text-sm font-medium text-emerald-400">{review.name}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
