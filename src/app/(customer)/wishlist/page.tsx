import type { Metadata } from "next";
import { WishlistClient } from "./WishlistClient";

export const metadata: Metadata = {
  title: "Wishlist - PrintForge",
  description: "Your saved products and favorites."
};

export default function WishlistPage() {
  return <WishlistClient />;
}