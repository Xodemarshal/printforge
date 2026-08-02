-- Migration 013: Fix Numeric Field Overflow in Trigger calculate_and_sync_profit() & Orders Table

-- 1. Alter order table columns to allow higher precision
ALTER TABLE public.orders 
  ALTER COLUMN profit_margin TYPE NUMERIC(10,2),
  ALTER COLUMN profit_amount TYPE NUMERIC(12,2),
  ALTER COLUMN total_cost TYPE NUMERIC(12,2),
  ALTER COLUMN material_cost TYPE NUMERIC(12,2),
  ALTER COLUMN print_cost TYPE NUMERIC(12,2),
  ALTER COLUMN packaging_cost TYPE NUMERIC(12,2),
  ALTER COLUMN shipping_cost TYPE NUMERIC(12,2);

ALTER TABLE public.products 
  ALTER COLUMN estimated_print_hours TYPE NUMERIC(10,2),
  ALTER COLUMN estimated_power_cost TYPE NUMERIC(12,2),
  ALTER COLUMN estimated_packaging_cost TYPE NUMERIC(12,2),
  ALTER COLUMN estimated_total_cost TYPE NUMERIC(12,2);

ALTER TABLE public.print_jobs 
  ALTER COLUMN actual_print_hours TYPE NUMERIC(10,2);

-- 2. Update/Replace PL/pgSQL function calculate_and_sync_profit() to safely clamp values and prevent overflow
CREATE OR REPLACE FUNCTION public.calculate_and_sync_profit()
RETURNS TRIGGER AS $$
DECLARE
  v_total_cost NUMERIC(12,2) := 0;
  v_profit_amount NUMERIC(12,2) := 0;
  v_profit_margin NUMERIC(10,2) := 0;
  v_raw_margin NUMERIC;
BEGIN
  -- Calculate total item cost from order items and product estimated costs
  SELECT COALESCE(SUM(COALESCE(p.estimated_total_cost, 0) * oi.quantity), 0)
  INTO v_total_cost
  FROM public.order_items oi
  LEFT JOIN public.products p ON p.id = oi.product_id
  WHERE oi.order_id = NEW.id;

  -- Add order shipping cost if applicable
  v_total_cost := v_total_cost + COALESCE(NEW.shipping_cost, 0);
  v_profit_amount := COALESCE(NEW.total_amount, 0) - v_total_cost;

  IF COALESCE(NEW.total_amount, 0) > 0 THEN
    v_raw_margin := (v_profit_amount / NEW.total_amount) * 100;
    -- Clamp margin safely so it never overflows
    v_profit_margin := GREATEST(-9999.99, LEAST(9999.99, v_raw_margin));
  ELSE
    v_profit_margin := 0;
  END IF;

  NEW.total_cost := v_total_cost;
  NEW.profit_amount := v_profit_amount;
  NEW.profit_margin := v_profit_margin;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
