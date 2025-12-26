-- Add payment tracking fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS transaction_id text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_transaction_id ON profiles(transaction_id);
