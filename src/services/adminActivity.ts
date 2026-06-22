import { createAdminClient } from '@/lib/supabase/admin';

interface LogActivityOptions {
  adminId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log admin activity
 */
export async function logAdminActivity(options: LogActivityOptions) {
  const supabase = createAdminClient();

  try {
    const { error } = await supabase
      .from('admin_activity_logs')
      .insert({
        admin_id: options.adminId,
        action: options.action,
        entity_type: options.entityType,
        entity_id: options.entityId || null,
        metadata: options.metadata || {},
        ip_address: options.ipAddress || null,
        user_agent: options.userAgent || null
      });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Log admin activity error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get admin activity logs
 */
export async function getAdminActivityLogs(
  filters?: {
    adminId?: string;
    entityType?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }
) {
  const supabase = createAdminClient();

  try {
    let query = supabase
      .from('admin_activity_logs')
      .select('*, users!admin_id(name, email)')
      .order('created_at', { ascending: false });

    if (filters?.adminId) {
      query = query.eq('admin_id', filters.adminId);
    }

    if (filters?.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Get admin activity logs error:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Search admin activity logs
 */
export async function searchAdminActivityLogs(searchTerm: string) {
  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase
      .from('admin_activity_logs')
      .select('*, users!admin_id(name, email)')
      .or(`action.ilike.%${searchTerm}%,entity_type.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Search admin activity logs error:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Get activity stats
 */
export async function getActivityStats(days: number = 30) {
  const supabase = createAdminClient();

  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('admin_activity_logs')
      .select('action, admin_id, created_at')
      .gte('created_at', startDate);

    if (error) throw error;

    const logs = data || [];

    // Count by action
    const actionCounts: Record<string, number> = {};
    logs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });

    // Count by admin
    const adminCounts: Record<string, number> = {};
    logs.forEach(log => {
      adminCounts[log.admin_id] = (adminCounts[log.admin_id] || 0) + 1;
    });

    // Daily activity
    const dailyCounts: Record<string, number> = {};
    logs.forEach(log => {
      const date = log.created_at.split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    return {
      success: true,
      totalActivities: logs.length,
      actionCounts,
      adminCounts,
      dailyCounts
    };
  } catch (error: any) {
    console.error('Get activity stats error:', error);
    return { success: false, error: error.message };
  }
}
