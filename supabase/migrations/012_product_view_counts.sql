-- Add persistent product view counters

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_products_view_count
ON public.products(view_count DESC, created_at DESC);

CREATE OR REPLACE FUNCTION public.increment_product_view_count(product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.products
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = product_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_product_view_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_product_view_count(uuid) TO anon;
