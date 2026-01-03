-- Create user role enum
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Create form status enum
CREATE TYPE form_status AS ENUM ('draft', 'published', 'archived');

-- Create field type enum
CREATE TYPE field_type AS ENUM (
  'text',
  'email',
  'number',
  'textarea',
  'dropdown',
  'checkbox',
  'radio',
  'date',
  'file'
);

-- Create submission status enum
CREATE TYPE submission_status AS ENUM ('pending', 'processed', 'failed');

-- Create team member role enum
CREATE TYPE team_member_role AS ENUM ('owner', 'admin', 'editor', 'viewer');

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  username text UNIQUE,
  role user_role NOT NULL DEFAULT 'user',
  is_premium boolean DEFAULT false,
  upgrade_requested boolean DEFAULT false,
  payment_method text,
  transaction_id text,
  amount decimal(10, 2),
  payment_details jsonb DEFAULT '{}'::jsonb,
  payment_proof_url text,
  full_name text,
  subscription_start_date timestamptz,
  subscription_end_date timestamptz,
  subscription_status text CHECK (subscription_status IN ('active', 'expired', 'cancelled')),
  subscription_amount decimal(10, 2) DEFAULT 20.00,
  bonus_forms integer DEFAULT 0,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Comments for profiles
COMMENT ON COLUMN profiles.payment_details IS 'Stores method-specific data like registered mobile number, email, etc.';
COMMENT ON COLUMN profiles.subscription_start_date IS 'When the current subscription period started';
COMMENT ON COLUMN profiles.subscription_end_date IS 'When the current subscription period ends (30 days from start)';
COMMENT ON COLUMN profiles.subscription_status IS 'Current subscription status: active, expired, or cancelled';
COMMENT ON COLUMN profiles.subscription_amount IS 'Monthly subscription amount (fixed at $20.00)';
COMMENT ON COLUMN profiles.bonus_forms IS 'One-time bonus forms awarded for early subscription renewal';

-- Create teams table
CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logo_url text,
  brand_color text DEFAULT '#4A90E2',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create team_members table
CREATE TABLE team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role team_member_role NOT NULL DEFAULT 'viewer',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create forms table
CREATE TABLE forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status form_status NOT NULL DEFAULT 'draft',
  settings jsonb DEFAULT '{}',
  branding jsonb DEFAULT '{}',
  is_template boolean DEFAULT false,
  template_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create form_fields table
CREATE TABLE form_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  field_type field_type NOT NULL,
  label text NOT NULL,
  placeholder text,
  help_text text,
  required boolean DEFAULT false,
  options jsonb,
  validation jsonb,
  conditional_logic jsonb,
  position integer NOT NULL,
  col_span integer DEFAULT 4,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add description for col_span
COMMENT ON COLUMN form_fields.col_span IS 'Grid column span (1-4) for layout control';

-- Create submissions table
CREATE TABLE submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  data jsonb NOT NULL,
  status submission_status NOT NULL DEFAULT 'pending',
  ip_address text,
  user_agent text,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

-- Create email_configs table
CREATE TABLE email_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  enabled boolean DEFAULT false,
  recipients text[] NOT NULL,
  subject text NOT NULL,
  body_template text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(form_id)
);

-- Create webhooks table
CREATE TABLE webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  url text NOT NULL,
  enabled boolean DEFAULT true,
  secret text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_forms_team_id ON forms(team_id);
CREATE INDEX idx_forms_created_by ON forms(created_by);
CREATE INDEX idx_forms_status ON forms(status);
CREATE INDEX idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX idx_form_fields_position ON form_fields(form_id, position);
CREATE INDEX idx_submissions_form_id ON submissions(form_id);
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- Create indexes for premium features
CREATE INDEX IF NOT EXISTS idx_profiles_upgrade_requested ON profiles(upgrade_requested);
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium);
CREATE INDEX IF NOT EXISTS idx_profiles_transaction_id ON profiles(transaction_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_end_date ON profiles(subscription_end_date);

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;

-- Create helper function to check team membership
CREATE OR REPLACE FUNCTION is_team_member(uid uuid, tid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.user_id = uid AND tm.team_id = tid
  );
$$;

-- Create helper function to check form access
CREATE OR REPLACE FUNCTION can_access_form(uid uuid, fid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM forms f
    LEFT JOIN team_members tm ON f.team_id = tm.team_id
    WHERE f.id = fid AND (f.created_by = uid OR tm.user_id = uid)
  );
$$;

-- Create function to handle new user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  INSERT INTO profiles (id, email, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'user'::user_role END
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

-- Teams policies
CREATE POLICY "Users can view teams they are members of" ON teams
  FOR SELECT TO authenticated USING (
    owner_id = auth.uid() OR is_team_member(auth.uid(), id)
  );

CREATE POLICY "Users can create teams" ON teams
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Team owners can update their teams" ON teams
  FOR UPDATE TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Team owners can delete their teams" ON teams
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- Team members policies
CREATE POLICY "Users can view team members of their teams" ON team_members
  FOR SELECT TO authenticated USING (is_team_member(auth.uid(), team_id));

CREATE POLICY "Team owners can manage team members" ON team_members
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM teams WHERE id = team_id AND owner_id = auth.uid())
  );

-- Forms policies
CREATE POLICY "Users can view forms they have access to" ON forms
  FOR SELECT TO authenticated USING (
    created_by = auth.uid() OR 
    (team_id IS NOT NULL AND is_team_member(auth.uid(), team_id))
  );

CREATE POLICY "Public can view published forms" ON forms
  FOR SELECT TO anon USING (status = 'published');

CREATE POLICY "Users can create forms" ON forms
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own forms" ON forms
  FOR UPDATE TO authenticated USING (can_access_form(auth.uid(), id));

CREATE POLICY "Users can delete their own forms" ON forms
  FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Form fields policies
CREATE POLICY "Users can view fields of accessible forms" ON form_fields
  FOR SELECT TO authenticated USING (can_access_form(auth.uid(), form_id));

CREATE POLICY "Public can view fields of published forms" ON form_fields
  FOR SELECT TO anon USING (
    EXISTS (SELECT 1 FROM forms WHERE id = form_id AND status = 'published')
  );

CREATE POLICY "Users can manage fields of accessible forms" ON form_fields
  FOR ALL TO authenticated USING (can_access_form(auth.uid(), form_id));

-- Submissions policies
CREATE POLICY "Users can view submissions of their forms" ON submissions
  FOR SELECT TO authenticated USING (can_access_form(auth.uid(), form_id));

CREATE POLICY "Anyone can submit to published forms" ON submissions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM forms WHERE id = form_id AND status = 'published')
  );

-- Email configs policies
CREATE POLICY "Users can manage email configs of their forms" ON email_configs
  FOR ALL TO authenticated USING (can_access_form(auth.uid(), form_id));

-- Webhooks policies
CREATE POLICY "Users can manage webhooks of their forms" ON webhooks
  FOR ALL TO authenticated USING (can_access_form(auth.uid(), form_id));

-- Create public profiles view
CREATE OR REPLACE VIEW public_profiles AS
  SELECT id, username, avatar_url, role FROM profiles;

-- Create storage setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'uploads' );

CREATE POLICY "Authenticated Users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'uploads' AND auth.role() = 'authenticated' );
  
CREATE POLICY "Public Uploads"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'uploads' );
