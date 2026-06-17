import Link from "next/link";
import { TreePine } from "lucide-react";

export function Footer({ siteName = "PrintForge" }: { siteName?: string }) {
  return (
    <footer className="mt-16 border-t border-forest/15 bg-muted/30 dark:bg-card/80">
      <div className="page-shell grid gap-8 py-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-forest text-cream shadow-md shadow-forest/20">
              <TreePine size={18} />
            </span>
            <p className="display-font text-2xl font-semibold text-primary-dark">{siteName || "PrintForge"}</p>
          </div>
          <p className="max-w-sm text-sm leading-6 text-secondary-medium">
            Premium design services, custom manufacturing, and a complete marketplace for creative products.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold uppercase tracking-[0.2em] text-primary-medium">Products</p>
          <div className="mt-4 flex flex-col gap-2 text-secondary-light">
            <Link href="/shop" className="text-interactive hover:text-primary-medium">Shop All</Link>
            <Link href="/best-sellers" className="text-interactive hover:text-primary-medium">Best Sellers</Link>
            <Link href="/new-arrivals" className="text-interactive hover:text-primary-medium">New Arrivals</Link>
            <Link href="/about" className="text-interactive hover:text-primary-medium">About Us</Link>
          </div>
        </div>
        <div className="text-sm">
          <p className="font-semibold uppercase tracking-[0.2em] text-primary-medium">Account</p>
          <div className="mt-4 flex flex-col gap-2 text-secondary-light">
            <Link href="/dashboard" className="text-interactive hover:text-primary-medium">Dashboard</Link>
            <Link href="/orders" className="text-interactive hover:text-primary-medium">Orders</Link>
            <Link href="/wishlist" className="text-interactive hover:text-primary-medium">Wishlist</Link>
            <Link href="/faq" className="text-interactive hover:text-primary-medium">Support</Link>
          </div>
        </div>
        <div className="text-sm">
          <p className="font-semibold uppercase tracking-[0.2em] text-primary-medium">Contact</p>
          <div className="mt-4 space-y-2 text-secondary-light">
            <p>hello@printforge.com</p>
            <p>Mon–Fri, 9:00 to 17:00</p>
          </div>
        </div>
      </div>
      <div className="border-t border-forest/15 py-4 text-center text-xs text-muted-light">
        &copy; {new Date().getFullYear()} {siteName || "PrintForge"}. All rights reserved.
      </div>
    </footer>
  );
}
