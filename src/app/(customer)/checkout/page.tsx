import type { Metadata } from "next";
import { CheckoutClient } from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout - PrintForge",
  description: "Complete your order and proceed to payment."
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}