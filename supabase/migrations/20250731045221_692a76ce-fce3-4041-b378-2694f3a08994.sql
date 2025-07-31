-- Drop existing tables that will be recreated with enhanced schemas
DROP TABLE IF EXISTS workout_exercises CASCADE;
DROP TABLE IF EXISTS workout_templates CASCADE;
DROP TABLE IF EXISTS workout_programs CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS exercise_categories CASCADE;
DROP TABLE IF EXISTS muscle_groups CASCADE;
DROP TABLE IF EXISTS foods CASCADE;
DROP TABLE IF EXISTS nutrition_logs CASCADE;
DROP TABLE IF EXISTS nutrition_goals CASCADE;

-- Enhanced muscle groups table
CREATE TABLE public.muscle_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enhanced exercise categories
CREATE TABLE public.exercise_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color_hex TEXT DEFAULT '#FF6B35',
  icon_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comprehensive exercises table following Phoenix schema
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  instructions JSONB DEFAULT '[]'::jsonb,
  primary_muscle_groups UUID[] DEFAULT '{}',
  secondary_muscle_groups UUID[] DEFAULT '{}',
  equipment_required JSONB DEFAULT '[]'::jsonb,
  exercise_type TEXT DEFAULT 'strength',
  difficulty_level TEXT DEFAULT 'beginner',
  media_assets JSONB,
  met_value NUMERIC DEFAULT 3.5,
  form_cues JSONB DEFAULT '[]'::jsonb,
  common_mistakes JSONB DEFAULT '[]'::jsonb,
  variations JSONB DEFAULT '[]'::jsonb,
  is_bodyweight BOOLEAN DEFAULT false,
  is_unilateral BOOLEAN DEFAULT false,
  requires_spotter BOOLEAN DEFAULT false,
  category_id UUID REFERENCES exercise_categories(id),
  created_by UUID,
  is_approved BOOLEAN DEFAULT false,
  video_url TEXT,
  thumbnail_url TEXT,
  animation_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Check constraints for enums
  CONSTRAINT exercises_exercise_type_check CHECK (exercise_type IN (
    'strength', 'cardio', 'olympic_weightlifting', 'plyometrics', 'powerlifting', 
    'stretching', 'strongman', 'yoga', 'pilates', 'barre', 'boxing', 'hiit', 
    'mobility', 'recovery'
  )),
  CONSTRAINT exercises_difficulty_level_check CHECK (difficulty_level IN ('beginner', 'intermediate', 'expert'))
);

-- Enhanced workout programs table
CREATE TABLE public.workout_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER NOT NULL,
  workouts_per_week INTEGER DEFAULT 3,
  difficulty_level TEXT DEFAULT 'beginner',
  goal TEXT,
  equipment_required JSONB DEFAULT '[]'::jsonb,
  schedule JSONB DEFAULT '{}'::jsonb,
  thumbnail_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT workout_programs_difficulty_level_check CHECK (difficulty_level IN ('beginner', 'intermediate', 'expert'))
);

-- Enhanced workout templates (routines)
CREATE TABLE public.workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  program_id UUID REFERENCES workout_programs(id),
  week_number INTEGER,
  day_number INTEGER,
  estimated_duration INTEGER,
  total_exercises INTEGER DEFAULT 0,
  routine_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enhanced workout exercises (junction table)
CREATE TABLE public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_template_id UUID REFERENCES workout_templates(id),
  exercise_id UUID REFERENCES exercises(id),
  order_index INTEGER NOT NULL,
  sets INTEGER NOT NULL DEFAULT 1,
  reps INTEGER,
  reps_min INTEGER,
  reps_max INTEGER,
  weight_kg NUMERIC,
  duration_seconds INTEGER,
  rest_seconds INTEGER DEFAULT 60,
  superset_group INTEGER,
  is_superset BOOLEAN DEFAULT false,
  is_warmup BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comprehensive foods table following Phoenix schema
