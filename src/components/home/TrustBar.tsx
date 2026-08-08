import type { HeroSectionSettings } from "@/actions/settings";

const formatMarkdown = (text: string) => {
  if (!text) return "";

  if (text.includes("<") && text.includes(">")) {
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+="[^"]*"/g, "")
      .trim();
  }

  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, "<strong class='text-cream font-bold'>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code class='bg-white/10 px-1.5 py-0.5 rounded text-emerald-300'>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline text-emerald-400 hover:text-emerald-300">$1</a>')
    .replace(/\n/g, "<br />");

  return formatted;
};

export function TrustBar({ settings }: { settings?: HeroSectionSettings }) {
  const title = settings?.title || "Ideas";
  const description =
    settings?.description ||
    "Transform your ideas into stunning physical products with our premium design services and marketplace.";

  return (
    <section className="py-8 lg:py-12 bg-transparent">
      <div className="page-shell">
        <div className="w-full text-left space-y-3">
          <h2 className="display-font text-3xl sm:text-4xl lg:text-5xl text-emerald-400 font-bold tracking-tight">
            {title}
          </h2>
          <div
            className="text-lg sm:text-xl lg:text-2xl text-cream/80 font-medium leading-relaxed w-full space-y-2"
            dangerouslySetInnerHTML={{ __html: formatMarkdown(description) }}
          />
        </div>
      </div>
    </section>
  );
}
