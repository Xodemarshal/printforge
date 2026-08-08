-- Migration 017: Add dimensions field to products
-- Stores product physical dimensions as a free-text string (e.g. "12 x 8 x 5 cm")

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS dimensions TEXT;

COMMENT ON COLUMN public.products.dimensions IS
  'Physical dimensions of the product, e.g. "12 x 8 x 5 cm" or "L: 12cm, W: 8cm, H: 5cm"';
