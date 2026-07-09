-- Global Shipping Settings Migration
-- Adds a table for global application settings including shipping mode

-- Create application_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS application_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add shipping_mode setting (default to 'AUTOMATIC')
INSERT INTO application_settings (key, value, description) 
VALUES ('shipping_mode', 'AUTOMATIC', 'Global shipping mode: AUTOMATIC (Shiprocket) or MANUAL')
ON CONFLICT (key) DO NOTHING;

-- Add RLS policies
ALTER TABLE application_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read and write settings
CREATE POLICY "Admins can read settings" ON application_settings
  FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Admins can update settings" ON application_settings
  FOR UPDATE USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Admins can insert settings" ON application_settings
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Remove shipping_mode column from orders table (if it exists)
-- Note: This is kept for backward compatibility but won't be used in new design
-- We'll keep the column but use global setting instead

-- Create function to get shipping mode
CREATE OR REPLACE FUNCTION get_shipping_mode()
RETURNS VARCHAR AS $$
DECLARE
  mode_value VARCHAR;
BEGIN
  SELECT value INTO mode_value FROM application_settings WHERE key = 'shipping_mode';
  RETURN COALESCE(mode_value, 'AUTOMATIC');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
