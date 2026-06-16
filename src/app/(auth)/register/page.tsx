import { registerAction } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { TreePine } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <form 
        action={async (formData) => {
          "use server";
          await registerAction(formData);
        }} 
        className="panel-soft w-full max-w-md space-y-5 rounded-[28px] p-8"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-forest text-cream shadow-lg shadow-forest/20">
            <TreePine size={20} />
          </span>
          <h1 className="display-font text-3xl text-primary-dark font-bold">Create account</h1>
          <p className="text-sm text-secondary-medium">Join PrintForge today</p>
        </div>
        <Input name="name" placeholder="Full name" required />
        <Input name="email" type="email" placeholder="Email address" required />
        <Input name="password" type="password" placeholder="Create password" required />
        <Button type="submit" className="w-full">
          Create Account
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
