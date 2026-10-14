-- 001_init.sql
-- Supabase schema & RLS for Flywheel AI

-- 1. Profiles Table with RBAC and Credit Wallets
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  company_name TEXT,
  credits INT DEFAULT 6,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  can_download BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

-- 2. Chatbot Leads Captured from Public Landing Page
CREATE TABLE IF NOT EXISTS public.leads (
  id BIGSERIAL PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  interest TEXT,
  chat_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Live Visitor Analytics for Admin Tracking
CREATE TABLE IF NOT EXISTS public.visitor_logs (
  id BIGSERIAL PRIMARY KEY,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  page_visited TEXT,
  time_spent_seconds INT DEFAULT 0,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Global & Per-Tenant Service Feature Flags
CREATE TABLE IF NOT EXISTS public.service_flags (
  service_key TEXT PRIMARY KEY,
  service_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  requires_credits INT DEFAULT 10
);

INSERT INTO public.service_flags (service_key, service_name, is_enabled, requires_credits)
  SELECT * FROM (VALUES
    ('web_intel','Website & Traffic Intelligence', true, 10),
    ('seo_intel','SEO Intelligence & Audit', true, 10),
    ('geo_intel','AI Search & GEO Intelligence', true, 15),
    ('ads_intel','Google & Meta Ads Optimizer', true, 15),
    ('marketplace_intel','Amazon/Flipkart/Myntra Optimizer', true, 10),
    ('creative_studio','AI Content, Image & Video Studio', true, 20),
    ('store_sync','1-Click WordPress & Shopify Sync', true, 50)
  ) AS v(service_key, service_name, is_enabled, requires_credits)
  ON CONFLICT (service_key) DO NOTHING;

-- 5. Row Level Security Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own profile
CREATE POLICY IF NOT EXISTS "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins: full access to profiles
CREATE POLICY IF NOT EXISTS "Admins full access profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Public can insert leads (landing page)
CREATE POLICY IF NOT EXISTS "Public insert leads" ON public.leads
  FOR INSERT WITH CHECK (true);

-- Admins can read leads
CREATE POLICY IF NOT EXISTS "Admins read leads" ON public.leads
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Visitor logs: admins can read, server can insert
CREATE POLICY IF NOT EXISTS "Admins read visitor_logs" ON public.visitor_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY IF NOT EXISTS "Server insert visitor_logs" ON public.visitor_logs
  FOR INSERT WITH CHECK (true);

-- 6. Helper: Atomic credit spend function
-- Returns boolean success
CREATE OR REPLACE FUNCTION public.spend_credits(uid uuid, amount int)
RETURNS boolean LANGUAGE plpgsql AS $$
DECLARE
  current_credits int;
BEGIN
  IF amount <= 0 THEN
    RETURN TRUE;
  END IF;

  SELECT credits INTO current_credits FROM public.profiles WHERE id = uid FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF current_credits < amount THEN
    RETURN FALSE;
  END IF;

  UPDATE public.profiles SET credits = credits - amount WHERE id = uid;
  RETURN TRUE;
END;
$$;

-- Optional: grant execute to anon? NO. Only server/service role or webhooks should call this.

-- 7. Example: index on created_at for leads and visitor_logs
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_created_at ON public.visitor_logs (created_at DESC);