CREATE TABLE public.foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT,
  barcode TEXT,
  serving_size_g NUMERIC,
  serving_size_description TEXT,
  calories_per_100g NUMERIC,
  protein_per_100g NUMERIC,
  carbs_per_100g NUMERIC,
  fat_per_100g NUMERIC,
  fiber_per_100g NUMERIC,
  sugar_per_100g NUMERIC,
  sodium_per_100g NUMERIC,
  micronutrients JSONB DEFAULT '{}'::jsonb,
  serving_sizes JSONB DEFAULT '[]'::jsonb,
  dietary_labels JSONB DEFAULT '[]'::jsonb,
  allergen_info JSONB DEFAULT '[]'::jsonb,
  traffic_light_category TEXT DEFAULT 'yellow',
  food_group TEXT,
  category TEXT,
  created_by UUID,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT foods_traffic_light_check CHECK (traffic_light_category IN ('green', 'yellow', 'red'))
);

-- Enhanced nutrition logs
CREATE TABLE public.nutrition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  food_id UUID REFERENCES foods(id),
  custom_food_name TEXT,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL,
  serving_amount NUMERIC NOT NULL,
  serving_unit TEXT NOT NULL,
  calories NUMERIC,
  protein_g NUMERIC,
  carbs_g NUMERIC,
  fat_g NUMERIC,
  fiber_g NUMERIC,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT nutrition_logs_meal_type_check CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack'))
);

-- Enhanced nutrition goals
CREATE TABLE public.nutrition_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  calories_target INTEGER,
  protein_target_g NUMERIC,
  carbs_target_g NUMERIC,
  fat_target_g NUMERIC,
  fiber_target_g NUMERIC,
  water_target_ml INTEGER DEFAULT 2000,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI workout generation logs
CREATE TABLE public.ai_workout_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  user_preferences JSONB DEFAULT '{}'::jsonb,
  generated_workout JSONB NOT NULL,
  model_used TEXT DEFAULT 'gpt-4o-mini',
  tokens_used INTEGER,
  generation_time_ms INTEGER,
  feedback_rating INTEGER,
  feedback_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT ai_workout_feedback_rating_check CHECK (feedback_rating BETWEEN 1 AND 5)
);

-- Recipe system
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER DEFAULT 1,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_nutrition JSONB DEFAULT '{}'::jsonb,
  image_url TEXT,
  difficulty_level TEXT DEFAULT 'easy',
  cuisine_type TEXT,
  dietary_labels JSONB DEFAULT '[]'::jsonb,
  created_by UUID,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT recipes_difficulty_level_check CHECK (difficulty_level IN ('easy', 'medium', 'hard'))
);

-- Enhanced SEP tracking with activity types
CREATE TABLE public.sep_activity_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  base_points NUMERIC NOT NULL,
  icon_name TEXT,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Event system for event-driven architecture
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_id UUID,
  processed BOOLEAN DEFAULT false,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  scheduled_for TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_exercises_primary_muscle_groups ON exercises USING GIN(primary_muscle_groups);
CREATE INDEX idx_exercises_equipment_required ON exercises USING GIN(equipment_required);
CREATE INDEX idx_exercises_exercise_type ON exercises(exercise_type);
CREATE INDEX idx_exercises_difficulty_level ON exercises(difficulty_level);
CREATE INDEX idx_nutrition_logs_user_date ON nutrition_logs(user_id, date);
CREATE INDEX idx_nutrition_logs_meal_type ON nutrition_logs(meal_type);
CREATE INDEX idx_events_processed ON events(processed) WHERE NOT processed;
CREATE INDEX idx_events_scheduled_for ON events(scheduled_for) WHERE NOT processed;
CREATE INDEX idx_ai_workout_generations_user_id ON ai_workout_generations(user_id);

