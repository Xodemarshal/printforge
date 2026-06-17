"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/hooks/useToast";

export default function MakeAdminPage() {
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { success, error } = useToast();

  const handleMakeAdmin = async () => {
    if (!email) {
      error("Error", "Please enter an email address");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/make-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        success("Success!", `${email} is now an admin. Please refresh the page.`);
        setEmail("");
      } else {
        error("Failed", data.error || "Failed to make user admin");
      }
    } catch (err: any) {
      error("Error", err.message || "Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="page-shell py-16">
      <div className="max-w-md mx-auto">
        <div className="bg-cream/30 border border-forest/20 rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-forest mb-4">Make User Admin</h1>
          <p className="text-forest/70 mb-6">
            Enter the email address of the user you want to make an admin.
          </p>

          <div className="space-y-4">
            <Input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-forest/30 focus:border-forest"
            />

            <Button
              onClick={handleMakeAdmin}
              disabled={isProcessing}
              className="w-full bg-forest hover:bg-forest-dark text-white"
            >
              {isProcessing ? "Processing..." : "Make Admin"}
            </Button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This is a temporary utility page for development. 
              Remove this page in production.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
