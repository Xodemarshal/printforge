"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sparkles, Loader2, CheckCircle2, Lock } from "lucide-react";
import { createPreOrderRegistrationAction } from "@/actions/preorders";
import { useToast } from "@/hooks/useToast";

interface PreOrderButtonProps {
  preorderId: string;
  lockedPrice?: number;
  discountPercentage?: number;
  isRegistered?: boolean;
  isExpired?: boolean;
  isSoldOut?: boolean;
  className?: string;
}

export function PreOrderButton({
  preorderId,
  lockedPrice,
  discountPercentage,
  isRegistered: initialRegistered = false,
  isExpired = false,
  isSoldOut = false,
  className = ""
}: PreOrderButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isRegistered, setIsRegistered] = useState(initialRegistered);
  const [registeredPrice, setRegisteredPrice] = useState<number | undefined>(lockedPrice);
  const { success, error, info } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const handlePrebook = () => {
    if (isRegistered) {
      info("Already Prebooked", `Your locked preorder price is ₹${registeredPrice || lockedPrice}`);
      return;
    }

    startTransition(async () => {
      const result = await createPreOrderRegistrationAction(preorderId);

      if (result.requireLogin) {
        // Redirect to login with return path
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      if (!result.success) {
        error("Prebook Failed", result.error || "Could not register preorder.");
        return;
      }

      if (result.alreadyRegistered) {
        setIsRegistered(true);
        if (result.lockedPrice) setRegisteredPrice(result.lockedPrice);
        info("Already Prebooked", result.message);
      } else {
        setIsRegistered(true);
        if (result.lockedPrice) setRegisteredPrice(result.lockedPrice);
        success("Prebook Confirmed! 🎉", result.message);
      }
    });
  };

  if (isExpired) {
    return (
      <div className="w-full text-center p-3 rounded-2xl bg-white/5 border border-white/10 text-cream/40 text-sm font-semibold">
        Preorder Campaign Ended
      </div>
    );
  }

  if (isSoldOut) {
    return (
      <div className="w-full text-center p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-semibold">
        Preorder Slots Sold Out
      </div>
    );
  }

  if (isRegistered) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-sm shadow-md shadow-emerald-950/30">
          <CheckCircle2 size={18} />
          <span>Prebooked — Price Locked at ₹{registeredPrice || lockedPrice}</span>
        </div>
        <p className="text-[11px] text-center text-cream/60">
          You have secured this preorder benefit. We will notify you as soon as production is ready!
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handlePrebook}
      disabled={isPending}
      className={`w-full flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-base shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 ${className}`}
    >
      {isPending ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span>Locking Preorder Benefit...</span>
        </>
      ) : (
        <>
          <Sparkles size={18} className="text-emerald-200 animate-pulse" />
          <span>PREBOOK NOW</span>
          <Lock size={14} className="opacity-70 ml-1" />
        </>
      )}
    </button>
  );
}