-- Enable RLS on all tables
ALTER TABLE public.muscle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_workout_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sep_activity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reference data (public read)
CREATE POLICY "Anyone can view muscle groups" ON muscle_groups FOR SELECT USING (true);
CREATE POLICY "Anyone can view exercise categories" ON exercise_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view approved exercises" ON exercises FOR SELECT USING (is_approved = true);
CREATE POLICY "Anyone can view approved workout programs" ON workout_programs FOR SELECT USING (true);
CREATE POLICY "Anyone can view workout templates" ON workout_templates FOR SELECT USING (true);
CREATE POLICY "Anyone can view workout exercises" ON workout_exercises FOR SELECT USING (true);
CREATE POLICY "Anyone can view verified foods" ON foods FOR SELECT USING (is_verified = true);
CREATE POLICY "Anyone can view sep activity types" ON sep_activity_types FOR SELECT USING (true);
CREATE POLICY "Anyone can view verified recipes" ON recipes FOR SELECT USING (is_verified = true);

-- RLS Policies for user-specific data
CREATE POLICY "Users can manage their own nutrition logs" ON nutrition_logs FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own nutrition goals" ON nutrition_goals FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can view their own AI workout generations" ON ai_workout_generations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create AI workout generations" ON ai_workout_generations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own AI workout generations" ON ai_workout_generations FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for content creation
CREATE POLICY "Users can create foods" ON foods FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can create their own workout programs" ON workout_programs FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update their own workout programs" ON workout_programs FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Users can create recipes" ON recipes FOR INSERT WITH CHECK (created_by = auth.uid());

-- Event system policies
CREATE POLICY "System can manage events" ON events FOR ALL USING (true);

-- Insert foundational data
INSERT INTO muscle_groups (name, description) VALUES
('chest', 'Pectoralis major and minor muscles'),
('back', 'Latissimus dorsi, rhomboids, and trapezius'),
('shoulders', 'Deltoids (anterior, medial, posterior)'),
('biceps', 'Biceps brachii'),
('triceps', 'Triceps brachii'),
('forearms', 'Forearm flexors and extensors'),
('abs', 'Rectus abdominis, obliques, transverse abdominis'),
('glutes', 'Gluteus maximus, medius, and minimus'),
('quadriceps', 'Quadriceps femoris muscle group'),
('hamstrings', 'Biceps femoris, semitendinosus, semimembranosus'),
('calves', 'Gastrocnemius and soleus'),
('traps', 'Trapezius muscle'),
('lats', 'Latissimus dorsi'),
('lower_back', 'Erector spinae and other lower back muscles');

INSERT INTO exercise_categories (name, description, color_hex, icon_name) VALUES
('strength', 'Resistance training exercises', '#FF6B35', 'Dumbbell'),
('cardio', 'Cardiovascular endurance exercises', '#FF3366', 'Heart'),
('flexibility', 'Stretching and mobility exercises', '#33FF66', 'Users'),
('plyometrics', 'Explosive power exercises', '#FFD700', 'Zap'),
('yoga', 'Yoga poses and flows', '#9966FF', 'Flower'),
('hiit', 'High-intensity interval training', '#FF0000', 'Timer'),
('sports', 'Sport-specific movements', '#00CCFF', 'Trophy');

INSERT INTO sep_activity_types (name, description, base_points, icon_name, category) VALUES
('workout_completion', 'Complete a full workout session', 100, 'dumbbell', 'fitness'),
('personal_record', 'Achieve a new personal record', 200, 'trophy', 'achievement'),
('nutrition_logging', 'Log a complete meal with macros', 25, 'apple', 'nutrition'),
('daily_goal_met', 'Meet daily nutrition or fitness goals', 50, 'target', 'goals'),
('streak_milestone', 'Maintain activity streak milestone', 150, 'flame', 'consistency'),
('ai_workout_feedback', 'Provide feedback on AI-generated workout', 10, 'star', 'engagement'),
('recipe_creation', 'Create and share a verified recipe', 75, 'chef-hat', 'community'),
('challenge_participation', 'Participate in community challenges', 125, 'users', 'social');

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workout_programs_updated_at BEFORE UPDATE ON workout_programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workout_templates_updated_at BEFORE UPDATE ON workout_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_foods_updated_at BEFORE UPDATE ON foods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nutrition_goals_updated_at BEFORE UPDATE ON nutrition_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();