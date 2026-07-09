-- Global Shipping Settings Migration
-- Updates public.settings table with shipping mode configuration

-- Add shipping_mode setting to public.settings table (default to 'AUTOMATIC')
-- Note: value column is jsonb, so we need to store as JSON string
INSERT INTO public.settings (key, value) 
VALUES ('shipping_mode', '"AUTOMATIC"'::jsonb)
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, updated_at = NOW();