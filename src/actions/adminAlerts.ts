'use server';

import { requireAdmin } from '@/lib/guards';
import {
  createAdminAlert,
  markAlertAsRead,
  resolveAlert,
  getUnreadAlertsCount
} from '@/services/alerts';

/**
 * Create a manual admin alert
 */
export async function createAdminAlertAction(formData: FormData) {
  await requireAdmin();

  const alertType = String(formData.get('alertType') ?? '');
  const severity = String(formData.get('severity') ?? 'info') as 'info' | 'warning' | 'critical';
  const title = String(formData.get('title') ?? '');
  const message = String(formData.get('message') ?? '');

  if (!alertType || !title || !message) {
    return { success: false, error: 'Alert type, title, and message are required' };
  }

  return createAdminAlert({
    alertType,
    severity,
    title,
    message
  });
}

/**
 * Mark alert as read
 */
export async function markAlertAsReadAction(alertId: string) {
  await requireAdmin();
  return markAlertAsRead(alertId);
}

/**
 * Resolve an alert
 */
export async function resolveAlertAction(formData: FormData) {
  const user = await requireAdmin();

  const alertId = String(formData.get('alertId') ?? '');

  if (!alertId) {
    return { success: false, error: 'Alert ID is required' };
  }

  return resolveAlert(alertId, user.id);
}

/**
 * Get unread alerts count
 */
export async function getUnreadAlertsCountAction() {
  await requireAdmin();
  return getUnreadAlertsCount();
}
