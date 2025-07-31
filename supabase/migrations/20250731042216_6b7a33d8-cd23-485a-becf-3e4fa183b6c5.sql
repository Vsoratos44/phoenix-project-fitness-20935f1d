-- Phoenix Project Fitness - Comprehensive Database Schema
-- Foundational architecture for all microservices

-- ================================
-- 1. USER & AUTHENTICATION SERVICE
-- ================================

-- User profiles with comprehensive fitness data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'beginner',
  primary_goal TEXT CHECK (primary_goal IN ('lose_weight', 'build_muscle', 'improve_endurance', 'general_fitness', 'strength_training', 'flexibility')) DEFAULT 'general_fitness',
  available_equipment JSONB DEFAULT '[]',
  dietary_restrictions JSONB DEFAULT '[]',
  medical_conditions JSONB DEFAULT '[]',
  preferred_workout_duration INTEGER DEFAULT 30, -- minutes
  workout_frequency_per_week INTEGER DEFAULT 3,
  phone_number TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscription tiers and billing
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  tier TEXT CHECK (tier IN ('essential', 'plus', 'premium')) NOT NULL DEFAULT 'essential',
  status TEXT CHECK (status IN ('active', 'canceled', 'expired', 'trial')) NOT NULL DEFAULT 'trial',
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- 2. CONTENT & EXERCISE LIBRARY SERVICE
-- ================================

-- Exercise categories and muscle groups
CREATE TABLE public.muscle_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.exercise_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  color_hex TEXT DEFAULT '#FF6B35',
  icon_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comprehensive exercise database
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  instructions JSONB, -- Step-by-step instructions
  category_id UUID REFERENCES public.exercise_categories(id),
  primary_muscle_groups UUID[] DEFAULT '{}',
  secondary_muscle_groups UUID[] DEFAULT '{}',
  equipment_required JSONB DEFAULT '[]',
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  met_value DECIMAL(4,2) DEFAULT 3.5, -- Metabolic equivalent for calories
  video_url TEXT,
  thumbnail_url TEXT,
  animation_url TEXT,
  form_cues JSONB DEFAULT '[]',
  common_mistakes JSONB DEFAULT '[]',
  variations JSONB DEFAULT '[]',
  is_bodyweight BOOLEAN DEFAULT false,
  is_unilateral BOOLEAN DEFAULT false, -- Single limb exercise
  requires_spotter BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(user_id),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Structured workout programs
CREATE TABLE public.workout_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER NOT NULL,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  goal TEXT CHECK (goal IN ('strength', 'hypertrophy', 'endurance', 'weight_loss', 'general_fitness')),
  equipment_required JSONB DEFAULT '[]',
  workouts_per_week INTEGER DEFAULT 3,
  thumbnail_url TEXT,
  created_by UUID REFERENCES public.profiles(user_id),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Individual workout templates
CREATE TABLE public.workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.workout_programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  week_number INTEGER,
  day_number INTEGER,
  estimated_duration INTEGER, -- minutes
  total_exercises INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exercise sets within workout templates
CREATE TABLE public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_template_id UUID REFERENCES public.workout_templates(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id),
  order_index INTEGER NOT NULL,
  sets INTEGER NOT NULL DEFAULT 1,
  reps INTEGER,
  reps_min INTEGER,
  reps_max INTEGER,
  weight_kg DECIMAL(6,2),
  duration_seconds INTEGER,
  rest_seconds INTEGER DEFAULT 60,
  notes TEXT,
  is_warmup BOOLEAN DEFAULT false,
  is_superset BOOLEAN DEFAULT false,
  superset_group INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- 3. WORKOUT LOGGING SERVICE
-- ================================

-- User workout sessions (completed workouts)
CREATE TABLE public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  workout_template_id UUID REFERENCES public.workout_templates(id),
  name TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  total_exercises INTEGER DEFAULT 0,
  total_sets INTEGER DEFAULT 0,
  total_volume_kg DECIMAL(10,2) DEFAULT 0,
  calories_burned INTEGER,
  notes TEXT,
  perceived_exertion INTEGER CHECK (perceived_exertion BETWEEN 1 AND 10),
  location TEXT,
  weather JSONB,
  heart_rate_avg INTEGER,
  heart_rate_max INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Individual exercise performance within sessions
