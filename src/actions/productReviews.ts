'use server';

import { requireAdmin, requireUser } from '@/lib/guards';
import {
  requestReview,
  submitReview,
  approveReview
} from '@/services/reviews';

/**
 * Submit a product review
 */
export async function submitProductReviewAction(formData: FormData) {
  const user = await requireUser();

  const productId = String(formData.get('productId') ?? '');
  const orderId = String(formData.get('orderId') ?? '');
  const rating = Number(formData.get('rating') ?? 0);
  const reviewText = String(formData.get('reviewText') ?? '');

  if (!productId || !orderId || rating < 1 || rating > 5) {
    return { success: false, error: 'Invalid review data' };
  }

  return submitReview(user.id, productId, orderId, rating, reviewText);
}

/**
 * Request review from customer (admin action)
 */
export async function requestReviewAction(orderId: string) {
  await requireAdmin();
  return requestReview(orderId);
}

/**
 * Approve a product review (admin action)
 */
export async function approveProductReviewAction(reviewId: string) {
  await requireAdmin();
  return approveReview(reviewId);
}
