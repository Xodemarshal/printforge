import type { Metadata } from "next";
import { WishlistClient } from "./WishlistClient";
import { requireUser } from "@/lib/guards";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Wishlist - PrintForge",
  description: "Your saved products and favorites."
};

export default async function WishlistPage() {
  await requireUser();
  return <WishlistClient />;
}



