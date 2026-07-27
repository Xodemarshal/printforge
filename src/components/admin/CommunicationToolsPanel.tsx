"use client";

import { useActionState, useEffect } from "react";
import { Mail, MessageCircle, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import { sendMailerCheckAction, type MailerCheckState } from "@/actions/admin-communications";

type CommunicationToolsPanelProps = {
  adminEmail: string;
  whatsappNumber: string;
};

const initialState: MailerCheckState = {
  success: false
};

function buildWhatsAppUrl(whatsappNumber: string) {
  const digits = whatsappNumber.replace(/[^0-9]/g, "");
  const message = encodeURIComponent("Test message from the admin dashboard.");
  return digits ? `https://wa.me/${digits}?text=${message}` : "";
}

export function CommunicationToolsPanel({ adminEmail, whatsappNumber }: CommunicationToolsPanelProps) {
  const { success, error } = useToast();
  const [state, formAction, pending] = useActionState(sendMailerCheckAction, initialState);
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber);

  useEffect(() => {
    if (state.success && state.message) {
      success("Mailer check sent", state.message);
    } else if (!state.success && state.error) {
      error("Mailer check failed", state.error);
    }
  }, [state, success, error]);

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800">
        <h2 className="text-white font-semibold flex items-center gap-2 text-sm">
          <MessageCircle size={14} className="text-green-400" /> Communication Tools
        </h2>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2">
        <form action={formAction} className="rounded-xl border border-gray-800 bg-black/40 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-blue-400" />
            <p className="text-sm font-medium text-white">Mailer check</p>
          </div>
          <p className="text-xs text-gray-400">
            Sends a test email to the logged-in admin account.
          </p>
          <p className="text-xs text-gray-500 break-all">
            Target: {adminEmail || "No admin email found"}
          </p>
          <Button
            type="submit"
            disabled={pending || !adminEmail}
            className="w-full bg-forest text-white hover:bg-forest-dark"
          >
            {pending ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <CheckCircle2 size={14} className="mr-2" />
                Send Test Email
              </>
            )}
          </Button>
        </form>

        <div className="rounded-xl border border-gray-800 bg-black/40 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <MessageCircle size={14} className="text-emerald-400" />
            <p className="text-sm font-medium text-white">WhatsApp messenger check</p>
          </div>
          <p className="text-xs text-gray-400">
            Opens a WhatsApp chat with your configured support number.
          </p>
          <p className="text-xs text-gray-500 break-all">
            Number: {whatsappNumber || "Not configured"}
          </p>
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 bg-green-600 text-white hover:bg-green-500 shadow-md shadow-green-900/20"
            >
              Open WhatsApp
            </a>
          ) : (
            <Button type="button" disabled className="w-full bg-gray-800 text-gray-400 cursor-not-allowed">
              WhatsApp not configured
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
