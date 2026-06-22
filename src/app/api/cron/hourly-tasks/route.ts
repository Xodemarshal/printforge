import { markAbandonedCarts } from '@/services/cart';
import { retryFailedEmails } from '@/services/email';
import { checkAlertConditions } from '@/services/alerts';
import { calculateBusinessHealth } from '@/services/businessHealth';

/**
 * Hourly cron job for all automated tasks
 * 
 * For Vercel Cron, add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/hourly-tasks",
 *     "schedule": "0 * * * *"
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

    console.log('Running hourly tasks cron job...');

    // Run all tasks
    const [cartResult, emailResult, alertResult, healthResult] = await Promise.allSettled([
      markAbandonedCarts(),
      retryFailedEmails(),
      checkAlertConditions(),
      calculateBusinessHealth()
    ]);

    const results = {
      carts: cartResult.status === 'fulfilled' ? cartResult.value : { error: 'Failed' },
      emails: emailResult.status === 'fulfilled' ? emailResult.value : { error: 'Failed' },
      alerts: alertResult.status === 'fulfilled' ? alertResult.value : { error: 'Failed' },
      health: healthResult.status === 'fulfilled' ? healthResult.value : { error: 'Failed' }
    };

    console.log('Hourly tasks completed:', results);

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
