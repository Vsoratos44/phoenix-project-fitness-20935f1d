-- Create comprehensive Phoenix Fitness platform database tables

-- Enhanced User Profiles with Comprehensive Data
CREATE TABLE IF NOT EXISTS enhanced_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Demographics
  age INTEGER CHECK (age BETWEEN 13 AND 120),
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  height_cm INTEGER CHECK (height_cm BETWEEN 100 AND 250),
  weight_kg NUMERIC(5,2) CHECK (weight_kg BETWEEN 30 AND 300),
  body_fat_percentage NUMERIC(4,2) CHECK (body_fat_percentage BETWEEN 3 AND 50),
  
  -- Goals & Preferences
  primary_goal TEXT CHECK (primary_goal IN ('lose_weight', 'build_muscle', 'improve_endurance', 'general_fitness', 'sport_performance')),
  target_weight_kg NUMERIC(5,2),
  timeline_weeks INTEGER,
  specific_focus TEXT[],
  
  -- Fitness Profile
  training_level TEXT CHECK (training_level IN ('beginner', 'intermediate', 'advanced', 'elite')),
  training_frequency INTEGER CHECK (training_frequency BETWEEN 1 AND 7),
  session_duration_preference INTEGER CHECK (session_duration_preference BETWEEN 15 AND 180),
  workout_intensity_preference TEXT CHECK (workout_intensity_preference IN ('low', 'moderate', 'high', 'variable')),
  
  -- Health Data
  medical_conditions TEXT[],
  medications TEXT[],
  pain_areas TEXT[],
  
  -- Equipment & Location
  gym_access BOOLEAN DEFAULT false,
  home_equipment TEXT[],
  preferred_location TEXT CHECK (preferred_location IN ('home', 'gym', 'both')),
  
  -- Preferences
  exercise_preferences TEXT[],
  exercise_dislikes TEXT[],
  music_tempo_preference TEXT CHECK (music_tempo_preference IN ('slow', 'medium', 'fast')),
  coaching_style TEXT CHECK (coaching_style IN ('encouraging', 'challenging', 'analytical')),
  
  -- Biometric Data
  resting_heart_rate INTEGER CHECK (resting_heart_rate BETWEEN 30 AND 200),
  hrv_score NUMERIC(5,2),
  sleep_quality_score NUMERIC(3,1) CHECK (sleep_quality_score BETWEEN 0 AND 10),
  stress_level NUMERIC(3,1) CHECK (stress_level BETWEEN 0 AND 10),
  
  -- Schedule
  available_times JSONB DEFAULT '[]',
  workout_days TEXT[] CHECK (array_length(workout_days, 1) <= 7),
  time_constraints TEXT[],
  
  -- Tracking
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Advanced Workout Programs
CREATE TABLE IF NOT EXISTS workout_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER NOT NULL CHECK (duration_weeks BETWEEN 1 AND 52),
  workouts_per_week INTEGER NOT NULL CHECK (workouts_per_week BETWEEN 1 AND 7),
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  goal TEXT NOT NULL,
  equipment_required TEXT[],
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  workout_structure JSONB,
  progression_scheme JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Workout Sessions with Enhanced Tracking
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES workout_programs(id),
  name TEXT NOT NULL,
  workout_data JSONB NOT NULL,
  
  -- Session Timing
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  planned_duration_minutes INTEGER,
  
  -- Performance Metrics
  total_exercises INTEGER DEFAULT 0,
  total_sets INTEGER DEFAULT 0,
  total_volume_kg NUMERIC(10,2) DEFAULT 0,
  calories_burned INTEGER,
  average_heart_rate INTEGER,
  max_heart_rate INTEGER,
  
  -- User Feedback
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 10),
  enjoyment_rating INTEGER CHECK (enjoyment_rating BETWEEN 1 AND 10),
  energy_before INTEGER CHECK (energy_before BETWEEN 1 AND 10),
  energy_after INTEGER CHECK (energy_after BETWEEN 1 AND 10),
  notes TEXT,
  
  -- Phoenix Adaptations
  adaptations_made TEXT[],
  phoenix_score_used INTEGER CHECK (phoenix_score_used BETWEEN 0 AND 100),
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Recovery and Sleep Tracking
CREATE TABLE IF NOT EXISTS recovery_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Sleep Metrics
  sleep_duration_hours NUMERIC(4,2),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  sleep_onset_time TIME,
  wake_time TIME,
  sleep_interruptions INTEGER DEFAULT 0,
  
  -- Recovery Metrics
  muscle_soreness INTEGER CHECK (muscle_soreness BETWEEN 1 AND 10),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  mood INTEGER CHECK (mood BETWEEN 1 AND 10),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  
  -- HRV and Physiological
  hrv_score NUMERIC(5,2),
  resting_heart_rate INTEGER,
  body_temperature NUMERIC(4,2),
  hydration_level INTEGER CHECK (hydration_level BETWEEN 1 AND 10),
  
  -- Lifestyle Factors
  alcohol_consumed BOOLEAN DEFAULT false,
  caffeine_intake INTEGER DEFAULT 0,
  nutrition_quality INTEGER CHECK (nutrition_quality BETWEEN 1 AND 10),
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, date)
);

