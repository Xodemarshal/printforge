"use client";

import { useState, useTransition } from "react";
import { registerAction } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { TreePine, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const res = await registerAction(formData);
        if (res && res.error) {
          setError(res.error);
          toast.error("Registration Failed", res.error);
        }
      } catch (err: any) {
        // If it's a Next.js redirect, let it propagate
        if (err.message && (err.message.includes("NEXT_REDIRECT") || err.digest?.includes("NEXT_REDIRECT"))) {
          toast.success("Account Created!", "Check your inbox to confirm your email address.");
          throw err;
        }
        const errMsg = err.message || "An unexpected error occurred during registration.";
        setError(errMsg);
        toast.error("Registration Error", errMsg);
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <form 
        onSubmit={handleSubmit}
        className="panel-soft w-full max-w-md space-y-5 rounded-[28px] p-8"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-forest text-cream shadow-lg shadow-forest/20">
            <TreePine size={20} />
          </span>
          <h1 className="display-font text-3xl text-primary-dark font-bold">Create account</h1>
          <p className="text-sm text-secondary-medium">Join PrintForge today</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-800 border border-red-200">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input name="name" placeholder="Full name" required disabled={isPending} />
        <Input name="email" type="email" placeholder="Email address" required disabled={isPending} />
        <Input name="password" type="password" placeholder="Create password" required disabled={isPending} />
        
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Creating Account..." : "Create Account"}
        </Button>
        
        <p className="pt-2 text-center text-sm text-secondary-light">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-interactive">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
