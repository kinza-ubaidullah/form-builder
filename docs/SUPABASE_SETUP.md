# Supabase Setup Guide

This project uses [Supabase](https://supabase.com/) for authentication and database.

## 1. Prerequisites

You need a Supabase project.
1.  Go to [database.new](https://database.new) to create a new project.
2.  Wait for the database to start.

## 2. Environment Variables

Get your project credentials from **Project Settings > API**.

Update your `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

> **Note**: `VITE_SUPABASE_ANON_KEY` is usually the `anon` public key (starts with `ey...`) or the new `sb_publishable_...` key.

## 3. Configure Authentication (Crucial for Login)

If you see the error **"Email logins are disabled"**, you must enable the Email provider.

1.  Go to your Supabase Dashboard.
2.  Navigate to **Authentication > Providers**.
3.  Click on **Email**.
4.  Toggle **Enable Email provider** to **ON**.
5.  (Optional) Uncheck "Confirm email" if you want users to skip email verification for testing.
6.  Click **Save**.

## 4. Database Schema

You may need to set up tables for the app to work correctly (e.g., `profiles`).

Go to the **SQL Editor** in your Supabase dashboard and run the following SQL to set up the basic schema:

```sql
-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Set up Realtime!
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table profiles;
```
