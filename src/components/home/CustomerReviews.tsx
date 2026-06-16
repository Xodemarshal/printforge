export function CustomerReviews({ reviews }: { reviews: { id: string; comment: string; name: string }[] }) {
  return (
    <section className="page-shell py-10 lg:py-14">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-foreground/50">Collective voice</p>
        <h2 className="display-font text-4xl text-[#243223]">Customer reviews</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {reviews.map((review) => (
          <blockquote key={review.id} className="rounded-[28px] border border-black/10 bg-white/70 p-5 shadow-sm">
            <p className="text-sm leading-7 text-foreground/75">“{review.comment}”</p>
            <footer className="mt-4 text-sm font-medium text-[#243223]">{review.name}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
