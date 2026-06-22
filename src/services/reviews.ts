import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from './email';

/**
 * Request review from customer
 */
export async function requestReview(orderId: string) {
  const supabase = createAdminClient();

  try {
    const { data: order } = await supabase
      .from('orders')
      .select('*, order_items(*, products(id, name))')
      .eq('id', orderId)
      .single();

    if (!order || !order.customer_email) {
      return { success: false, error: 'Order or email not found' };
    }

    // Send review request email
    const products = (order.order_items as any[])
      .map((item: any) => item.products?.name)
      .filter(Boolean);

    await sendEmail('review_request', {
      to: order.customer_email,
      subject: 'How was your experience?',
      html: getReviewRequestEmail(order.customer_name, orderId, products),
      text: `Hi ${order.customer_name}, We'd love to hear about your experience with your recent order!`
    }, orderId);

    return { success: true };
  } catch (error: any) {
    console.error('Request review error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Submit product review
 */
export async function submitReview(
  userId: string,
  productId: string,
  orderId: string,
  rating: number,
  reviewText: string
) {
  const supabase = createAdminClient();

  try {
    // Get customer
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', user?.email)
      .maybeSingle();

    const { error } = await supabase
      .from('product_reviews')
      .insert({
        customer_id: customer?.id || null,
        user_id: userId,
        product_id: productId,
        order_id: orderId,
        rating,
        review_text: reviewText,
        approved: false // Needs admin approval
      });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Submit review error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Approve review
 */
export async function approveReview(reviewId: string) {
  const supabase = createAdminClient();

  try {
    const { error } = await supabase
      .from('product_reviews')
      .update({ approved: true })
      .eq('id', reviewId);

    if (error) throw error;

    // Update product rating
    const { data: review } = await supabase
      .from('product_reviews')
      .select('product_id')
      .eq('id', reviewId)
      .single();

    if (review) {
      await updateProductRating(review.product_id);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Approve review error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update product rating
 */
async function updateProductRating(productId: string) {
  const supabase = createAdminClient();

  const { data: reviews } = await supabase
    .from('product_reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('approved', true);

  if (reviews && reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const reviewCount = reviews.length;

    await supabase
      .from('products')
      .update({
        rating: avgRating,
        review_count: reviewCount
      })
      .eq('id', productId);
  }
}

/**
 * Get review request email HTML
 */
function getReviewRequestEmail(customerName: string, orderId: string, products: string[]) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Review Request</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #4F46E5; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">PrintForge</h1>
  </div>
  
  <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
    <h2 style="color: #4F46E5; margin-top: 0;">How was your experience?</h2>
    
    <p>Hi ${customerName},</p>
    
    <p>Thank you for your recent order! We hope you're enjoying your 3D printed items.</p>
    
    <p>We'd love to hear your feedback:</p>
    <ul>
      ${products.map(p => `<li>${p}</li>`).join('')}
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}/review" 
         style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
        Leave a Review
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      Your feedback helps us improve and helps other customers make informed decisions.
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} PrintForge. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}
