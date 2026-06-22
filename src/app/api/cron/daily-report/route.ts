import { sendDailyReportEmail } from '@/services/reports';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Daily report cron job
 * 
 * For Vercel Cron, add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/daily-report",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 */
export async function GET(request: Request) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expectedAuth) {
      console.error('Unauthorized cron attempt');
      return new Response('Unauthorized', { status: 401 });
    }

    console.log('Running daily report cron job...');

    // Get all enabled daily report subscriptions
    const supabase = createAdminClient();
    const { data: subscriptions } = await supabase
      .from('scheduled_reports')
      .select('*')
      .eq('report_type', 'daily')
      .eq('enabled', true);

    let sentCount = 0;
    const errors: string[] = [];

    for (const subscription of subscriptions || []) {
      try {
        await sendDailyReportEmail(subscription.recipient_email);
        
        await supabase
          .from('scheduled_reports')
          .update({ last_sent_at: new Date().toISOString() })
          .eq('id', subscription.id);
        
        sentCount++;
      } catch (error: any) {
        console.error(`Failed to send report to ${subscription.recipient_email}:`, error);
        errors.push(`${subscription.recipient_email}: ${error.message}`);
      }
    }

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      sentCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('Daily report cron error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
