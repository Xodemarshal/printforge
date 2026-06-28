'use server';

import { requireAdmin } from '@/lib/guards';
import {
  logAdminActivity,
  getAdminActivityLogs,
  searchAdminActivityLogs,
  getActivityStats
} from '@/services/adminActivity';
import { headers } from 'next/headers';

/**
 * Log an admin activity
 */
export async function logAdminActivityAction(
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, any>
) {
  const user = await requireAdmin();
  const headersList = await headers();
  
  const ipAddress = headersList.get('x-forwarded-for') || 
                    headersList.get('x-real-ip')  || undefined ;
  const userAgent = headersList.get('user-agent') ||   undefined;

  return logAdminActivity({
    adminId: user.id,
    action,
    entityType,
    entityId,
    metadata,
    ipAddress,
    userAgent
  });
}

/**
 * Get admin activity logs with filters
 */
export async function getAdminActivityLogsAction(filters?: {
  adminId?: string;
  entityType?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  await requireAdmin();
  return getAdminActivityLogs(filters);
}

/**
 * Search admin activity logs
 */
export async function searchAdminActivityLogsAction(searchTerm: string) {
  await requireAdmin();
  return searchAdminActivityLogs(searchTerm);
}

/**
 * Get activity statistics
 */
export async function getActivityStatsAction(days: number = 30) {
  await requireAdmin();
  return getActivityStats(days);
}
