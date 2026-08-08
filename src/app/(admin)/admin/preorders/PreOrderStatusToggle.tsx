"use client";

import { useTransition, useState } from "react";
import { ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { togglePreOrderStatusAction } from "@/actions/preorders";
import type { PreOrderStatus } from "@/types";

interface PreOrderStatusToggleProps {
  preorderId: string;
  currentStatus: PreOrderStatus;
}

export function PreOrderStatusToggle({ preorderId, currentStatus }: PreOrderStatusToggleProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);
  const isActive = status === "ACTIVE";

  const handleToggle = () => {
    const newStatus: PreOrderStatus = isActive ? "DRAFT" : "ACTIVE";
    startTransition(async () => {
      const result = await togglePreOrderStatusAction(preorderId, newStatus);
      if (result.success) {
        setStatus(newStatus);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      title={isActive ? "Click to pause (set to Draft)" : "Click to activate"}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
        isActive
          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
          : "border-white/10 bg-white/5 text-cream/50 hover:text-cream hover:bg-white/10"
      } disabled:opacity-50`}
    >
      {isPending ? (
        <Loader2 size={14} className="animate-spin" />
      ) : isActive ? (
        <ToggleRight size={14} />
      ) : (
        <ToggleLeft size={14} />
      )}
      <span>{isActive ? "Live" : "Draft"}</span>
    </button>
  );
}
