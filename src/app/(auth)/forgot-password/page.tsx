"use client";

import { useState, useTransition } from "react";
import { requestPasswordResetAction } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const toast = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", email);
      
      const result = await requestPasswordResetAction(formData);
      
      if (result.error) {
        toast.error("Error", result.error);
      } else {
        toast.success("Success", "Password reset link sent to your email");
        setIsSubmitted(true);
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="panel-soft w-full max-w-md space-y-5 rounded-[28px] p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-forest text-cream shadow-lg shadow-forest/20">
            <Mail size={20} />
          </div>
          <h1 className="display-font text-3xl text-primary-dark font-bold">Reset Password</h1>
          <p className="text-sm text-secondary-medium">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-800 border border-green-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
              <span>Password reset link sent to {email}. Please check your inbox.</span>
            </div>
            
            <div className="space-y-3 pt-4">
              <p className="text-sm text-secondary-medium">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <Button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                }}
                variant="outline"
                className="w-full"
              >
                Send Another Link
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isPending}
                className="w-full"
              />
            </div>

            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-yellow-600" />
                <div>
                  <p className="font-medium">Check your email</p>
                  <p className="mt-1 text-yellow-700">You'll receive a password reset link in your inbox. Follow the instructions in the email to create a new password.</p>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isPending || !email.includes("@")}
              className="w-full"
            >
              {isPending ? "Sending..." : "Send Reset Link"}
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
        )}
      </div>
    </div>
  );
}
