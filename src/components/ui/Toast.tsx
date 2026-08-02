"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: {
    container: "bg-[#0d2818]/95 border-emerald-500/40 shadow-emerald-950/50 text-emerald-100",
    icon: "text-emerald-400",
  },
  error: {
    container: "bg-[#2d1215]/95 border-red-500/50 shadow-red-950/60 text-red-100",
    icon: "text-red-400",
  },
  warning: {
    container: "bg-[#2a1d0c]/95 border-amber-500/50 shadow-amber-950/60 text-amber-100",
    icon: "text-amber-400",
  },
  info: {
    container: "bg-[#0c2233]/95 border-sky-500/50 shadow-sky-950/60 text-sky-100",
    icon: "text-sky-400",
  },
};

function ToastItem({ toast, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = icons[toast.type];
  const currentStyle = styles[toast.type];

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 50);
    
    // Auto close
    const autoClose = setTimeout(() => {
      handleClose();
    }, toast.duration || 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoClose);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(toast.id), 300);
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-out ${
        isVisible ? "translate-x-0 opacity-100 scale-100" : "translate-x-full opacity-0 scale-95"
      }`}
    >
      <div className={`rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${currentStyle.container} max-w-sm w-full`}>
        <div className="flex items-start gap-3">
          <Icon size={20} className={`shrink-0 mt-0.5 ${currentStyle.icon}`} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-white tracking-wide">{toast.title}</p>
            {toast.message && (
              <p className="text-xs text-cream/80 mt-1 leading-relaxed break-words">{toast.message}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="shrink-0 text-white/50 hover:text-white transition-colors p-0.5 rounded-lg hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-auto">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
}