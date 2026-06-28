'use server';

import { requireAdmin } from '@/lib/guards';
import { 
  calculateOrderProfitability, 
  updateProductCost, 
  getProfitabilityReport 
} from '@/services/profitability';

/**
 * Calculate profitability for a specific order
 */
export async function calculateOrderProfitabilityAction(orderId: string) {
  await requireAdmin();
  return calculateOrderProfitability(orderId);
}

/**
 * Update product cost information
 */
export async function updateProductCostAction(formData: FormData) {
  await requireAdmin();

  const productId = String(formData.get('productId') ?? '');
  const filamentWeightGrams = Number(formData.get('filamentWeightGrams') ?? 0);
  const estimatedPrintHours = Number(formData.get('estimatedPrintHours') ?? 0);
  const estimatedPowerCost = Number(formData.get('estimatedPowerCost') ?? 0);
  const estimatedPackagingCost = Number(formData.get('estimatedPackagingCost') ?? 0);

  return updateProductCost(productId, {
    filamentWeightGrams,
    estimatedPrintHours,
    estimatedPowerCost,
    estimatedPackagingCost
  });
}

/**
 * Get profitability report
 */
export async function getProfitabilityReportAction(days: number = 30) {
  await requireAdmin();
  return getProfitabilityReport(days);
}
