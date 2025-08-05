-- Enhanced User Profile System
CREATE TABLE IF NOT EXISTS public.enhanced_user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  
  -- Enhanced Demographics
  training_age_months INTEGER,
  body_fat_percentage NUMERIC,
  dominant_hand TEXT DEFAULT 'right',
  training_split_preference TEXT DEFAULT 'upper_lower',
  
  -- Biometric Integration
  hrv_baseline NUMERIC,
  resting_hr_baseline INTEGER,
  vo2_max_estimate NUMERIC,
  lactate_threshold_hr INTEGER,
  
  -- Movement Quality Assessment
  overhead_mobility_score INTEGER CHECK (overhead_mobility_score BETWEEN 1 AND 10),
  ankle_mobility_score INTEGER CHECK (ankle_mobility_score BETWEEN 1 AND 10),
  hip_mobility_score INTEGER CHECK (hip_mobility_score BETWEEN 1 AND 10),
  thoracic_mobility_score INTEGER CHECK (thoracic_mobility_score BETWEEN 1 AND 10),
  
  -- Performance Metrics
  squat_1rm_kg NUMERIC,
  bench_1rm_kg NUMERIC,
  deadlift_1rm_kg NUMERIC,
  overhead_press_1rm_kg NUMERIC,
  
  -- Training Preferences
  preferred_rep_ranges JSONB DEFAULT '{"strength": "1-5", "hypertrophy": "6-12", "endurance": "12+"}',
  disliked_movements TEXT[],
  preferred_training_days INTEGER[] DEFAULT '{1,2,3,4,5}',
  max_session_duration_minutes INTEGER DEFAULT 60,
  
  -- Recovery Patterns
  typical_sleep_hours NUMERIC DEFAULT 8,
  stress_recovery_time_hours INTEGER DEFAULT 24,
  preferred_rest_days TEXT[] DEFAULT '{"saturday", "sunday"}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Injury History and Contraindications
CREATE TABLE IF NOT EXISTS public.injury_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Injury Details
  injury_type TEXT NOT NULL,
  affected_body_part TEXT NOT NULL,
  severity_level INTEGER NOT NULL CHECK (severity_level BETWEEN 1 AND 10),
  injury_date DATE,
  recovery_date DATE,
  
  -- Clinical Information
  diagnosis TEXT,
  treatment_received TEXT,
  physical_therapy_completed BOOLEAN DEFAULT false,
  
  -- Movement Restrictions
  restricted_movements TEXT[],
  pain_triggers TEXT[],
  contraindicated_exercises UUID[], -- references exercises.id
  
  -- Current Status
  is_chronic BOOLEAN DEFAULT false,
  current_pain_level INTEGER CHECK (current_pain_level BETWEEN 0 AND 10),
  affects_training BOOLEAN DEFAULT true,
  
  -- Medical Professional Info
  cleared_by_medical BOOLEAN DEFAULT false,
  medical_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Movement Restrictions and Modifications
CREATE TABLE IF NOT EXISTS public.movement_restrictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Restriction Details
  restriction_type TEXT NOT NULL, -- 'injury', 'mobility', 'equipment', 'preference'
  affected_movement_pattern TEXT NOT NULL, -- 'squat', 'hinge', 'push', 'pull', 'carry'
  severity TEXT NOT NULL DEFAULT 'moderate', -- 'mild', 'moderate', 'severe'
  
  -- Specific Limitations
  max_range_of_motion_degrees INTEGER,
  max_load_percentage INTEGER, -- percentage of 1RM
  prohibited_positions TEXT[],
  
  -- Alternative Movements
  recommended_alternatives UUID[], -- references exercises.id
  modification_notes TEXT,
  
  -- Tracking
  is_temporary BOOLEAN DEFAULT true,
  expected_resolution_date DATE,
  last_reassessment_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Advanced Exercise Performance Tracking
