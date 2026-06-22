import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  productName?: string;
  totalAmount?: number;
  trackingNumber?: string;
  trackingUrl?: string;
  orderStatus?: string;
}

/**
 * Send email with duplicate prevention and logging
 */
export async function sendEmail(
  templateName: string,
  options: EmailOptions,
  orderId?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  try {
    // Check for duplicate sends
    if (orderId) {
      const { data: existingLog } = await supabase
        .from('email_logs')
        .select('id')
        .eq('order_id', orderId)
        .eq('email', options.to)
        .eq('template_name', templateName)
        .eq('status', 'sent')
        .maybeSingle();

      if (existingLog) {
        console.log(`Email ${templateName} already sent to ${options.to} for order ${orderId}`);
        return { success: true };
      }
    }

    // Create log entry
    const { data: logEntry } = await supabase
      .from('email_logs')
      .insert({
        order_id: orderId || null,
        email: options.to,
        template_name: templateName,
        status: 'pending'
      })
      .select()
      .single();

    if (!logEntry) {
      throw new Error('Failed to create email log');
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'PrintForge <orders@printforge.co>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || stripHtml(options.html)
    });

    if (error) {
      // Update log with error
      await supabase
        .from('email_logs')
        .update({
          status: 'failed',
          error_message: error.message,
          updated_at: new Date().toISOString()
        })
        .eq('id', logEntry.id);

      return { success: false, error: error.message };
    }

    // Update log with success
    await supabase
      .from('email_logs')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', logEntry.id);

    return { success: true };
  } catch (error: any) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Retry failed emails
 */
export async function retryFailedEmails() {
  const supabase = createAdminClient();

  const { data: failedLogs } = await supabase
    .from('email_logs')
    .select('*')
    .eq('status', 'failed')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .limit(10);

  if (!failedLogs || failedLogs.length === 0) {
    return { success: true, retried: 0 };
  }

  let retriedCount = 0;

  for (const log of failedLogs) {
    // Mark as pending for retry
    await supabase
      .from('email_logs')
      .update({ status: 'pending' })
      .eq('id', log.id);

    retriedCount++;
  }

  return { success: true, retried: retriedCount };
}

/**
 * Strip HTML tags for plain text fallback
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Email Templates
 */

export function getOrderConfirmationEmail(data: OrderEmailData): EmailOptions {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #4F46E5; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">PrintForge</h1>
  </div>
  
  <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
    <h2 style="color: #4F46E5; margin-top: 0;">Order Confirmed! 🎉</h2>
    
    <p>Hi ${data.customerName},</p>
    
    <p>Thank you for your order! We've received your payment and are preparing your 3D printed items.</p>
    
    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Order Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Order ID:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">#${data.orderId.slice(0, 8)}</td>
        </tr>
        ${data.productName ? `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Product:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.productName}</td>
        </tr>
        ` : ''}
        ${data.totalAmount ? `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Total:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${data.totalAmount.toFixed(2)}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0;"><strong>Status:</strong></td>
          <td style="padding: 8px 0; text-align: right; color: #10b981;">${data.orderStatus || 'Confirmed'}</td>
        </tr>
      </table>
    </div>
    
    <p>We'll send you another email once your order starts printing.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderId}" 
         style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
        View Order
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      Need help? Contact us on WhatsApp at ${process.env.WHATSAPP_NUMBER || '+91-XXXXXXXXXX'}
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} PrintForge. All rights reserved.</p>
  </div>
</body>
</html>
  `;

  return {
    to: data.customerEmail,
    subject: `Order Confirmed - #${data.orderId.slice(0, 8)}`,
    html
  };
}

export function getPrintingStartedEmail(data: OrderEmailData): EmailOptions {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Printing Started</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #4F46E5; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">PrintForge</h1>
  </div>
  
  <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
    <h2 style="color: #4F46E5; margin-top: 0;">Your Print Job Has Started! 🖨️</h2>
    
    <p>Hi ${data.customerName},</p>
    
    <p>Great news! Your order is now being printed on our 3D printers.</p>
    
    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Order #${data.orderId.slice(0, 8)}</h3>
      <p style="margin: 0; color: #10b981; font-weight: bold;">Status: Printing</p>
    </div>
    
    <p>We'll notify you once printing is complete and your order is ready for shipment.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderId}" 
         style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
        Track Order
      </a>
    </div>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} PrintForge. All rights reserved.</p>
  </div>
</body>
</html>
  `;

  return {
    to: data.customerEmail,
    subject: `Printing Started - Order #${data.orderId.slice(0, 8)}`,
    html
  };
}

export function getShippedEmail(data: OrderEmailData): EmailOptions {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Shipped</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #4F46E5; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">PrintForge</h1>
  </div>
  
  <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
    <h2 style="color: #4F46E5; margin-top: 0;">Your Order is On Its Way! 📦</h2>
    
    <p>Hi ${data.customerName},</p>
    
    <p>Your order has been shipped and is on its way to you!</p>
    
    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Tracking Information</h3>
      ${data.trackingNumber ? `
      <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
      ` : ''}
      ${data.trackingUrl ? `
      <div style="margin: 20px 0;">
        <a href="${data.trackingUrl}" 
           style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Track Shipment
        </a>
      </div>
      ` : ''}
    </div>
    
    <p>Expected delivery: 3-5 business days</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderId}" 
         style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
        View Order Details
      </a>
    </div>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} PrintForge. All rights reserved.</p>
  </div>
</body>
</html>
  `;

  return {
    to: data.customerEmail,
    subject: `Order Shipped - #${data.orderId.slice(0, 8)}`,
    html
  };
}

export function getAbandonedCartEmail(data: {
  customerName: string;
  customerEmail: string;
  cartValue: number;
  cartItems: string[];
}): EmailOptions {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Cart is Waiting</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #4F46E5; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">PrintForge</h1>
  </div>
  
  <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
    <h2 style="color: #4F46E5; margin-top: 0;">You Left Something Behind! 🛒</h2>
    
    <p>Hi ${data.customerName},</p>
    
    <p>We noticed you left some items in your cart. Your custom 3D printed items are still waiting for you!</p>
    
    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Your Cart (₹${data.cartValue.toFixed(2)})</h3>
      <ul style="list-style: none; padding: 0;">
        ${data.cartItems.map(item => `<li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">• ${item}</li>`).join('')}
      </ul>
    </div>
    
    <p>Complete your order now and bring your designs to life!</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/checkout" 
         style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
        Complete Your Order
      </a>
    </div>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} PrintForge. All rights reserved.</p>
  </div>
</body>
</html>
  `;

  return {
    to: data.customerEmail,
    subject: 'Your cart is waiting for you!',
    html
  };
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const emailOptions = getOrderConfirmationEmail(data);
  return sendEmail('order_confirmation', emailOptions, data.orderId);
}

/**
 * Send printing started email
 */
export async function sendPrintingStartedEmail(data: OrderEmailData) {
  const emailOptions = getPrintingStartedEmail(data);
  return sendEmail('printing_started', emailOptions, data.orderId);
}

/**
 * Send shipped email
 */
export async function sendShippedEmail(data: OrderEmailData) {
  const emailOptions = getShippedEmail(data);
  return sendEmail('shipped', emailOptions, data.orderId);
}

/**
 * Send abandoned cart email
 */
export async function sendAbandonedCartEmail(data: {
  customerName: string;
  customerEmail: string;
  cartValue: number;
  cartItems: string[];
}) {
  const emailOptions = getAbandonedCartEmail(data);
  return sendEmail('abandoned_cart', emailOptions);
}
