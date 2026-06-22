import { createAdminClient } from '@/lib/supabase/admin';
import { createAdminAlert } from './alerts';

/**
 * Start a print job
 */
export async function startPrintJob(orderId: string, printerName: string) {
  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase
      .from('print_jobs')
      .insert({
        order_id: orderId,
        printer_name: printerName,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, printJobId: data.id };
  } catch (error: any) {
    console.error('Start print job error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Complete a print job
 */
export async function completePrintJob(
  printJobId: string,
  actualPrintHours: number,
  filamentUsedGrams: number
) {
  const supabase = createAdminClient();

  try {
    const { error } = await supabase
      .from('print_jobs')
      .update({
        completed_at: new Date().toISOString(),
        actual_print_hours: actualPrintHours,
        filament_used_grams: filamentUsedGrams,
        updated_at: new Date().toISOString()
      })
      .eq('id', printJobId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Complete print job error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Fail a print job
 */
export async function failPrintJob(printJobId: string, failureReason: string) {
  const supabase = createAdminClient();

  try {
    const { data: printJob } = await supabase
      .from('print_jobs')
      .select('*, orders(id)')
      .eq('id', printJobId)
      .single();

    const { error } = await supabase
      .from('print_jobs')
      .update({
        failed: true,
        failure_reason: failureReason,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', printJobId);

    if (error) throw error;

    // Create alert
    await createAdminAlert({
      alertType: 'print_failure',
      severity: 'critical',
      title: 'Print Job Failed',
      message: `Print job failed: ${failureReason}`,
      entityType: 'print_job',
      entityId: printJobId,
      metadata: { orderId: printJob?.orders?.id }
    });

    return { success: true };
  } catch (error: any) {
    console.error('Fail print job error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get active print jobs
 */
export async function getActivePrintJobs() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('print_jobs')
    .select('*, orders(id, customer_name)')
    .is('completed_at', null)
    .eq('failed', false)
    .order('started_at', { ascending: false });

  if (error) {
    console.error('Get active print jobs error:', error);
    return [];
  }

  return data || [];
}

/**
 * Get print farm statistics
 */
export async function getPrintFarmStats(days: number = 30) {
  const supabase = createAdminClient();

  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data: jobs } = await supabase
      .from('print_jobs')
      .select('*')
      .gte('created_at', startDate);

    if (!jobs) return null;

    const totalJobs = jobs.length;
    const completedJobs = jobs.filter(j => j.completed_at && !j.failed).length;
    const failedJobs = jobs.filter(j => j.failed).length;
    const successRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

    const avgPrintHours = jobs
      .filter(j => j.actual_print_hours)
      .reduce((sum, j) => sum + Number(j.actual_print_hours), 0) / (completedJobs || 1);

    const totalFilamentUsed = jobs
      .filter(j => j.filament_used_grams)
      .reduce((sum, j) => sum + Number(j.filament_used_grams), 0);

    return {
      totalJobs,
      completedJobs,
      failedJobs,
      successRate,
      avgPrintHours,
      totalFilamentUsed
    };
  } catch (error: any) {
    console.error('Get print farm stats error:', error);
    return null;
  }
}
