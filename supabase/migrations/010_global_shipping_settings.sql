-- Global Shipping Settings Migration
-- Updates site_settings JSON with shipping mode configuration

-- First, let's check if we have a site_settings entry
DO $$
DECLARE
  site_settings_exists BOOLEAN;
  current_settings JSONB;
  updated_settings JSONB;
BEGIN
  -- Check if site_settings exists
  SELECT EXISTS(SELECT 1 FROM public.settings WHERE key = 'site_settings') INTO site_settings_exists;
  
  IF site_settings_exists THEN
    -- Get current site_settings
    SELECT value INTO current_settings FROM public.settings WHERE key = 'site_settings';
    
    -- Ensure shippingMode is set to AUTOMATIC if not already present
    updated_settings = current_settings;
    
    IF updated_settings IS NULL THEN
      updated_settings = '{}'::jsonb;
    END IF;
    
    -- Add shippingMode if not present
    IF updated_settings->>'shippingMode' IS NULL THEN
      updated_settings = jsonb_set(updated_settings, '{shippingMode}', '"AUTOMATIC"');
    END IF;
    
    -- Update the settings
    UPDATE public.settings 
    SET value = updated_settings, updated_at = NOW()
    WHERE key = 'site_settings';
  ELSE
    -- Create site_settings with shippingMode
    INSERT INTO public.settings (key, value) 
    VALUES ('site_settings', '{"shippingMode": "AUTOMATIC"}'::jsonb);
  END IF;
END $$;