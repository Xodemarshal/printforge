import { createAdminClient } from '@/lib/supabase/admin';

interface CreateAlertOptions {
  alertType: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

/**
 * Create admin alert
 */
export async function createAdminAlert(options: CreateAlertOptions) {
  const supabase = createAdminClient();

  try {
    const { error } = await supabase
      .from('admin_alerts')
      .insert({
        alert_type: options.alertType,
        severity: options.severity,
        title: options.title,
        message: options.message,
        entity_type: options.entityType || null,
        entity_id: options.entityId || null,
        metadata: options.metadata || {}
      });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Create alert error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark alert as read
 */
export async function markAlertAsRead(alertId: string) {
  const supabase = createAdminClient();

  try {
    const { error } = await supabase
      .from('admin_alerts')
      .update({ status: 'read' })
      .eq('id', alertId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Mark alert as read error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Resolve alert
 */
export async function resolveAlert(alertId: string, resolvedBy: string) {
  const supabase = createAdminClient();

  try {
    const { error } = await supabase
      .from('admin_alerts')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy
      })
      .eq('id', alertId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Resolve alert error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get unread alerts count
 */
export async function getUnreadAlertsCount() {
  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from('admin_alerts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'unread');

  if (error) {
    console.error('Get unread alerts count error:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Check for alert conditions and create alerts
 */
export async function checkAlertConditions() {
  const supabase = createAdminClient();

  // Check for failed payments in last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: failedPayments } = await supabase
    .from('orders')
    .select('id, customer_email')
    .eq('payment_status', 'failed')
    .gte('created_at', oneHourAgo);

  if (failedPayments && failedPayments.length > 0) {
    await createAdminAlert({
      alertType: 'payment_failed',
      severity: 'warning',
      title: `${failedPayments.length} Failed Payments`,
      message: `${failedPayments.length} payment(s) failed in the last hour`,
      metadata: { count: failedPayments.length }
    });
  }

  // Check for abandoned cart spike
  const { data: recentAbandoned } = await supabase
    .from('cart_sessions')
    .select('id')
    .eq('abandoned', true)
    .gte('created_at', oneHourAgo);

  if (recentAbandoned && recentAbandoned.length > 10) {
    await createAdminAlert({
      alertType: 'abandoned_cart_spike',
      severity: 'warning',
      title: 'Abandoned Cart Spike',
      message: `${recentAbandoned.length} carts abandoned in the last hour`,
      metadata: { count: recentAbandoned.length }
    });
  }

  // Check for high value orders
  const { data: highValueOrders } = await supabase
    .from('orders')
    .select('id, total_amount, customer_name')
    .gte('total_amount', 10000)
    .gte('created_at', oneHourAgo);

  for (const order of highValueOrders || []) {
    await createAdminAlert({
      alertType: 'high_value_order',
      severity: 'info',
      title: 'High Value Order',
      message: `New order from ${order.customer_name} worth ₹${order.total_amount}`,
      entityType: 'order',
      entityId: order.id,
      metadata: { amount: order.total_amount }
    });
  }

  return { success: true };
}
