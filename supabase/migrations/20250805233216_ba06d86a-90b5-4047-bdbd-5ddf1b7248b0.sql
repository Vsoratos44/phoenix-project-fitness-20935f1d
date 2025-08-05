-- Enhanced Exercise Library with Biomechanical Data
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS biomechanical_data JSONB DEFAULT '{}';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS contraindications JSONB DEFAULT '[]';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS muscle_activation_data JSONB DEFAULT '{}';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS movement_patterns JSONB DEFAULT '[]';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS form_cues JSONB DEFAULT '[]';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS common_mistakes JSONB DEFAULT '[]';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS progression_options JSONB DEFAULT '[]';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS regression_options JSONB DEFAULT '[]';

-- Workout Archetypes for Intelligent Selection
CREATE TABLE IF NOT EXISTS workout_archetypes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    primary_goals TEXT[] DEFAULT '{}',
    fitness_level_range TEXT[] DEFAULT '{}',
    phoenix_score_range JSONB DEFAULT '{"min": 0, "max": 100}',
    structure_template JSONB NOT NULL,
    metabolic_emphasis DECIMAL DEFAULT 0.5,
    strength_emphasis DECIMAL DEFAULT 0.5,
    estimated_duration_minutes INTEGER DEFAULT 45,
    equipment_requirements TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercise Performance History for Progressive Overload
CREATE TABLE IF NOT EXISTS exercise_performance_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    exercise_id UUID REFERENCES exercises(id),
    workout_session_id UUID,
    performance_date DATE NOT NULL,
    sets_completed INTEGER,
    reps_completed INTEGER,
    weight_used_kg DECIMAL,
    duration_seconds INTEGER,
    rpe_rating INTEGER CHECK (rpe_rating BETWEEN 1 AND 10),
    form_score INTEGER CHECK (form_score BETWEEN 1 AND 10),
    rest_period_seconds INTEGER,
    time_under_tension_seconds INTEGER,
    progressive_overload_applied BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Injury History and Contraindications
CREATE TABLE IF NOT EXISTS injury_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    body_part TEXT NOT NULL,
    injury_type TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('minor', 'moderate', 'severe')),
    date_occurred DATE,
    status TEXT CHECK (status IN ('active', 'recovered', 'managing')) DEFAULT 'active',
    restrictions JSONB DEFAULT '[]',
    recommended_modifications JSONB DEFAULT '[]',
    recovery_timeline_weeks INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Movement Restrictions Mapping
CREATE TABLE IF NOT EXISTS movement_restrictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    movement_pattern TEXT NOT NULL,
    restriction_type TEXT CHECK (restriction_type IN ('avoid', 'modify', 'limit_range', 'reduce_load')),
    details TEXT,
    affected_exercises TEXT[],
    alternative_movements TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time Adaptation Logs
CREATE TABLE IF NOT EXISTS workout_adaptations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    workout_session_id UUID,
    exercise_id UUID REFERENCES exercises(id),
    adaptation_type TEXT NOT NULL,
    feedback_data JSONB NOT NULL,
    adaptation_applied JSONB NOT NULL,
    reasoning TEXT,
    coaching_message TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Progressive Overload Tracking
CREATE TABLE IF NOT EXISTS progressive_overload_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    exercise_id UUID REFERENCES exercises(id),
    previous_weight_kg DECIMAL,
    new_weight_kg DECIMAL,
    previous_reps INTEGER,
    new_reps INTEGER,
    progression_type TEXT CHECK (progression_type IN ('weight_increase', 'rep_increase', 'set_increase', 'deload')),
    progression_percentage DECIMAL,
    success_rate DECIMAL,
    applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced Phoenix Scores with Factors
ALTER TABLE phoenix_scores ADD COLUMN IF NOT EXISTS hrv_score INTEGER;
ALTER TABLE phoenix_scores ADD COLUMN IF NOT EXISTS training_load_score INTEGER;
ALTER TABLE phoenix_scores ADD COLUMN IF NOT EXISTS factors JSONB DEFAULT '{}';
ALTER TABLE phoenix_scores ADD COLUMN IF NOT EXISTS suggested_intensity TEXT;
ALTER TABLE phoenix_scores ADD COLUMN IF NOT EXISTS recommendation TEXT;

-- Workout Generation Logs for Learning
CREATE TABLE IF NOT EXISTS workout_generation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    archetype_used TEXT,
    generation_parameters JSONB NOT NULL,
    workout_data JSONB NOT NULL,
    phoenix_score_at_generation INTEGER,
    user_feedback JSONB,
    effectiveness_score DECIMAL,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercise Contraindication Mapping
CREATE TABLE IF NOT EXISTS exercise_contraindications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID REFERENCES exercises(id),
    condition_type TEXT NOT NULL,
    severity_level TEXT CHECK (severity_level IN ('low', 'moderate', 'high', 'absolute')),
    description TEXT,
    alternative_exercises TEXT[],
    modifications JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_exercise_performance_user_exercise ON exercise_performance_history(user_id, exercise_id, performance_date);