-- Advanced Nutrition Tracking
CREATE TABLE IF NOT EXISTS meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout')),
  meal_time TIMESTAMPTZ,
  
  -- Food Items (can be multiple)
  food_items JSONB NOT NULL, -- Array of food objects with portions
  
  -- Calculated Totals
  total_calories NUMERIC(7,2),
  total_protein_g NUMERIC(6,2),
  total_carbs_g NUMERIC(6,2),
  total_fat_g NUMERIC(6,2),
  total_fiber_g NUMERIC(6,2),
  total_sodium_mg NUMERIC(8,2),
  total_sugar_g NUMERIC(6,2),
  
  -- Meal Context
  meal_location TEXT,
  meal_source TEXT, -- 'home_cooked', 'restaurant', 'fast_food', 'meal_prep'
  satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 10),
  hunger_before INTEGER CHECK (hunger_before BETWEEN 1 AND 10),
  hunger_after INTEGER CHECK (hunger_after BETWEEN 1 AND 10),
  
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Social Features and Community
CREATE TABLE IF NOT EXISTS social_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_type TEXT CHECK (connection_type IN ('follow', 'friend', 'coach', 'client')),
  status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(follower_id, following_id)
);

-- Workout Sharing and Social Posts
CREATE TABLE IF NOT EXISTS workout_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  share_type TEXT CHECK (share_type IN ('achievement', 'workout_complete', 'personal_record', 'progress_photo')),
  content TEXT,
  media_urls TEXT[],
  visibility TEXT CHECK (visibility IN ('public', 'friends', 'private')) DEFAULT 'friends',
  
  -- Engagement
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Advanced Achievement System
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id),
  earned_at TIMESTAMPTZ DEFAULT now(),
  progress_data JSONB,
  tier INTEGER DEFAULT 1 CHECK (tier BETWEEN 1 AND 5), -- Bronze, Silver, Gold, Platinum, Diamond
  
  UNIQUE(user_id, achievement_id, tier)
);

-- Habit Tracking System
CREATE TABLE IF NOT EXISTS habit_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_type TEXT NOT NULL, -- 'workout', 'nutrition', 'sleep', 'hydration', 'meditation'
  habit_name TEXT NOT NULL,
  target_frequency INTEGER NOT NULL, -- per week
  target_value NUMERIC(10,2), -- optional numerical target
  target_unit TEXT, -- 'minutes', 'glasses', 'hours', etc.
  
  -- Tracking
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  success_rate NUMERIC(5,2) DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Daily Habit Logs
CREATE TABLE IF NOT EXISTS daily_habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habit_tracking(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  value_achieved NUMERIC(10,2), -- actual value if applicable
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(habit_id, date)
);

-- Subscription and Payment Tracking
CREATE TABLE IF NOT EXISTS subscription_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier TEXT CHECK (subscription_tier IN ('free', 'essential', 'premium', 'elite')),
  
  -- Feature Access
  ai_workout_generations_remaining INTEGER DEFAULT 0,
  nutrition_analysis_enabled BOOLEAN DEFAULT false,
  advanced_analytics_enabled BOOLEAN DEFAULT false,
  coach_consultation_enabled BOOLEAN DEFAULT false,
  custom_program_access BOOLEAN DEFAULT false,
  community_features_enabled BOOLEAN DEFAULT true,
  
  -- Usage Tracking
  ai_workouts_used_this_month INTEGER DEFAULT 0,
  features_accessed JSONB DEFAULT '[]',
  
  last_updated TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Workout Equipment Marketplace Integration
CREATE TABLE IF NOT EXISTS equipment_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  equipment_type TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  price_range TEXT,
  recommendation_reason TEXT,
  amazon_link TEXT,
  affiliate_code TEXT,
  
  -- User Interaction
  clicked BOOLEAN DEFAULT false,
  purchased BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Coach and Expert Consultation System
CREATE TABLE IF NOT EXISTS expert_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_id UUID REFERENCES auth.users(id),
  consultation_type TEXT CHECK (consultation_type IN ('fitness_assessment', 'nutrition_planning', 'injury_consultation', 'program_design')),
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 60,
  timezone TEXT,
  meeting_link TEXT,
  
  -- Content
  client_goals TEXT,
  expert_notes TEXT,
  recommendations JSONB,
  follow_up_actions TEXT[],
  
  -- Status
  status TEXT CHECK (status IN ('requested', 'scheduled', 'completed', 'cancelled')) DEFAULT 'requested',
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded')) DEFAULT 'pending',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_enhanced_profiles_user_id ON enhanced_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date ON workout_sessions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_recovery_data_user_date ON recovery_data(user_id, date);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_date ON meal_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON daily_habit_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_social_connections_follower ON social_connections(follower_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_following ON social_connections(following_id);

-- Enable Row Level Security
ALTER TABLE enhanced_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_consultations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own enhanced profile" ON enhanced_profiles FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can view public workout programs" ON workout_programs FOR SELECT USING (is_public = true OR created_by = auth.uid());
CREATE POLICY "Users can create workout programs" ON workout_programs FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update their own workout programs" ON workout_programs FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can manage their own workout sessions" ON workout_sessions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own recovery data" ON recovery_data FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own meal logs" ON meal_logs FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their social connections" ON social_connections FOR ALL USING (follower_id = auth.uid() OR following_id = auth.uid());
CREATE POLICY "Users can manage their workout shares" ON workout_shares FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can view public workout shares" ON workout_shares FOR SELECT USING (visibility = 'public' OR user_id = auth.uid());

CREATE POLICY "Users can view their own achievements" ON user_achievements FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own habits" ON habit_tracking FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own habit logs" ON daily_habit_logs FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their own subscription features" ON subscription_features FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can view their equipment recommendations" ON equipment_recommendations FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage their consultations" ON expert_consultations FOR ALL USING (client_id = auth.uid() OR expert_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for timestamp updates
CREATE TRIGGER update_enhanced_profiles_updated_at BEFORE UPDATE ON enhanced_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workout_programs_updated_at BEFORE UPDATE ON workout_programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_habit_tracking_updated_at BEFORE UPDATE ON habit_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();