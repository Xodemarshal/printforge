'use server';

import { requireAdmin } from '@/lib/guards';
import {
  startPrintJob,
  completePrintJob,
  failPrintJob,
  getActivePrintJobs,
  getPrintFarmStats
} from '@/services/printFarm';

/**
 * Start a new print job
 */
export async function startPrintJobAction(formData: FormData) {
  await requireAdmin();

  const orderId = String(formData.get('orderId') ?? '');
  const printerName = String(formData.get('printerName') ?? '');

  if (!orderId || !printerName) {
    return { success: false, error: 'Order ID and printer name are required' };
  }

  return startPrintJob(orderId, printerName);
}

/**
 * Complete a print job
 */
export async function completePrintJobAction(formData: FormData) {
  await requireAdmin();

  const printJobId = String(formData.get('printJobId') ?? '');
  const actualPrintHours = Number(formData.get('actualPrintHours') ?? 0);
  const filamentUsedGrams = Number(formData.get('filamentUsedGrams') ?? 0);

  if (!printJobId) {
    return { success: false, error: 'Print job ID is required' };
  }

  return completePrintJob(printJobId, actualPrintHours, filamentUsedGrams);
}

/**
 * Mark a print job as failed
 */
export async function failPrintJobAction(formData: FormData) {
  await requireAdmin();

  const printJobId = String(formData.get('printJobId') ?? '');
  const failureReason = String(formData.get('failureReason') ?? '');

  if (!printJobId || !failureReason) {
    return { success: false, error: 'Print job ID and failure reason are required' };
  }

  return failPrintJob(printJobId, failureReason);
}

/**
 * Get active print jobs
 */
export async function getActivePrintJobsAction() {
  await requireAdmin();
  return getActivePrintJobs();
}

/**
 * Get print farm statistics
 */
export async function getPrintFarmStatsAction(days: number = 30) {
  await requireAdmin();
  return getPrintFarmStats(days);
}
