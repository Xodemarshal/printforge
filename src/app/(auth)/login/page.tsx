"use client";

import { useState, useTransition, use, useEffect } from "react";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { TreePine, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = use(searchParams);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (error) {
      toast.error("Google Auth Error", error.message);
    }
  };

  useEffect(() => {
    if (params.message === "check-email") {
      toast.success("Registration Successful", "Please check your email to verify your account before logging in.");
    }
  }, [params.message]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const res = await loginAction(formData);
        if (res && res.error) {
          setError(res.error);
          toast.error("Login Failed", res.error);
        }
      } catch (err: any) {
        // If it's a Next.js redirect, let it propagate
        if (err.message && (err.message.includes("NEXT_REDIRECT") || err.digest?.includes("NEXT_REDIRECT"))) {
          toast.success("Welcome back!", "Logging you in...");
          throw err;
        }
        const errMsg = err.message || "An unexpected error occurred during login.";
        setError(errMsg);
        toast.error("Login Error", errMsg);
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
          <h1 className="display-font text-3xl text-primary-dark font-bold">Welcome back</h1>
          <p className="text-sm text-secondary-medium">Sign in to your PrintForge account</p>
        </div>

        {params.message === "check-email" && (
          <div className="flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-800 border border-green-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
            <span>Verification email sent. Please check your inbox to confirm your account.</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-800 border border-red-200">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input name="email" type="email" placeholder="Email address" required disabled={isPending} />
        <Input name="password" type="password" placeholder="Password" required disabled={isPending} />
        
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Signing In..." : "Sign In"}
        </Button>

        <div className="relative flex items-center justify-center my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-forest/10 dark:border-forest/25"></div>
          </div>
          <span className="relative bg-[#fbfcfb] dark:bg-[#0f1810] px-3 text-xs uppercase tracking-widest text-secondary-light font-medium">
            Or
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2 border border-forest/10 hover:border-forest/25 hover:bg-forest/5"
          onClick={handleGoogleLogin}
          disabled={isPending}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.37C21.68,11.83 21.57,11.41 21.35,11.1z" fill="#4285F4" />
              <path d="M12,20.6c2.43,0 4.47,-0.8 5.96,-2.18l-3.3,-2.57c-0.9,0.6 -2.07,0.97 -3.3,0.97c-2.34,0 -4.33,-1.58 -5.03,-3.7H2.88v2.65C4.38,18.78 7.94,20.6 12,20.6z" fill="#34A853" />
              <path d="M6.97,13.12C6.79,12.58 6.7,12.01 6.7,11.4c0,-0.61 0.09,-1.18 0.27,-1.72V7.03H2.88C2.3,8.21 2,9.53 2,10.9s0.3,2.69 0.88,3.87L6.97,13.12z" fill="#FBBC05" />
              <path d="M12,5.2c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,2.56 14.42,1.7 12,1.7C7.94,1.7 4.38,3.52 2.88,6.5L6.97,9.15C7.67,7.03 9.66,5.2 12,5.2z" fill="#EA4335" />
            </g>
          </svg>
          Continue with Google
        </Button>
        
        <div className="space-y-2 pt-2 text-center text-sm text-secondary-light">
          <p>
            Need an account?{" "}
            <Link href="/register" className="font-medium text-interactive">
              Sign up
            </Link>
          </p>
          <p className="text-xs text-muted-light">
            Admin portal access uses the same login. Sign in with an account whose role is admin, then open{" "}
            <Link href="/admin/dashboard" className="font-medium text-interactive">
              /admin/dashboard
            </Link>
            .
          </p>
        </div>
      </form>
    </div>
  );
}
