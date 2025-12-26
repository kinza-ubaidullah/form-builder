-- Extend payment tracking with granular fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS amount decimal(10, 2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_details jsonb DEFAULT '{}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_proof_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name text;

-- Add comment explaining payment_details structure
COMMENT ON COLUMN profiles.payment_details IS 'Stores method-specific data like registered mobile number, email, etc.';
