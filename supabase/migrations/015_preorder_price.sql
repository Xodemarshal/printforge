-- Migration 015: Add fixed preorder_price to preorders table
-- When preorder_price is set directly, it takes priority over discount_percentage calculation.

ALTER TABLE public.preorders
  ADD COLUMN IF NOT EXISTS preorder_price NUMERIC(10,2) DEFAULT NULL;

COMMENT ON COLUMN public.preorders.preorder_price IS
  'Optional fixed preorder price. When set, overrides the discount_percentage calculation. '
  'If NULL, price is calculated as: product_price - (product_price * discount_percentage / 100).';
