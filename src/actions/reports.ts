'use server';

import { requireAdmin } from '@/lib/guards';
import {
  generateDailyReport,
  generateWeeklyReport,
  sendDailyReportEmail,
  sendWeeklyReportEmail
} from '@/services/reports';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Generate daily report (preview)
 */
export async function generateDailyReportAction() {
  await requireAdmin();
  return generateDailyReport();
}

/**
 * Generate weekly report (preview)
 */
export async function generateWeeklyReportAction() {
  await requireAdmin();
  return generateWeeklyReport();
}

/**
 * Send daily report manually
 */
export async function sendDailyReportManuallyAction(email: string) {
  await requireAdmin();
  
  if (!email) {
    return { success: false, error: 'Email is required' };
  }

  return sendDailyReportEmail(email);
}

/**
 * Subscribe to reports
 */
export async function subscribeToReportsAction(formData: FormData) {
  await requireAdmin();

  const email = String(formData.get('email') ?? '');
  const reportType = String(formData.get('reportType') ?? 'daily') as 'daily' | 'weekly' | 'monthly';

  if (!email) {
    return { success: false, error: 'Email is required' };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('scheduled_reports')
    .insert({
      report_type: reportType,
      recipient_email: email,
      enabled: true
    });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Unsubscribe from reports
 */
export async function unsubscribeFromReportsAction(subscriptionId: string) {
  await requireAdmin();

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('scheduled_reports')
    .update({ enabled: false })
    .eq('id', subscriptionId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
