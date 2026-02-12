-- Migration script to update existing leads table
-- Run this if you already have a leads table

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table first (if it doesn't exist)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'agent')),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lead_actions table if it doesn't exist (before adding policies)
CREATE TABLE IF NOT EXISTS lead_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('call', 'email', 'follow-up', 'note')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add assigned_agent column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'assigned_agent'
    ) THEN
        ALTER TABLE leads ADD COLUMN assigned_agent UUID REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add created_by column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE leads ADD COLUMN created_by UUID REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'status'
    ) THEN
        ALTER TABLE leads ADD COLUMN status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'non-interested', 'closed'));
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_leads_assigned_agent ON leads(assigned_agent);
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON leads(created_by);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_lead_actions_lead_id ON lead_actions(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_actions_agent_id ON lead_actions(agent_id);

-- Enable Row Level Security if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a security definer function to check admin role (avoids circular dependency)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Recreate the admin policy using the function
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins have full access to leads" ON leads;
DROP POLICY IF EXISTS "Agents can insert leads" ON leads;
DROP POLICY IF EXISTS "Agents can view own leads" ON leads;
DROP POLICY IF EXISTS "Agents can update own leads" ON leads;

-- Create RLS Policies for leads
-- Admins can do everything with leads
CREATE POLICY "Admins have full access to leads"
  ON leads FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Agents can insert leads
CREATE POLICY "Agents can insert leads"
  ON leads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'agent'
    )
    AND created_by = auth.uid()
  );

-- Agents can view their own leads (assigned or created)
CREATE POLICY "Agents can view own leads"
  ON leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'agent'
    )
    AND (assigned_agent = auth.uid() OR created_by = auth.uid())
  );

-- Agents can update their own leads
CREATE POLICY "Agents can update own leads"
  ON leads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'agent'
    )
    AND (assigned_agent = auth.uid() OR created_by = auth.uid())
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'agent'
    )
    AND (assigned_agent = auth.uid() OR created_by = auth.uid())
  );

-- RLS Policies for lead_actions (now that the table exists)
DROP POLICY IF EXISTS "Admins can view all actions" ON lead_actions;
CREATE POLICY "Admins can view all actions"
  ON lead_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Agents can view own lead actions" ON lead_actions;
CREATE POLICY "Agents can view own lead actions"
  ON lead_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'agent'
    )
    AND (
      EXISTS (
        SELECT 1 FROM leads
        WHERE id = lead_actions.lead_id
        AND (assigned_agent = auth.uid() OR created_by = auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Agents can insert actions for own leads" ON lead_actions;
CREATE POLICY "Agents can insert actions for own leads"
  ON lead_actions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'agent'
    )
    AND agent_id = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM leads
        WHERE id = lead_actions.lead_id
        AND (assigned_agent = auth.uid() OR created_by = auth.uid())
      )
    )
  );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, name)
  VALUES (
    NEW.id,
    'agent', -- Default role, can be changed by admin
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing leads to have a default created_by (if null)
-- You'll need to set this manually for existing leads or assign them to an admin
-- First, create a profile for any existing users, then run:
-- UPDATE leads SET created_by = (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1) WHERE created_by IS NULL;
