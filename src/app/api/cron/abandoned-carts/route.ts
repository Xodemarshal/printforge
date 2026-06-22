import { markAbandonedCarts } from '@/services/cart';
import { retryFailedEmails } from '@/services/email';

/**
 * Cron job to mark abandoned carts and send recovery emails
 * Should run every hour
 * 
 * For Vercel Cron, add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/abandoned-carts",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 * 
 * For external cron, call with:
 * Authorization: Bearer {CRON_SECRET}
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

    console.log('Running abandoned carts cron job...');

    // Mark abandoned carts and send recovery emails
    const cartResult = await markAbandonedCarts();
    console.log('Cart result:', cartResult);

    // Retry failed emails
    const emailResult = await retryFailedEmails();
    console.log('Email result:', emailResult);

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: {
        carts: cartResult,
        emails: emailResult
      }
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
