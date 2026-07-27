"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import { verifyPaymentAction } from "@/actions/checkout";

type RetryPaymentButtonProps = {
  orderId: string;
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
};

function loadRazorpayScript() {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if ((window as any).Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise<boolean>((resolve) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function RetryPaymentButton({
  orderId,
  razorpayOrderId,
  razorpayKeyId,
  amount,
  customerName,
  customerEmail,
  customerPhone
}: RetryPaymentButtonProps) {
  const [processing, setProcessing] = useState(false);
  const { success, error } = useToast();
  const router = useRouter();

  const handleRetryPayment = async () => {
    setProcessing(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded || !(window as any).Razorpay) {
        throw new Error("Unable to load Razorpay checkout. Please try again.");
      }

      const options = {
        key: razorpayKeyId,
        amount: Math.round(Number(amount || 0) * 100),
        currency: "INR",
        name: "PrintForge",
        description: `Order #${orderId.slice(0, 8)}`,
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          try {
            const verifyResult = await verifyPaymentAction(
              orderId,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            if (verifyResult.success) {
              success("Payment successful", "Your order has been confirmed.");
              router.refresh();
            } else {
              error("Payment verification failed", verifyResult.error || "Please contact support.");
            }
          } catch (err: any) {
            error("Verification error", err.message || "Failed to verify payment.");
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: customerName || "",
          email: customerEmail || "",
          contact: customerPhone || ""
        },
        theme: {
          color: "#2C5F2D"
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            error("Payment closed", "You can reopen checkout and complete payment anytime.");
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      error("Payment retry failed", err.message || "Unable to open payment checkout.");
      setProcessing(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleRetryPayment}
      disabled={processing}
      className="w-full bg-forest hover:bg-forest-dark text-white"
    >
      {processing ? (
        <>
          <Loader2 size={16} className="mr-2 animate-spin" />
          Opening Checkout...
        </>
      ) : (
        <>
          <CreditCard size={16} className="mr-2" />
          Pay Now
        </>
      )}
    </Button>
  );
}
