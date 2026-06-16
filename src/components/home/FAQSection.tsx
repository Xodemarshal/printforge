export function FAQSection() {
  return (
    <section className="page-shell py-10 lg:py-14">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-foreground/50">Support</p>
        <h2 className="display-font text-4xl text-[#243223]">Frequently asked questions</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <details className="rounded-[24px] border border-black/10 bg-white/70 p-5">
          <summary className="font-medium">How do uploads work?</summary>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload a design file, configure product settings, and submit your custom order request.
          </p>
        </details>
        <details className="rounded-[24px] border border-black/10 bg-white/70 p-5">
          <summary className="font-medium">Do you support custom colors?</summary>
          <p className="mt-2 text-sm text-muted-foreground">Yes, color options are available for most products and custom orders.</p>
        </details>
      </div>
    </section>
  );
}
