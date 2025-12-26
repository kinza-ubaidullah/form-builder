-- Add subscription tracking fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_start_date timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_end_date timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status text CHECK (subscription_status IN ('active', 'expired', 'cancelled'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_amount decimal(10, 2) DEFAULT 20.00;

-- Create indexes for efficient subscription queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_end_date ON profiles(subscription_end_date);

-- Add comment explaining subscription model
COMMENT ON COLUMN profiles.subscription_start_date IS 'When the current subscription period started';
COMMENT ON COLUMN profiles.subscription_end_date IS 'When the current subscription period ends (30 days from start)';
COMMENT ON COLUMN profiles.subscription_status IS 'Current subscription status: active, expired, or cancelled';
COMMENT ON COLUMN profiles.subscription_amount IS 'Monthly subscription amount (fixed at $20.00)';
