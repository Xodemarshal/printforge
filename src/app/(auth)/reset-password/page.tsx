"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPasswordWithTokenAction } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { Lock, CheckCircle2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/useToast";

function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();

  const token = searchParams.get("token");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData();
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);
      
      const result = await resetPasswordWithTokenAction(formData);
      
      if (result.error) {
        toast.error("Error", result.error);
      } else {
        toast.success("Success", "Password reset successfully!");
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    });
  };

  if (!token) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-800 border border-red-200">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
          <span>Invalid or expired reset link. Please request a new password reset.</span>
        </div>
        <Link 
          href="/forgot-password" 
          className="inline-flex items-center gap-2 text-interactive hover:text-primary-medium transition-colors"
        >
          <ArrowLeft size={14} />
          Request New Reset Link
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-800 border border-green-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
          <span>Password reset successfully! Redirecting to login...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">New Password</label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
            disabled={isPending}
            className="w-full pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-light hover:text-foreground"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Confirm New Password</label>
        <div className="relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            disabled={isPending}
            className="w-full pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-light hover:text-foreground"
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isPending || password.length < 6 || password !== confirmPassword}
        className="w-full"
      >
        {isPending ? "Resetting..." : "Reset Password"}
      </Button>

      <div className="pt-4 text-center text-sm text-secondary-light">
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-interactive hover:text-primary-medium transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Login
        </Link>
      </div>
    </form>
  );
}

// AlertTriangle component for the token check
function AlertTriangle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="panel-soft w-full max-w-md space-y-5 rounded-[28px] p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-forest text-cream shadow-lg shadow-forest/20">
            <Lock size={20} />
          </div>
          <h1 className="display-font text-3xl text-primary-dark font-bold">Set New Password</h1>
          <p className="text-sm text-secondary-medium">
            Create a new password for your account
          </p>
        </div>

        <Suspense fallback={
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded-lg animate-pulse"></div>
            <div className="h-10 bg-muted rounded-lg animate-pulse"></div>
            <div className="h-10 bg-muted rounded-lg animate-pulse"></div>
          </div>
        }>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
