'use server';

import { requireAdmin } from '@/lib/guards';
import {
  calculateBusinessHealth,
  getLatestBusinessHealth,
  getBusinessHealthTrend
} from '@/services/businessHealth';

/**
 * Calculate current business health score
 */
export async function calculateBusinessHealthAction() {
  await requireAdmin();
  return calculateBusinessHealth();
}

/**
 * Get latest business health snapshot
 */
export async function getLatestBusinessHealthAction() {
  await requireAdmin();
  return getLatestBusinessHealth();
}

/**
 * Get business health trend over time
 */
export async function getBusinessHealthTrendAction(days: number = 30) {
  await requireAdmin();
  return getBusinessHealthTrend(days);
}
