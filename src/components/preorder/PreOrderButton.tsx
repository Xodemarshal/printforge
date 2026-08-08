"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sparkles, Loader2, CheckCircle2, ShieldCheck, Clock, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface PreOrderButtonProps {
  preorderId: string;
  reservationFee: number;
  isRegistered?: boolean;
  paymentStatus?: string;
  grantedAccess?: boolean;
  isExpired?: boolean;
  isSoldOut?: boolean;
  className?: string;
}

// Dynamically load Razorpay script on demand if not already present
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function PreOrderButton({
  preorderId,
  reservationFee = 10,
  isRegistered: initialRegistered = false,
  paymentStatus: initialPaymentStatus = "pending",
  grantedAccess: initialGranted = false,
  isExpired = false,
  isSoldOut = false,
  className = ""
}: PreOrderButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(initialRegistered);
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const [grantedAccess, setGrantedAccess] = useState(initialGranted);
  const { success, error, info } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const handlePayReservationFee = async () => {
    if (isRegistered && paymentStatus === "paid") {
      if (grantedAccess) {
        info("Access Granted!", "Your Collector Pass is active! You can now purchase this edition.");
      } else {
        info("Priority Pass Secured ✦", `Your ₹${reservationFee} Priority Pass token is confirmed. Waiting for batch approval!`);
      }
      return;
    }

    setIsLoading(true);

    try {
      // Ensure Razorpay SDK is loaded
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        error("Connection Error", "Failed to load secure payment gateway. Please check your internet connection.");
        setIsLoading(false);
        return;
      }

      // 1. Call reserve endpoint to create Razorpay order
      const response = await fetch("/api/payment/preorder-reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preorderId })
      });

      const data = await response.json();

      if (response.status === 401 || data.requireLogin) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      if (!response.ok || data.error) {
        if (data.alreadyRegistered) {
          setIsRegistered(true);
          setPaymentStatus("paid");
        }
        error("Notice", data.error || "Could not initialize Priority Pass.");
        setIsLoading(false);
        return;
      }

      // 2. Open Razorpay payment modal
      const options = {
        key: data.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: data.amount,
        currency: data.currency || "INR",
        name: "ArchiveVault",
        description: `Priority Pass Token — ${data.productName || "Collector Edition"}`,
        order_id: data.razorpayOrderId,
        handler: async function (paymentResponse: any) {
          try {
            // 3. Verify payment signature on backend
            const verifyRes = await fetch("/api/payment/preorder-verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              setIsRegistered(true);
              setPaymentStatus("paid");
              success("Priority Pass Secured! ✦", `Your ₹${reservationFee} Vault Pass token has been confirmed! We'll notify you as soon as your batch is ready.`);
              router.refresh();
            } else {
              error("Verification Failed", verifyData.error || "Payment signature verification failed.");
            }
          } catch (err: any) {
            error("Verification Error", err.message || "Failed to confirm payment.");
          } finally {
            setIsLoading(false);
          }
        },
        theme: {
          color: "#059669"
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
            info("Pass Cancelled", "Priority Pass payment was not completed.");
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      error("Action Failed", err.message || "Something went wrong.");
      setIsLoading(false);
    }
  };

  if (isExpired) {
    return (
      <div className="w-full text-center p-3.5 rounded-2xl bg-white/5 border border-white/10 text-cream/40 text-sm font-semibold">
        Vault Window Closed
      </div>
    );
  }

  if (isSoldOut) {
    return (
      <div className="w-full text-center p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-semibold">
        Collector Passes Sold Out
      </div>
    );
  }

  if (isRegistered && paymentStatus === "paid") {
    if (grantedAccess) {
      return (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 space-y-1 text-center shadow-lg shadow-emerald-950/40">
            <div className="flex items-center justify-center gap-2 font-bold text-base">
              <CheckCircle2 size={20} className="text-emerald-400" />
              <span>Collector Access Approved! ✦</span>
            </div>
            <p className="text-xs text-cream/80">
              Your ₹{reservationFee} Priority Pass token will be automatically credited at checkout.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 space-y-1 text-center">
          <div className="flex items-center justify-center gap-2 font-bold text-sm">
            <Clock size={18} className="animate-spin text-amber-400" />
            <span>Priority Pass Secured ✦ (₹{reservationFee} Token)</span>
          </div>
          <p className="text-xs text-cream/70">
            Your spot in the collector queue is locked! As soon as your batch is approved, your ₹{reservationFee} pass will be credited.
          </p>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handlePayReservationFee}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-2.5 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-base shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span>Opening Payment Gateway...</span>
        </>
      ) : (
        <>
          <Sparkles size={18} className="text-emerald-200 animate-pulse" />
          <span>GET PRIORITY ACCESS PASS (₹{reservationFee})</span>
          <KeyRound size={16} className="opacity-80" />
        </>
      )}
    </button>
  );
}
