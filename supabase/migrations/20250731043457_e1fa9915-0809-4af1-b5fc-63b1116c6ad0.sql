-- Update subscriptions table to match the Phoenix Project schema
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS tier;
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS status;
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS stripe_subscription_id;
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS stripe_customer_id;
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS current_period_start;
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS current_period_end;
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS trial_ends_at;
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS canceled_at;

-- Add new columns for Phoenix Project subscription model
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'essential';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'trial';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '7 days');
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ;

-- Add constraint for subscription tiers
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_tier_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_tier_check 
CHECK (tier IN ('essential', 'plus', 'premium'));

-- Add constraint for subscription status
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_status_check 
CHECK (status IN ('trial', 'active', 'canceled', 'past_due', 'incomplete'));

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

-- Enable RLS for onboarding_responses
ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for onboarding_responses
CREATE POLICY "Users can manage their own onboarding responses" 
ON public.onboarding_responses 
FOR ALL 
USING (user_id = auth.uid());

-- Create workout_sessions table (matching DynamoDB structure but in PostgreSQL)
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  total_volume_kg DECIMAL(10, 2) DEFAULT 0,
  total_sets INTEGER DEFAULT 0,
  total_exercises INTEGER DEFAULT 0,
  calories_burned INTEGER,
  perceived_exertion INTEGER CHECK (perceived_exertion >= 1 AND perceived_exertion <= 10),
  notes TEXT,
  workout_template_id UUID,
  location TEXT,
  weather JSONB,
  heart_rate_avg INTEGER,
  heart_rate_max INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for workout_sessions
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for workout_sessions
CREATE POLICY "Users can manage their own workout sessions" 
ON public.workout_sessions 
FOR ALL 
USING (user_id = auth.uid());

-- Create exercise_logs table for individual exercises within a workout
CREATE TABLE IF NOT EXISTS public.exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id),
  order_index INTEGER NOT NULL,
  sets_completed INTEGER DEFAULT 0,
  notes TEXT,
  form_score INTEGER CHECK (form_score >= 0 AND form_score <= 100),
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for exercise_logs
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for exercise_logs
CREATE POLICY "Users can manage their own exercise logs" 
ON public.exercise_logs 
FOR ALL 
USING (
  workout_session_id IN (
    SELECT id FROM public.workout_sessions WHERE user_id = auth.uid()
  )
);

-- Create set_logs table for individual sets within an exercise
CREATE TABLE IF NOT EXISTS public.set_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_log_id UUID NOT NULL REFERENCES public.exercise_logs(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight_kg DECIMAL(6, 2),
  duration_seconds INTEGER,
  rest_seconds INTEGER,
  rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
  tempo TEXT,
  is_failure BOOLEAN DEFAULT false,
  is_personal_record BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for set_logs
ALTER TABLE public.set_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for set_logs
CREATE POLICY "Users can manage their own set logs" 
ON public.set_logs 
FOR ALL 
USING (
  exercise_log_id IN (
    SELECT el.id FROM public.exercise_logs el
    JOIN public.workout_sessions ws ON el.workout_session_id = ws.id
    WHERE ws.user_id = auth.uid()
  )
);

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
ALTER TABLE public.sep_ledger ENABLE ROW LEVEL SECURITY;

-- Create policies for sep_ledger
CREATE POLICY "Users can view their own SEP transactions" 
ON public.sep_ledger 
FOR SELECT 
USING (user_id = auth.uid());

-- Create personal_records table
CREATE TABLE IF NOT EXISTS public.personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id),
  record_type TEXT NOT NULL CHECK (record_type IN ('1rm', 'volume', 'endurance', 'speed')),
  value DECIMAL(10, 2) NOT NULL,
  weight_kg DECIMAL(6, 2),
  reps INTEGER,
  duration_seconds INTEGER,
  workout_session_id UUID REFERENCES public.workout_sessions(id),
  set_log_id UUID REFERENCES public.set_logs(id),
  previous_record DECIMAL(10, 2),
  improvement_percentage DECIMAL(5, 2),
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for personal_records
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

-- Create policies for personal_records
CREATE POLICY "Users can view and insert their own personal records" 
ON public.personal_records 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Add updated_at triggers for all new tables
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_onboarding_responses_updated_at') THEN
    CREATE TRIGGER update_onboarding_responses_updated_at
      BEFORE UPDATE ON public.onboarding_responses
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_workout_sessions_updated_at') THEN
    CREATE TRIGGER update_workout_sessions_updated_at
      BEFORE UPDATE ON public.workout_sessions
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;