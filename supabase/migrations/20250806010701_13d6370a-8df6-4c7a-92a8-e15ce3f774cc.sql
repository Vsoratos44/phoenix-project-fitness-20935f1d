-- Enhanced Exercise Database Migration - Medical Grade Fitness System
-- Phase 1: Create new enums and types

CREATE TYPE exercise_modality AS ENUM (
    'bodyweight', 'free_weights', 'kettlebell', 'suspension',
    'resistance_bands', 'medicine_ball', 'plyometric',
    'cardiovascular', 'flexibility', 'rehabilitation'
);

CREATE TYPE movement_pattern AS ENUM (
    'squat', 'hinge', 'lunge', 'push_horizontal', 'push_vertical',
    'pull_horizontal', 'pull_vertical', 'carry', 'rotation',
    'anti_extension', 'anti_rotation', 'anti_lateral_flexion'
);

CREATE TYPE energy_system AS ENUM (
    'atp_cp',        -- 0-10 seconds
    'glycolytic',    -- 10-90 seconds  
    'aerobic'        -- 2+ minutes
);

CREATE TYPE compatibility_level AS ENUM (
    'safe', 'caution', 'modify_required', 'contraindicated'
);

CREATE TYPE evidence_level AS ENUM (
    'high', 'moderate', 'low', 'expert_opinion'
);

-- Enhanced exercise entity with medical-grade features
CREATE TABLE enhanced_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Info (maintain compatibility with existing exercises table)
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    modality exercise_modality DEFAULT 'bodyweight',
    
    -- Movement Classification
    movement_patterns movement_pattern[],
    primary_muscles TEXT[],
    secondary_muscles TEXT[],
    equipment_required TEXT[],
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5) DEFAULT 1,
    
    -- Medical Grade Safety Features
    contraindications TEXT[] DEFAULT '{}',
    injury_risk_factors TEXT[] DEFAULT '{}',
    movement_restrictions TEXT[] DEFAULT '{}',
    
    -- Progression Framework
    prerequisites JSONB DEFAULT '[]',
    progression_pathway JSONB DEFAULT '[]',
    regression_options TEXT[] DEFAULT '{}',
    mastery_criteria JSONB DEFAULT '{}',
    
    -- Scientific Foundation
    biomechanical_demands JSONB DEFAULT '{}',
    energy_system_emphasis energy_system[] DEFAULT '{}',
    research_evidence evidence_level DEFAULT 'expert_opinion',
    
    -- Coaching Integration
    instruction_steps TEXT[] DEFAULT '{}',
    form_cues TEXT[] DEFAULT '{}',
    common_mistakes TEXT[] DEFAULT '{}',
    safety_notes TEXT[] DEFAULT '{}',
    
    -- Smart Programming
    volume_guidelines JSONB DEFAULT '{}',
    intensity_recommendations JSONB DEFAULT '{}',
    frequency_recommendations JSONB DEFAULT '{}',
    
    -- Adaptive Features
    modifications JSONB DEFAULT '[]',
    equipment_alternatives JSONB DEFAULT '[]',
    environmental_adaptations JSONB DEFAULT '[]',
    
    -- Media and Validation
    video_url TEXT,
    thumbnail_url TEXT,
    animation_url TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_by UUID,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercise Prerequisites and Progressions
CREATE TABLE exercise_progressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID REFERENCES enhanced_exercises(id) ON DELETE CASCADE,
    prerequisite_exercise_id UUID REFERENCES enhanced_exercises(id) ON DELETE CASCADE,
    progression_level INTEGER NOT NULL,
    mastery_requirements JSONB DEFAULT '{}',
    target_volume JSONB DEFAULT '{}',
    mastery_time_weeks INTEGER DEFAULT 2,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(exercise_id, prerequisite_exercise_id)
);

-- Medical Exercise Compatibility Matrix
CREATE TABLE medical_exercise_compatibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_condition TEXT NOT NULL,
    exercise_id UUID REFERENCES enhanced_exercises(id) ON DELETE CASCADE,
    compatibility_level compatibility_level NOT NULL,
    required_modifications JSONB DEFAULT '{}',
    alternative_exercises UUID[] DEFAULT '{}',
    evidence_level evidence_level DEFAULT 'expert_opinion',
    medical_reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(medical_condition, exercise_id)
);

