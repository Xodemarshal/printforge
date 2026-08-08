"use client";

import { useTransition, useState } from "react";
import { Loader2, CheckCircle2, Circle } from "lucide-react";
import { toggleGrantAccessAction } from "@/actions/preorders";
import { useToast } from "@/hooks/useToast";

interface GrantAccessCheckboxProps {
  registrationId: string;
  initialGranted: boolean;
  userName: string;
  reservationFeePaid: number;
}

export function GrantAccessCheckbox({
  registrationId,
  initialGranted,
  userName,
  reservationFeePaid
}: GrantAccessCheckboxProps) {
  const [isPending, startTransition] = useTransition();
  const [granted, setGranted] = useState(initialGranted);
  const { success, error } = useToast();

  const handleToggle = () => {
    const nextState = !granted;
    startTransition(async () => {
      const result = await toggleGrantAccessAction(registrationId, nextState);
      if (result.success) {
        setGranted(nextState);
        if (nextState) {
          success("Access Granted! 🎉", `Granted early purchasing access to ${userName}. Fee paid (₹${reservationFeePaid}) will be deducted at checkout.`);
        } else {
          success("Access Revoked", `Revoked access for ${userName}.`);
        }
      } else {
        error("Action Failed", result.error || "Failed to update access state.");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
        granted
          ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
          : "border-white/10 bg-white/5 text-cream/50 hover:text-cream hover:bg-white/10"
      } disabled:opacity-50`}
    >
      {isPending ? (
        <Loader2 size={14} className="animate-spin text-amber-400" />
      ) : granted ? (
        <CheckCircle2 size={14} className="text-emerald-400" />
      ) : (
        <Circle size={14} className="opacity-50" />
      )}
      <span>{granted ? "Access Granted" : "Grant Access"}</span>
    </button>
  );
}
