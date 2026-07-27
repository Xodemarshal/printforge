"use server";

import { requireAdmin } from "@/lib/guards";
import { sendEmail } from "@/services/email";

export type MailerCheckState = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function sendMailerCheckAction(
  _prevState: MailerCheckState,
  _formData: FormData
): Promise<MailerCheckState> {
  try {
    const admin = await requireAdmin();
    const recipient = admin.email || "";

    if (!recipient) {
      return {
        success: false,
        error: "No admin email address is available for the current account."
      };
    }

    const result = await sendEmail("admin_mailer_check", {
      to: recipient,
      subject: "Mailer check from admin dashboard",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
          <h2 style="margin: 0 0 12px;">Mailer Check</h2>
          <p>This is a test email from the admin dashboard.</p>
          <p>If you received this, Resend is working and the dashboard mailer check is healthy.</p>
        </div>
      `
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to send the test email."
      };
    }

    return {
      success: true,
      message: `Test email sent to ${recipient}.`
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Mailer check failed."
    };
  }
}