CREATE TABLE IF NOT EXISTS public.exercise_performance_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id UUID,
  
  -- Performance Metrics
  estimated_1rm_kg NUMERIC,
  volume_load_kg NUMERIC, -- sets * reps * weight
  training_max_kg NUMERIC, -- 90% of 1RM for programming
  
  -- Progressive Overload Tracking
  last_progression_date DATE,
  progression_type TEXT, -- 'weight', 'reps', 'sets', 'tempo', 'rom'
  progression_amount NUMERIC,
  weeks_since_progression INTEGER DEFAULT 0,
  
  -- Performance Patterns
  best_rep_range TEXT, -- where user performs best
  typical_rpe_curve JSONB, -- RPE progression across sets
  fatigue_pattern TEXT, -- 'early', 'late', 'consistent'
  
  -- Form and Technique
  average_form_score NUMERIC,
  common_form_issues TEXT[],
  technique_cues_effective TEXT[],
  
  -- Periodization Data
  current_phase TEXT, -- 'accumulation', 'intensification', 'realization'
  phase_week INTEGER,
  target_adaptations TEXT[], -- 'strength', 'power', 'hypertrophy', 'endurance'
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Real-time Workout Adaptation System
CREATE TABLE IF NOT EXISTS public.workout_adaptations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workout_session_id UUID,
  exercise_id UUID,
  
  -- Adaptation Trigger
  trigger_type TEXT NOT NULL, -- 'rpe_feedback', 'pain_signal', 'form_breakdown', 'fatigue'
  trigger_value JSONB NOT NULL,
  
  -- Original vs Adapted
  original_prescription JSONB NOT NULL,
  adapted_prescription JSONB NOT NULL,
  adaptation_reason TEXT NOT NULL,
  
  -- Adaptation Details
  adaptation_type TEXT NOT NULL, -- 'load_reduction', 'exercise_swap', 'set_adjustment', 'rest_increase'
  confidence_score NUMERIC, -- AI confidence in adaptation
  
  -- Outcome Tracking
  user_satisfaction INTEGER CHECK (user_satisfaction BETWEEN 1 AND 5),
  completion_success BOOLEAN,
  follow_up_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Progressive Overload Intelligence
CREATE TABLE IF NOT EXISTS public.progressive_overload_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id UUID,
  
  -- Overload Strategy
  progression_method TEXT NOT NULL, -- 'linear', 'double_progression', 'percentage_based'
  current_phase TEXT NOT NULL, -- 'base', 'build', 'peak', 'deload'
  phase_duration_weeks INTEGER DEFAULT 4,
  
  -- Load Parameters
  base_weight_kg NUMERIC,
  target_weight_kg NUMERIC,
  progression_increment_kg NUMERIC DEFAULT 2.5,
  
  -- Volume Parameters
  base_sets INTEGER,
  target_sets INTEGER,
  base_reps INTEGER,
  target_reps INTEGER,
  
  -- Intensity Guidelines
  target_rpe_range JSONB DEFAULT '{"min": 7, "max": 9}',
  autoregulation_enabled BOOLEAN DEFAULT true,
  
  -- Success Metrics
  progression_success_rate NUMERIC,
  stall_count INTEGER DEFAULT 0,
  deload_frequency_weeks INTEGER DEFAULT 8,
  
  -- Timeline
  plan_start_date DATE NOT NULL,
  estimated_completion_date DATE,
  last_progression_date DATE,
  next_progression_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Workout Generation Intelligence
CREATE TABLE IF NOT EXISTS public.workout_generation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  
  -- Generation Parameters
  target_duration_minutes INTEGER,
  selected_archetype TEXT,
  equipment_available TEXT[],
  training_phase TEXT,
  
  -- AI Decision Making
  exercise_selection_reasoning JSONB,
  progression_calculations JSONB,
  adaptation_factors JSONB,
  
  -- Output Quality
  estimated_difficulty INTEGER CHECK (estimated_difficulty BETWEEN 1 AND 10),
  predicted_satisfaction NUMERIC,
  contraindication_checks_passed BOOLEAN DEFAULT true,
  
  -- Performance Tracking
  generation_time_ms INTEGER,
  ai_model_version TEXT,
  prompt_tokens_used INTEGER,
  completion_tokens_used INTEGER,
  
  -- User Feedback
  actual_difficulty INTEGER CHECK (actual_difficulty BETWEEN 1 AND 10),
  actual_satisfaction INTEGER CHECK (actual_satisfaction BETWEEN 1 AND 5),
  completion_rate NUMERIC,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Exercise Contraindications Matrix