CREATE TABLE public.exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id),
  order_index INTEGER NOT NULL,
  sets_completed INTEGER DEFAULT 0,
  notes TEXT,
  form_score INTEGER CHECK (form_score BETWEEN 1 AND 100),
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Individual set performance
CREATE TABLE public.set_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_log_id UUID REFERENCES public.exercise_logs(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight_kg DECIMAL(6,2),
  duration_seconds INTEGER,
  rest_seconds INTEGER,
  rpe INTEGER CHECK (rpe BETWEEN 1 AND 10), -- Rate of Perceived Exertion
  is_personal_record BOOLEAN DEFAULT false,
  is_failure BOOLEAN DEFAULT false,
  tempo TEXT, -- e.g., "3-1-2-1"
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Personal records tracking
CREATE TABLE public.personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id),
  record_type TEXT CHECK (record_type IN ('max_weight', 'max_reps', 'max_volume', 'max_duration')) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  weight_kg DECIMAL(6,2),
  reps INTEGER,
  duration_seconds INTEGER,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  workout_session_id UUID REFERENCES public.workout_sessions(id),
  set_log_id UUID REFERENCES public.set_logs(id),
  previous_record DECIMAL(10,2),
  improvement_percentage DECIMAL(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- 4. ANALYTICS & INTELLIGENCE SERVICE
-- ================================

-- Phoenix Score calculation (daily readiness score)
CREATE TABLE public.phoenix_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100) NOT NULL,
  sleep_score INTEGER CHECK (sleep_score BETWEEN 0 AND 100),
  recovery_score INTEGER CHECK (recovery_score BETWEEN 0 AND 100),
  training_load_score INTEGER CHECK (training_load_score BETWEEN 0 AND 100),
  nutrition_score INTEGER CHECK (nutrition_score BETWEEN 0 AND 100),
  stress_score INTEGER CHECK (stress_score BETWEEN 0 AND 100),
  hrv_score INTEGER CHECK (hrv_score BETWEEN 0 AND 100),
  factors JSONB DEFAULT '{}', -- Contributing factors and weights
  recommendation TEXT,
  suggested_intensity TEXT CHECK (suggested_intensity IN ('rest', 'light', 'moderate', 'high', 'max')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Biometric data tracking
CREATE TABLE public.biometric_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  weight_kg DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,2),
  muscle_mass_kg DECIMAL(5,2),
  resting_heart_rate INTEGER,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  sleep_hours DECIMAL(3,1),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  mood INTEGER CHECK (mood BETWEEN 1 AND 10),
  notes TEXT,
  source TEXT DEFAULT 'manual', -- manual, fitbit, apple_health, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- 5. REWARDS & GAMIFICATION SERVICE (SEP - Sweat Equity Points)
-- ================================

-- SEP ledger for points tracking
CREATE TABLE public.sep_ledger (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT CHECK (transaction_type IN ('earn', 'spend', 'bonus', 'penalty', 'refund')) NOT NULL,
  points DECIMAL(10,2) NOT NULL,
  activity_type TEXT, -- 'workout', 'nutrition', 'social', 'achievement'
  activity_reference_id UUID, -- Reference to workout_session, nutrition_log, etc.
  base_points DECIMAL(10,2),
  multipliers JSONB DEFAULT '{}', -- Applied multipliers and their values
  description TEXT,
  marketplace_transaction_id UUID, -- For redemptions
  expires_at TIMESTAMPTZ, -- For time-limited points
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User achievements and badges
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_name TEXT,
  badge_color TEXT DEFAULT '#FFD700',
  category TEXT CHECK (category IN ('workout', 'consistency', 'strength', 'endurance', 'social', 'nutrition')),
  difficulty TEXT CHECK (difficulty IN ('bronze', 'silver', 'gold', 'platinum')) DEFAULT 'bronze',
  criteria JSONB NOT NULL, -- Conditions to unlock the achievement
  sep_reward INTEGER DEFAULT 0,
  is_repeatable BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false, -- Secret achievements
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User earned achievements
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  progress JSONB DEFAULT '{}', -- Current progress towards repeatable achievements
  UNIQUE(user_id, achievement_id, earned_at)
);

-- Marketplace vendors and products
CREATE TABLE public.marketplace_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  api_endpoint TEXT,
  api_key_encrypted TEXT,
  commission_rate DECIMAL(4,2) DEFAULT 0.12, -- 12% commission
  is_active BOOLEAN DEFAULT true,
  contact_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- 6. NUTRITION SERVICE
-- ================================

-- Food database
CREATE TABLE public.foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT,
  barcode TEXT UNIQUE,
  serving_size_g DECIMAL(8,2),
  serving_size_description TEXT,
  calories_per_100g DECIMAL(6,2),
  protein_per_100g DECIMAL(5,2),
  carbs_per_100g DECIMAL(5,2),
  fat_per_100g DECIMAL(5,2),
  fiber_per_100g DECIMAL(5,2),
  sugar_per_100g DECIMAL(5,2),
  sodium_per_100g DECIMAL(8,2),
  category TEXT,
  food_group TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User meal logging
CREATE TABLE public.nutrition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
  food_id UUID REFERENCES public.foods(id),
  custom_food_name TEXT, -- For quick-add items
  serving_amount DECIMAL(8,2) NOT NULL,
  serving_unit TEXT NOT NULL, -- grams, cups, pieces, etc.
  calories DECIMAL(6,2),
  protein_g DECIMAL(5,2),
  carbs_g DECIMAL(5,2),
  fat_g DECIMAL(5,2),
  fiber_g DECIMAL(5,2),
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Daily nutrition targets and goals
CREATE TABLE public.nutrition_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  calories_target INTEGER,
  protein_target_g DECIMAL(5,2),
  carbs_target_g DECIMAL(5,2),
  fat_target_g DECIMAL(5,2),
  fiber_target_g DECIMAL(5,2),
  water_target_ml INTEGER DEFAULT 2000,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- 7. SOCIAL & COMMUNITY SERVICE
