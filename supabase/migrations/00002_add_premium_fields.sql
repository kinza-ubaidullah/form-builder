-- Add premium fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS upgrade_requested boolean DEFAULT false;

-- Create index for faster filtering of upgrade requests
CREATE INDEX IF NOT EXISTS idx_profiles_upgrade_requested ON profiles(upgrade_requested);
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium);