CREATE TABLE IF NOT EXISTS public.exercise_contraindications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID NOT NULL,
  
  -- Contraindication Details
  contraindication_type TEXT NOT NULL, -- 'injury', 'condition', 'limitation'
  affected_condition TEXT NOT NULL,
  severity_level TEXT NOT NULL DEFAULT 'moderate', -- 'mild', 'moderate', 'severe', 'absolute'
  
  -- Alternative Suggestions
  recommended_alternatives UUID[],
  modification_options JSONB,
  
  -- Clinical Information
  medical_reasoning TEXT,
  research_references TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Workout Blocks and Periodization
CREATE TABLE IF NOT EXISTS public.workout_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Block Structure
  block_name TEXT NOT NULL,
  block_type TEXT NOT NULL, -- 'warm_up', 'activation', 'strength', 'power', 'metabolic', 'cool_down'
  order_index INTEGER NOT NULL,
  
  -- Timing and Structure
  estimated_duration_minutes INTEGER,
  superset_grouping JSONB, -- groups exercises into supersets
  rest_protocols JSONB, -- rest times between exercises/sets
  
  -- Exercise Configuration
  exercises JSONB NOT NULL, -- array of exercise configurations
  progression_scheme JSONB,
  intensity_targets JSONB,
  
  -- Adaptation Rules
  fatigue_thresholds JSONB,
  progression_triggers JSONB,
  regression_protocols JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.enhanced_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.injury_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movement_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_performance_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_adaptations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progressive_overload_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_contraindications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_blocks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own enhanced profile" ON public.enhanced_user_profiles
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own injury history" ON public.injury_history
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own movement restrictions" ON public.movement_restrictions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own performance analytics" ON public.exercise_performance_analytics
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own workout adaptations" ON public.workout_adaptations
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own overload plans" ON public.progressive_overload_plans
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own generation logs" ON public.workout_generation_logs
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Anyone can view exercise contraindications" ON public.exercise_contraindications
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own workout blocks" ON public.workout_blocks
  FOR ALL USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_enhanced_profiles_user_id ON public.enhanced_user_profiles(user_id);
CREATE INDEX idx_injury_history_user_id ON public.injury_history(user_id);
CREATE INDEX idx_movement_restrictions_user_id ON public.movement_restrictions(user_id);
CREATE INDEX idx_performance_analytics_user_exercise ON public.exercise_performance_analytics(user_id, exercise_id);
CREATE INDEX idx_workout_adaptations_user_session ON public.workout_adaptations(user_id, workout_session_id);
CREATE INDEX idx_overload_plans_user_exercise ON public.progressive_overload_plans(user_id, exercise_id);
CREATE INDEX idx_generation_logs_user_created ON public.workout_generation_logs(user_id, created_at);
CREATE INDEX idx_contraindications_exercise ON public.exercise_contraindications(exercise_id);
CREATE INDEX idx_workout_blocks_user_type ON public.workout_blocks(user_id, block_type);

-- Create triggers for updated_at
CREATE TRIGGER update_enhanced_profiles_updated_at
  BEFORE UPDATE ON public.enhanced_user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_injury_history_updated_at
  BEFORE UPDATE ON public.injury_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_movement_restrictions_updated_at
  BEFORE UPDATE ON public.movement_restrictions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_performance_analytics_updated_at
  BEFORE UPDATE ON public.exercise_performance_analytics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_overload_plans_updated_at
  BEFORE UPDATE ON public.progressive_overload_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contraindications_updated_at
  BEFORE UPDATE ON public.exercise_contraindications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_blocks_updated_at
  BEFORE UPDATE ON public.workout_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();