-- Enhanced Performance Tracking with Progression Markers
CREATE TABLE enhanced_performance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    exercise_id UUID REFERENCES enhanced_exercises(id) ON DELETE CASCADE,
    workout_session_id UUID,
    
    -- Performance Data
    sets_completed INTEGER DEFAULT 0,
    reps_completed INTEGER[] DEFAULT '{}',
    load_used_kg DECIMAL DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    rpe_scores INTEGER[] DEFAULT '{}',
    average_rpe DECIMAL,
    form_score INTEGER CHECK (form_score BETWEEN 1 AND 10),
    completion_rate DECIMAL CHECK (completion_rate BETWEEN 0 AND 1.5) DEFAULT 1.0,
    
    -- Progression Markers
    progression_level INTEGER DEFAULT 1,
    mastery_achieved BOOLEAN DEFAULT FALSE,
    progression_notes TEXT,
    
    -- Biomechanical Data
    range_of_motion_score INTEGER CHECK (range_of_motion_score BETWEEN 1 AND 10),
    movement_quality_score INTEGER CHECK (movement_quality_score BETWEEN 1 AND 10),
    
    -- Analysis
    progressive_overload_applied BOOLEAN DEFAULT false,
    performance_trend TEXT, -- 'improving', 'maintaining', 'declining'
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercise Templates with Medical Integration
CREATE TABLE exercise_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    target_goals TEXT[],
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    
    -- Template Structure
    exercise_sequence JSONB NOT NULL, -- Array of exercise IDs with programming
    total_duration_minutes INTEGER,
    equipment_requirements TEXT[],
    
    -- Medical Considerations
    contraindicated_conditions TEXT[] DEFAULT '{}',
    recommended_for_conditions TEXT[] DEFAULT '{}',
    medical_clearance_required BOOLEAN DEFAULT false,
    
    -- Programming
    periodization_phase TEXT, -- 'hypertrophy', 'strength', 'power', 'endurance'
    target_adaptations TEXT[],
    
    created_by UUID,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Exercise Mastery Tracking
CREATE TABLE user_exercise_mastery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    exercise_id UUID REFERENCES enhanced_exercises(id) ON DELETE CASCADE,
    
    -- Mastery Status
    current_progression_level INTEGER DEFAULT 1,
    mastery_achieved BOOLEAN DEFAULT false,
    mastery_date DATE,
    
    -- Performance Metrics
    best_performance JSONB DEFAULT '{}',
    consistency_score DECIMAL DEFAULT 0, -- 0-1 based on regular performance
    technique_score DECIMAL DEFAULT 0,   -- 0-1 based on form assessments
    
    -- Progression History
    progression_history JSONB DEFAULT '[]', -- Track level changes over time
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, exercise_id)
);

-- Enable RLS on all new tables
ALTER TABLE enhanced_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_progressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_exercise_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_mastery ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Enhanced Exercises
CREATE POLICY "Anyone can view approved enhanced exercises" 
ON enhanced_exercises FOR SELECT 
USING (is_approved = true);

CREATE POLICY "Authenticated users can create enhanced exercises" 
ON enhanced_exercises FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- RLS Policies for Exercise Progressions  
CREATE POLICY "Anyone can view exercise progressions" 
ON exercise_progressions FOR SELECT 
USING (true);

-- RLS Policies for Medical Compatibility
CREATE POLICY "Anyone can view medical exercise compatibility" 
ON medical_exercise_compatibility FOR SELECT 
USING (true);

-- RLS Policies for Enhanced Performance Logs
CREATE POLICY "Users can manage their own performance logs" 
ON enhanced_performance_logs FOR ALL 
USING (user_id = auth.uid());

-- RLS Policies for Exercise Templates
CREATE POLICY "Anyone can view approved exercise templates" 
ON exercise_templates FOR SELECT 
USING (is_approved = true);

CREATE POLICY "Users can create exercise templates" 
ON exercise_templates FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- RLS Policies for User Exercise Mastery
CREATE POLICY "Users can manage their own exercise mastery" 
ON user_exercise_mastery FOR ALL 
USING (user_id = auth.uid());

-- Update trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_enhanced_exercises_updated_at 
    BEFORE UPDATE ON enhanced_exercises 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_exercise_compatibility_updated_at 
    BEFORE UPDATE ON medical_exercise_compatibility 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_templates_updated_at 
    BEFORE UPDATE ON exercise_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_exercise_mastery_updated_at 
    BEFORE UPDATE ON user_exercise_mastery 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();