-- Add bonus_forms column to profiles table to track early renewal rewards
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bonus_forms integer DEFAULT 0;

COMMENT ON COLUMN profiles.bonus_forms IS 'One-time bonus forms awarded for early subscription renewal';
