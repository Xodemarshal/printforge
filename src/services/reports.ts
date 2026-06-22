import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from './email';

/**
 * Generate daily report
 */
export async function generateDailyReport() {
  const supabase = createAdminClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get today's data
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('payment_status', 'paid')
    .gte('created_at', today.toISOString());

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .gte('created_at', today.toISOString());

  const { data: events } = await supabase
    .from('analytics_events')
    .select('*')
    .gte('created_at', today.toISOString());

  const revenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
  const profit = orders?.reduce((sum, o) => sum + Number(o.profit_amount || 0), 0) || 0;
  const orderCount = orders?.length || 0;
  const leadCount = leads?.length || 0;

  const views = events?.filter(e => e.event_name === 'product_view').length || 0;
  const purchases = events?.filter(e => e.event_name === 'payment_success').length || 0;
  const conversionRate = views > 0 ? ((purchases / views) * 100).toFixed(2) : '0';

  return {
    date: today.toISOString().split('T')[0],
    revenue,
    profit,
    orderCount,
    leadCount,
    conversionRate,
    views,
    purchases
  };
}

/**
 * Generate weekly report
 */
export async function generateWeeklyReport() {
  const supabase = createAdminClient();

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Revenue trend
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('payment_status', 'paid')
    .gte('created_at', weekAgo.toISOString());

  const revenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
  const profit = orders?.reduce((sum, o) => sum + Number(o.profit_amount || 0), 0) || 0;

  // Best products
  const { data: productPerformance } = await supabase
    .rpc('get_product_performance', { days: 7 });

  const bestProducts = productPerformance
    ?.sort((a: any, b: any) => Number(b.revenue) - Number(a.revenue))
    .slice(0, 5) || [];

  const worstProducts = productPerformance
    ?.sort((a: any, b: any) => Number(a.conversion_rate) - Number(b.conversion_rate))
    .slice(0, 5) || [];

  // Customer growth
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .gte('created_at', weekAgo.toISOString());

  const newCustomers = customers?.length || 0;

  // Cart recovery
  const { data: carts } = await supabase
    .from('cart_sessions')
    .select('*')
    .eq('abandoned', true)
    .gte('created_at', weekAgo.toISOString());

  const recoveredCarts = carts?.filter(c => c.recovered).length || 0;
  const recoveryRate = carts && carts.length > 0
    ? ((recoveredCarts / carts.length) * 100).toFixed(1)
    : '0';

  return {
    weekStart: weekAgo.toISOString().split('T')[0],
    weekEnd: new Date().toISOString().split('T')[0],
    revenue,
    profit,
    orderCount: orders?.length || 0,
    newCustomers,
    recoveryRate,
    bestProducts: bestProducts.map((p: any) => ({
      name: p.product_name,
      revenue: p.revenue
    })),
    worstProducts: worstProducts.map((p: any) => ({
      name: p.product_name,
      conversionRate: p.conversion_rate
    }))
  };
}

/**
 * Send daily report email
 */
export async function sendDailyReportEmail(recipientEmail: string) {
  const report = await generateDailyReport();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Daily Report</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #4F46E5; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">Daily Business Report</h1>
    <p style="margin: 5px 0 0 0;">${report.date}</p>
  </div>
  
  <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
    <h2 style="color: #4F46E5; margin-top: 0;">Today's Performance</h2>
    
    <table style="width: 100%; border-collapse: collapse;">
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 0;"><strong>Revenue</strong></td>
        <td style="padding: 12px 0; text-align: right; color: #10b981; font-size: 18px; font-weight: bold;">
          ₹${report.revenue.toFixed(2)}
        </td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 0;"><strong>Profit</strong></td>
        <td style="padding: 12px 0; text-align: right; font-size: 18px; font-weight: bold;">
          ₹${report.profit.toFixed(2)}
        </td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 0;"><strong>Orders</strong></td>
        <td style="padding: 12px 0; text-align: right;">${report.orderCount}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 0;"><strong>Leads</strong></td>
        <td style="padding: 12px 0; text-align: right;">${report.leadCount}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 0;"><strong>Conversion Rate</strong></td>
        <td style="padding: 12px 0; text-align: right;">${report.conversionRate}%</td>
      </tr>
      <tr>
        <td style="padding: 12px 0;"><strong>Product Views</strong></td>
        <td style="padding: 12px 0; text-align: right;">${report.views}</td>
      </tr>
    </table>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/analytics" 
         style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
        View Full Dashboard
      </a>
    </div>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} PrintForge. All rights reserved.</p>
  </div>
</body>
</html>
  `;

  await sendEmail('daily_report', {
    to: recipientEmail,
    subject: `Daily Report - ${report.date}`,
    html
  });

  // Store report
  const supabase = createAdminClient();
  await supabase.from('report_history').insert({
    report_type: 'daily',
    recipient_email: recipientEmail,
    report_data: report
  });

  return { success: true };
}

/**
 * Send weekly report email
 */
export async function sendWeeklyReportEmail(recipientEmail: string) {
  const report = await generateWeeklyReport();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Weekly Report</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #4F46E5; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">Weekly Business Report</h1>
    <p style="margin: 5px 0 0 0;">${report.weekStart} to ${report.weekEnd}</p>
  </div>
  
  <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
    <h2 style="color: #4F46E5;">Week Summary</h2>
    
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 0;"><strong>Revenue</strong></td>
        <td style="padding: 12px 0; text-align: right; color: #10b981; font-size: 18px; font-weight: bold;">
          ₹${report.revenue.toFixed(2)}
        </td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 0;"><strong>Profit</strong></td>
        <td style="padding: 12px 0; text-align: right; font-size: 18px; font-weight: bold;">
          ₹${report.profit.toFixed(2)}
        </td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 0;"><strong>Orders</strong></td>
        <td style="padding: 12px 0; text-align: right;">${report.orderCount}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 0;"><strong>New Customers</strong></td>
        <td style="padding: 12px 0; text-align: right;">${report.newCustomers}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0;"><strong>Cart Recovery Rate</strong></td>
        <td style="padding: 12px 0; text-align: right;">${report.recoveryRate}%</td>
      </tr>
    </table>
    
    <h3 style="color: #4F46E5;">Top Performing Products</h3>
    <ol style="padding-left: 20px;">
      ${report.bestProducts.map(p => `<li>${p.name} - ₹${Number(p.revenue).toFixed(2)}</li>`).join('')}
    </ol>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/analytics" 
         style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
        View Full Dashboard
      </a>
    </div>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} PrintForge. All rights reserved.</p>
  </div>
</body>
</html>
  `;

  await sendEmail('weekly_report', {
    to: recipientEmail,
    subject: `Weekly Report - ${report.weekStart} to ${report.weekEnd}`,
    html
  });

  // Store report
  const supabase = createAdminClient();
  await supabase.from('report_history').insert({
    report_type: 'weekly',
    recipient_email: recipientEmail,
    report_data: report
  });

  return { success: true };
}
