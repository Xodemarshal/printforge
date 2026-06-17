import type { Metadata } from "next";
import { CheckoutClient } from "./CheckoutClient";
import Script from "next/script";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Checkout - PrintForge",
  description: "Complete your order and proceed to payment."
};

export default function CheckoutPage() {
  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <CheckoutClient />
    </>
  );
}