CREATE INDEX IF NOT EXISTS idx_injury_history_user_active ON injury_history(user_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_workout_adaptations_session ON workout_adaptations(workout_session_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_progressive_overload_user_exercise ON progressive_overload_logs(user_id, exercise_id, applied_at);
CREATE INDEX IF NOT EXISTS idx_workout_archetypes_goals ON workout_archetypes USING GIN(primary_goals);
CREATE INDEX IF NOT EXISTS idx_exercise_contraindications_exercise ON exercise_contraindications(exercise_id);

-- Row Level Security Policies
ALTER TABLE workout_archetypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_performance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE injury_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE movement_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_adaptations ENABLE ROW LEVEL SECURITY;
ALTER TABLE progressive_overload_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_contraindications ENABLE ROW LEVEL SECURITY;

-- Policies for workout_archetypes (public read)
CREATE POLICY "Anyone can view workout archetypes" ON workout_archetypes FOR SELECT USING (true);

-- Policies for exercise_performance_history
CREATE POLICY "Users can manage their own performance history" ON exercise_performance_history FOR ALL USING (user_id = auth.uid());

-- Policies for injury_history
CREATE POLICY "Users can manage their own injury history" ON injury_history FOR ALL USING (user_id = auth.uid());

-- Policies for movement_restrictions
CREATE POLICY "Users can manage their own movement restrictions" ON movement_restrictions FOR ALL USING (user_id = auth.uid());

-- Policies for workout_adaptations
CREATE POLICY "Users can view their own workout adaptations" ON workout_adaptations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can create workout adaptations" ON workout_adaptations FOR INSERT WITH CHECK (true);

-- Policies for progressive_overload_logs
CREATE POLICY "Users can view their own progressive overload logs" ON progressive_overload_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can create progressive overload logs" ON progressive_overload_logs FOR INSERT WITH CHECK (true);

-- Policies for workout_generation_logs
CREATE POLICY "Users can manage their own workout generation logs" ON workout_generation_logs FOR ALL USING (user_id = auth.uid());

-- Policies for exercise_contraindications (public read)
CREATE POLICY "Anyone can view exercise contraindications" ON exercise_contraindications FOR SELECT USING (true);

-- Insert sample workout archetypes
INSERT INTO workout_archetypes (name, description, primary_goals, fitness_level_range, phoenix_score_range, structure_template, metabolic_emphasis, strength_emphasis) VALUES
('Metabolic Torch', 'High-intensity metabolic conditioning for maximum calorie burn', ARRAY['lose_weight'], ARRAY['intermediate', 'advanced'], '{"min": 70, "max": 100}', '{"blocks": ["dynamic_warmup", "strength_superset", "metabolic_circuit", "cooldown"]}', 0.8, 0.4),
('Strength Builder', 'Progressive strength training with metabolic finishers', ARRAY['build_muscle', 'increase_strength'], ARRAY['intermediate', 'advanced'], '{"min": 60, "max": 100}', '{"blocks": ["activation_warmup", "compound_strength", "accessory_work", "cooldown"]}', 0.3, 0.9),
('Endurance Engine', 'Cardiovascular conditioning with strength support', ARRAY['improve_endurance'], ARRAY['beginner', 'intermediate'], '{"min": 50, "max": 90}', '{"blocks": ["progressive_warmup", "aerobic_strength", "cardio_intervals", "recovery_cooldown"]}', 0.7, 0.4),
('Recovery Flow', 'Active recovery and mobility for regeneration', ARRAY['general_fitness'], ARRAY['beginner', 'intermediate', 'advanced'], '{"min": 0, "max": 50}', '{"blocks": ["gentle_warmup", "mobility_flow", "deep_stretch"]}', 0.2, 0.1),
('Power Athlete', 'Explosive power development with strength base', ARRAY['sport_performance'], ARRAY['advanced'], '{"min": 80, "max": 100}', '{"blocks": ["neural_activation", "power_development", "strength_maintenance", "cooldown"]}', 0.6, 0.8);

-- Insert sample exercise contraindications
INSERT INTO exercise_contraindications (exercise_id, condition_type, severity_level, description, alternative_exercises) 
SELECT id, 'knee_injury', 'high', 'Avoid deep knee flexion exercises', ARRAY['leg_press', 'wall_sit'] 
FROM exercises WHERE name ILIKE '%squat%' LIMIT 5;

INSERT INTO exercise_contraindications (exercise_id, condition_type, severity_level, description, alternative_exercises)
SELECT id, 'lower_back_pain', 'high', 'Avoid spinal loading exercises', ARRAY['chest_supported_row', 'seated_cable_row']
FROM exercises WHERE name ILIKE '%deadlift%' LIMIT 3;