-- ================================

-- User connections and following
CREATE TABLE public.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Community challenges
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT CHECK (challenge_type IN ('individual', 'team', 'community')) NOT NULL,
  category TEXT CHECK (category IN ('workout', 'nutrition', 'consistency', 'distance', 'weight')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  goal_criteria JSONB NOT NULL, -- What needs to be achieved
  max_participants INTEGER,
  entry_fee_sep INTEGER DEFAULT 0,
  prize_pool_sep INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(user_id),
  is_public BOOLEAN DEFAULT true,
  banner_url TEXT,
  rules TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Challenge participation
CREATE TABLE public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_progress JSONB DEFAULT '{}',
  is_completed BOOLEAN DEFAULT false,
  final_rank INTEGER,
  prize_earned_sep INTEGER DEFAULT 0,
  UNIQUE(challenge_id, user_id)
);

-- Social activity feed
CREATE TABLE public.activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT CHECK (activity_type IN ('workout', 'pr', 'achievement', 'challenge', 'social')) NOT NULL,
  content TEXT,
  metadata JSONB DEFAULT '{}', -- Additional data like workout stats, achievement details
  reference_id UUID, -- ID of the related object (workout_session, achievement, etc.)
  privacy_level TEXT CHECK (privacy_level IN ('public', 'friends', 'private')) DEFAULT 'public',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Social interactions (likes, comments)
CREATE TABLE public.activity_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES public.activity_feed(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  interaction_type TEXT CHECK (interaction_type IN ('like', 'comment')) NOT NULL,
  content TEXT, -- For comments
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(activity_id, user_id, interaction_type, created_at)
);

-- ================================
-- 8. NOTIFICATION SERVICE
-- ================================

-- User notification preferences
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL UNIQUE,
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  workout_reminders BOOLEAN DEFAULT true,
  achievement_notifications BOOLEAN DEFAULT true,
  social_notifications BOOLEAN DEFAULT true,
  challenge_updates BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification queue and delivery
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT CHECK (notification_type IN ('push', 'email', 'in_app')) NOT NULL,
  category TEXT CHECK (category IN ('workout', 'achievement', 'social', 'challenge', 'system')) NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- ENABLE ROW LEVEL SECURITY
-- ================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.muscle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.set_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phoenix_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometric_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sep_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ================================
-- BASIC RLS POLICIES (User-specific data access)
-- ================================

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Public read access for reference data
CREATE POLICY "Anyone can view muscle groups" ON public.muscle_groups
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view exercise categories" ON public.exercise_categories
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view approved exercises" ON public.exercises
  FOR SELECT USING (is_approved = true);

-- User-specific workout data
CREATE POLICY "Users can view their own workout sessions" ON public.workout_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own workout sessions" ON public.workout_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own workout sessions" ON public.workout_sessions
  FOR UPDATE USING (user_id = auth.uid());

-- SEP ledger access
CREATE POLICY "Users can view their own SEP transactions" ON public.sep_ledger
  FOR SELECT USING (user_id = auth.uid());

-- Nutrition logs access
CREATE POLICY "Users can manage their own nutrition logs" ON public.nutrition_logs
  FOR ALL USING (user_id = auth.uid());

-- Notifications access
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

-- User and session-based queries
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_start_time ON public.workout_sessions(start_time);
CREATE INDEX idx_exercise_logs_workout_session_id ON public.exercise_logs(workout_session_id);
CREATE INDEX idx_set_logs_exercise_log_id ON public.set_logs(exercise_log_id);

-- SEP and points queries
CREATE INDEX idx_sep_ledger_user_id ON public.sep_ledger(user_id);
CREATE INDEX idx_sep_ledger_created_at ON public.sep_ledger(created_at);

-- Exercise and content queries
CREATE INDEX idx_exercises_category_id ON public.exercises(category_id);
CREATE INDEX idx_exercises_difficulty_level ON public.exercises(difficulty_level);
CREATE INDEX idx_exercises_is_approved ON public.exercises(is_approved);

-- Social and activity queries
CREATE INDEX idx_activity_feed_user_id ON public.activity_feed(user_id);
CREATE INDEX idx_activity_feed_created_at ON public.activity_feed(created_at);
CREATE INDEX idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following_id ON public.user_follows(following_id);

-- Nutrition and biometric queries
CREATE INDEX idx_nutrition_logs_user_id_date ON public.nutrition_logs(user_id, date);
CREATE INDEX idx_phoenix_scores_user_id_date ON public.phoenix_scores(user_id, date);
CREATE INDEX idx_biometric_logs_user_id_recorded_at ON public.biometric_logs(user_id, recorded_at);

-- ================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at BEFORE UPDATE ON public.workout_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();