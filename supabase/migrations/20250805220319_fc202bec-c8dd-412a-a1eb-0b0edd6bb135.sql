-- Enhanced Exercise Library Schema
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS exercise_type_detailed text DEFAULT 'strength';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS intensity_level text DEFAULT 'moderate';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS muscle_group_primary text;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS muscle_group_secondary text[];
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS injury_contraindications text[];
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS equipment_alternatives jsonb DEFAULT '[]';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS progression_data jsonb DEFAULT '{}';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS biomechanics_notes text;

-- Workout Archetypes table
CREATE TABLE IF NOT EXISTS workout_archetypes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  primary_goals text[] DEFAULT '{}',
  fitness_level_range text[] DEFAULT '{}',
  phoenix_score_range jsonb DEFAULT '{"min": 0, "max": 100}',
  structure_template jsonb NOT NULL DEFAULT '{}',
  metabolic_emphasis numeric DEFAULT 0.5,
  strength_emphasis numeric DEFAULT 0.5,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enhanced User Injury History
CREATE TABLE IF NOT EXISTS user_injury_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  injury_type text NOT NULL,
  affected_area text NOT NULL,
  severity text DEFAULT 'moderate',
  status text DEFAULT 'active',
  onset_date date,
  recovery_date date,
  contraindicated_exercises uuid[] DEFAULT '{}',
  alternative_exercises uuid[] DEFAULT '{}',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Workout Generation History
CREATE TABLE IF NOT EXISTS workout_generations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  archetype_id uuid,
  generation_context jsonb NOT NULL DEFAULT '{}',
  generated_workout jsonb NOT NULL,
  phoenix_score_at_generation integer,
  user_feedback jsonb DEFAULT '{}',
  adaptation_history jsonb DEFAULT '[]',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Exercise Performance Tracking
CREATE TABLE IF NOT EXISTS exercise_performance_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  exercise_id uuid,
  workout_session_id uuid,
  performance_date date NOT NULL,
  weight_used_kg numeric,
  reps_completed integer,
  sets_completed integer,
  rpe_rating integer,
  form_score integer,
  time_under_tension_seconds integer,
  rest_period_seconds integer,
  progressive_overload_applied boolean DEFAULT false,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enhanced Profiles for Algorithm
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS injury_history_summary jsonb DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS training_frequency_goal integer DEFAULT 3;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_workout_style text DEFAULT 'balanced';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS exercise_preferences jsonb DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS one_rep_max_estimates jsonb DEFAULT '{}';

-- RLS Policies
ALTER TABLE workout_archetypes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view workout archetypes" ON workout_archetypes FOR SELECT USING (true);

ALTER TABLE user_injury_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own injury history" ON user_injury_history FOR ALL USING (user_id = auth.uid());

ALTER TABLE workout_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own workout generations" ON workout_generations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can create workout generations" ON workout_generations FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own workout feedback" ON workout_generations FOR UPDATE USING (user_id = auth.uid());

ALTER TABLE exercise_performance_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own performance history" ON exercise_performance_history FOR ALL USING (user_id = auth.uid());

-- Insert default workout archetypes
INSERT INTO workout_archetypes (name, description, primary_goals, fitness_level_range, phoenix_score_range, structure_template, metabolic_emphasis, strength_emphasis) VALUES
('Metabolic Hypertrophy', 'A blend of heavy lifting and metabolic stress to build muscle and burn fat', '{"build_muscle", "lose_weight"}', '{"intermediate", "advanced"}', '{"min": 60, "max": 100}', '{"blocks": ["warmup", "strength_superset", "metabolic_circuit", "cooldown"]}', 0.6, 0.7),
('Progressive HIIT Overload', 'High-intensity intervals designed to maximize calorie burn and boost metabolism', '{"lose_weight", "improve_endurance"}', '{"beginner", "intermediate", "advanced"}', '{"min": 50, "max": 100}', '{"blocks": ["warmup", "hiit_intervals", "strength_finisher", "cooldown"]}', 0.8, 0.3),
('Active Recovery & Mobility', 'A light session to promote blood flow and recovery', '{"general_fitness", "injury_prevention"}', '{"beginner", "intermediate", "advanced"}', '{"min": 0, "max": 60}', '{"blocks": ["gentle_warmup", "mobility_flow", "light_cardio", "deep_stretch"]}', 0.2, 0.1),
('Strength Foundation', 'Focus on building fundamental strength with compound movements', '{"build_muscle", "increase_strength"}', '{"beginner", "intermediate"}', '{"min": 65, "max": 100}', '{"blocks": ["movement_prep", "compound_strength", "accessory_work", "cooldown"]}', 0.3, 0.9),
('Cardiovascular Conditioning', 'A session focused on sustained cardiovascular effort and endurance', '{"improve_endurance", "lose_weight"}', '{"intermediate", "advanced"}', '{"min": 55, "max": 100}', '{"blocks": ["warmup", "cardio_intervals", "strength_endurance", "cooldown"]}', 0.7, 0.4);

-- Triggers for updated_at
CREATE TRIGGER update_user_injury_history_updated_at
BEFORE UPDATE ON user_injury_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();