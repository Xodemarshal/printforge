import type { PreOrderRow } from "@/types";

/**
 * Resolve the final locked preorder price.
 * Priority: explicit preorder_price > discount_percentage calculation.
 * This is a pure utility — NOT a server action.
 */
export function resolvePreorderPrice(preorder: PreOrderRow): {
  lockedPrice: number;
  discountPercentage: number;
  savedAmount: number;
} {
  const productPrice = preorder.products?.price || 0;
  const discountPct = Number(preorder.discount_percentage || 0);

  if (preorder.preorder_price != null && preorder.preorder_price > 0) {
    const savedAmount = Math.max(
      0,
      Math.round((productPrice - preorder.preorder_price) * 100) / 100
    );
    const effectiveDiscountPct =
      productPrice > 0
        ? Math.round(
            ((productPrice - preorder.preorder_price) / productPrice) * 10000
          ) / 100
        : 0;
    return {
      lockedPrice: preorder.preorder_price,
      discountPercentage: effectiveDiscountPct,
      savedAmount
    };
  }

  const discountAmount = (productPrice * discountPct) / 100;
  const lockedPrice = Math.round((productPrice - discountAmount) * 100) / 100;
  return {
    lockedPrice,
    discountPercentage: discountPct,
    savedAmount: Math.round(discountAmount * 100) / 100
  };
}
