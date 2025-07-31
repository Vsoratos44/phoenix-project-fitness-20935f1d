-- Clean migration: Update schema for Phoenix Project foundational systems

-- Update subscriptions table to match the Phoenix Project schema
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'essential';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'trial';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '7 days');
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ;

-- Add constraints for subscription tiers and status
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_tier_check') THEN
    ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_tier_check 
    CHECK (tier IN ('essential', 'plus', 'premium'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_status_check') THEN
    ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_status_check 
    CHECK (status IN ('trial', 'active', 'canceled', 'past_due', 'incomplete'));
  END IF;
END $$;

-- Update existing profiles table for onboarding
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

-- Create onboarding_responses table to store intake interview data
CREATE TABLE IF NOT EXISTS public.onboarding_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_key)
);

-- Enable RLS for onboarding_responses if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables t 
    JOIN pg_class c ON c.relname = t.tablename 
    WHERE t.tablename = 'onboarding_responses' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies for onboarding_responses if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own onboarding responses' AND tablename = 'onboarding_responses') THEN
    CREATE POLICY "Users can manage their own onboarding responses" 
    ON public.onboarding_responses 
    FOR ALL 
    USING (user_id = auth.uid());
  END IF;
END $$;

-- Create SEP ledger table for rewards tracking
CREATE TABLE IF NOT EXISTS public.sep_ledger (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points DECIMAL(10, 2) NOT NULL,
  base_points DECIMAL(10, 2),
  multipliers JSONB DEFAULT '{}',
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'redeem', 'bonus', 'penalty')),
  activity_type TEXT,
  activity_reference_id UUID,
  description TEXT,
  expires_at TIMESTAMPTZ,
  marketplace_transaction_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for sep_ledger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables t 
    JOIN pg_class c ON c.relname = t.tablename 
    WHERE t.tablename = 'sep_ledger' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.sep_ledger ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies for sep_ledger
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own SEP transactions' AND tablename = 'sep_ledger') THEN
    CREATE POLICY "Users can view their own SEP transactions" 
    ON public.sep_ledger 
    FOR SELECT 
    USING (user_id = auth.uid());
  END IF;
END $$;

-- Create updated_at trigger for onboarding_responses
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_onboarding_responses_updated_at') THEN
    CREATE TRIGGER update_onboarding_responses_updated_at
      BEFORE UPDATE ON public.onboarding_responses
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;