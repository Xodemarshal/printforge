import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { TreePine } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <form 
        action={async (formData) => {
          "use server";
          await loginAction(formData);
        }} 
        className="panel-soft w-full max-w-md space-y-5 rounded-[28px] p-8"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-forest text-cream shadow-lg shadow-forest/20">
            <TreePine size={20} />
          </span>
          <h1 className="display-font text-3xl text-primary-dark font-bold">Welcome back</h1>
          <p className="text-sm text-secondary-medium">Sign in to your PrintForge account</p>
        </div>
        <Input name="email" type="email" placeholder="Email address" required />
        <Input name="password" type="password" placeholder="Password" required />
        <Button type="submit" className="w-full">
          Sign In
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
