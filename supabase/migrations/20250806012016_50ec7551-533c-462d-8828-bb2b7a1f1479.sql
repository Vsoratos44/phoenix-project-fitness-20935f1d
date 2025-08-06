-- Populate Enhanced Exercises Database with Comprehensive Exercise Data
-- Phase 1: Bodyweight Progression Chains

-- Insert comprehensive push-up progression chain
INSERT INTO enhanced_exercises (
    name, description, category, modality, movement_patterns, primary_muscles, secondary_muscles,
    equipment_required, difficulty_level, contraindications, injury_risk_factors,
    prerequisites, progression_pathway, mastery_criteria, biomechanical_demands,
    energy_system_emphasis, research_evidence, instruction_steps, form_cues, common_mistakes,
    safety_notes, volume_guidelines, intensity_recommendations, modifications,
    equipment_alternatives, is_approved
) VALUES 
-- Level 1: Wall Push-up
(
    'Wall Push-up', 
    'Beginner-friendly push-up performed against a wall, perfect for building initial upper body strength and learning movement pattern.',
    'Foundational',
    'bodyweight',
    ARRAY['push_horizontal']::movement_pattern[],
    ARRAY['chest', 'triceps'],
    ARRAY['shoulders', 'core'],
    ARRAY[]::TEXT[],
    1,
    ARRAY[]::TEXT[],
    ARRAY['wrist_pain', 'shoulder_impingement']::TEXT[],
    '[]'::JSONB,
    '[
        {
            "level": 1,
            "name": "Wall Push-up Mastery",
            "description": "Master wall push-up form and endurance",
            "requirements": ["15-20 consecutive reps", "proper form", "controlled movement"],
            "target_volume": {"sets": 3, "reps": "10-15"},
            "mastery_time_weeks": 1,
            "next_progression_criteria": ["form_score >= 8", "no movement compensations"]
        }
    ]'::JSONB,
    '{
        "minimum_reps": 15,
        "consecutive_sessions_required": 3,
        "form_score_threshold": 8,
        "performance_metrics": ["range_of_motion", "tempo_control", "alignment"]
    }'::JSONB,
    '{
        "joint_angles": {
            "shoulder_flexion": {"min": 0, "max": 90, "optimal": 45},
            "elbow_flexion": {"min": 0, "max": 90, "optimal": 45}
        },
        "force_vectors": ["horizontal_push"],
        "stability_requirements": ["core_engagement", "scapular_stability"],
        "coordination_complexity": 1,
        "motor_learning_time": 1
    }'::JSONB,
    ARRAY['atp_cp']::energy_system[],
    'high',
    ARRAY[
        'Stand arm''s length from wall',
        'Place palms flat against wall at shoulder height',
        'Step back until arms are extended',
        'Keep body in straight line',
        'Push body away from wall',
        'Return to starting position with control'
    ]::TEXT[],
    ARRAY[
        'Keep body straight as a plank',
        'Push through palms, not fingertips',
        'Control the movement both ways',
        'Keep head in neutral position',
        'Engage core throughout'
    ]::TEXT[],
    ARRAY[
        'Allowing hips to sag',
        'Pushing only with arms',
        'Moving too fast',
        'Placing hands too high or low',
        'Not maintaining full range of motion'
    ]::TEXT[],
    ARRAY[
        'Start with shorter range if needed',
        'Stop if experiencing wrist or shoulder pain',
        'Focus on quality over quantity'
    ]::TEXT[],
    '{
        "beginner": {"sets": "2-3", "reps": "8-12", "frequency_per_week": 3},
        "progression": {"sets": "3", "reps": "15-20", "frequency_per_week": 4}
    }'::JSONB,
    '{
        "endurance": {"rpe_range": "4-6", "tempo": "2-1-2"},
        "strength": {"rpe_range": "6-7", "tempo": "3-1-3"}
    }'::JSONB,
    '[
        {
            "condition": "wrist_pain",
            "modification_type": "equipment",
            "description": "Use push-up handles or fists",
            "alternative_exercise_id": null
        }
    ]'::JSONB,
    '[
        {
            "equipment": "push_up_handles",
            "benefit": "Reduces wrist strain",
            "difficulty_change": 0
        }
    ]'::JSONB,
    true
),

-- Level 2: Incline Push-up
(
    'Incline Push-up',
    'Push-up performed on an elevated surface, reducing body weight load while maintaining proper movement pattern.',
    'Foundational',
    'bodyweight',
    ARRAY['push_horizontal']::movement_pattern[],
    ARRAY['chest', 'triceps'],
    ARRAY['shoulders', 'core'],
    ARRAY['bench', 'step']::TEXT[],
    2,
    ARRAY['shoulder_injury']::TEXT[],
    ARRAY['wrist_pain', 'shoulder_impingement']::TEXT[],
    '[{"exercise_id": "wall_pushup", "requirement": {"type": "reps", "value": 15}}]'::JSONB,
    '[
        {
            "level": 2,
            "name": "Incline Push-up Progression",
            "description": "Progress from high to low incline",
            "requirements": ["12-15 reps on current height", "perfect form"],
            "target_volume": {"sets": 3, "reps": "10-12"},
            "mastery_time_weeks": 2,
            "next_progression_criteria": ["consistent_performance", "ready_for_lower_incline"]
        }
    ]'::JSONB,
    '{
        "minimum_reps": 12,
        "consecutive_sessions_required": 3,
        "form_score_threshold": 8,
        "performance_metrics": ["depth_consistency", "body_alignment", "control"]
    }'::JSONB,
    '{
        "joint_angles": {
            "shoulder_flexion": {"min": 0, "max": 110, "optimal": 75},
            "elbow_flexion": {"min": 0, "max": 90, "optimal": 60}
        },
        "force_vectors": ["angled_push"],
        "stability_requirements": ["full_body_tension", "scapular_control"],
        "coordination_complexity": 2,
        "motor_learning_time": 2
    }'::JSONB,
    ARRAY['atp_cp', 'glycolytic']::energy_system[],
    'high',
    ARRAY[
        'Place hands on elevated surface (bench, step, etc.)',
        'Walk feet back until body is straight',
        'Lower chest toward surface with control',
        'Push up to starting position',
        'Maintain straight body line throughout'
    ]::TEXT[],
    ARRAY[
        'Higher surface = easier, lower = harder',
        'Keep core tight throughout movement',
        'Full range of motion to surface',
        'Control both up and down phases',
        'Keep elbows at 45-degree angle'
    ]::TEXT[],
    ARRAY[
        'Sagging hips or raised butt',
        'Partial range of motion',
        'Flaring elbows too wide',
        'Bouncing off the surface',
        'Inconsistent hand placement'
    ]::TEXT[],
    ARRAY[
        'Start with higher surface if needed',
        'Progress by lowering surface height gradually',
        'Focus on perfect form before progression'
    ]::TEXT[],
    '{
        "beginner": {"sets": "2-3", "reps": "8-10", "frequency_per_week": 3},
        "intermediate": {"sets": "3-4", "reps": "12-15", "frequency_per_week": 4}
    }'::JSONB,
    '{
        "strength": {"rpe_range": "6-8", "tempo": "2-1-2"},
        "endurance": {"rpe_range": "5-7", "tempo": "1-1-1"}
    }'::JSONB,
    '[
        {
            "condition": "shoulder_pain",
            "modification_type": "range_of_motion",
            "description": "Reduce range to pain-free zone",
            "alternative_exercise_id": "wall_pushup"
        }
    ]'::JSONB,
    '[
        {
            "equipment": "resistance_bands",
            "benefit": "Assisted resistance",
            "difficulty_change": -1
        }
    ]'::JSONB,
    true
),

-- Level 3: Knee Push-up
(
    'Knee Push-up',
    'Modified push-up performed from knees, reducing load while building toward full push-up strength.',
    'Foundational',
    'bodyweight',
    ARRAY['push_horizontal']::movement_pattern[],
    ARRAY['chest', 'triceps'],
    ARRAY['shoulders', 'core'],
    ARRAY[]::TEXT[],
    2,
    ARRAY['knee_injury', 'wrist_injury']::TEXT[],
    ARRAY['knee_pain', 'wrist_pain']::TEXT[],
    '[{"exercise_id": "incline_pushup", "requirement": {"type": "reps", "value": 12}}]'::JSONB,
    '[
        {
            "level": 3,
            "name": "Knee Push-up Mastery",
            "description": "Build strength for full push-up",
            "requirements": ["15 consecutive reps", "full range of motion"],
            "target_volume": {"sets": 3, "reps": "10-15"},
            "mastery_time_weeks": 3,
            "next_progression_criteria": ["strength_benchmark_met", "form_consistency"]
        }
    ]'::JSONB,
    '{
        "minimum_reps": 15,
        "consecutive_sessions_required": 4,
        "form_score_threshold": 8,
        "performance_metrics": ["chest_to_floor_distance", "tempo_control", "alignment"]
    }'::JSONB,
    '{
        "joint_angles": {
            "shoulder_flexion": {"min": 0, "max": 120, "optimal": 90},
            "elbow_flexion": {"min": 0, "max": 90, "optimal": 75}
        },
        "force_vectors": ["horizontal_push", "anti_extension"],
        "stability_requirements": ["core_stability", "shoulder_stability"],
        "coordination_complexity": 3,
        "motor_learning_time": 3
    }'::JSONB,
    ARRAY['atp_cp', 'glycolytic']::energy_system[],
    'high',
    ARRAY[
        'Start in plank position on knees',
        'Keep body straight from knees to head',
        'Lower chest toward floor with control',
        'Push up to starting position',
        'Maintain neutral spine throughout'
    ]::TEXT[],
    ARRAY[
        'Keep hips in line with shoulders',
        'Lower until chest nearly touches floor',
        'Push through whole palm',
        'Keep core engaged',
        'Control the tempo'
    ]::TEXT[],
    ARRAY[
        'Allowing hips to sag or pike up',
        'Partial range of motion',
        'Moving too quickly',
        'Not engaging core',
        'Placing hands too wide or narrow'
    ]::TEXT[],
    ARRAY[
        'Use knee pad if knees are sensitive',
        'Focus on quality over quantity',
        'Progress gradually to full push-ups'
    ]::TEXT[],
    '{
        "beginner": {"sets": "2-3", "reps": "6-10", "frequency_per_week": 3},
        "intermediate": {"sets": "3-4", "reps": "12-18", "frequency_per_week": 4}
    }'::JSONB,
    '{
        "strength": {"rpe_range": "7-8", "tempo": "2-1-2"},
        "endurance": {"rpe_range": "6-7", "tempo": "1-1-1"}
    }'::JSONB,
    '[
        {
            "condition": "knee_pain",
            "modification_type": "equipment",
            "description": "Use thick mat or cushion under knees",
            "alternative_exercise_id": "incline_pushup"
        }
    ]'::JSONB,
    '[
        {
            "equipment": "knee_pad",
            "benefit": "Knee protection",
            "difficulty_change": 0
        }
    ]'::JSONB,
    true
),

-- Level 4: Standard Push-up
(
    'Standard Push-up',
    'The classic full-body push-up, fundamental upper body strength exercise targeting chest, shoulders, and triceps.',
    'Compound',
    'bodyweight',
    ARRAY['push_horizontal']::movement_pattern[],
    ARRAY['chest', 'triceps', 'shoulders'],
    ARRAY['core', 'serratus_anterior'],
    ARRAY[]::TEXT[],
    3,
    ARRAY['shoulder_injury', 'wrist_injury', 'lower_back_injury']::TEXT[],
    ARRAY['shoulder_impingement', 'wrist_pain', 'lower_back_pain']::TEXT[],
    '[{"exercise_id": "knee_pushup", "requirement": {"type": "reps", "value": 15}}]'::JSONB,
    '[
        {
            "level": 4,
            "name": "Push-up Strength Building",
            "description": "Build endurance and strength in standard push-up",
            "requirements": ["10-15 consecutive reps", "perfect form"],
            "target_volume": {"sets": 3, "reps": "8-12"},
            "mastery_time_weeks": 4,
            "next_progression_criteria": ["15_reps_achieved", "ready_for_variations"]
        }
    ]'::JSONB,
    '{
        "minimum_reps": 10,
        "consecutive_sessions_required": 5,
        "form_score_threshold": 9,
        "performance_metrics": ["full_range_motion", "body_alignment", "tempo_control"]
    }'::JSONB,
    '{
        "joint_angles": {
            "shoulder_flexion": {"min": 0, "max": 120, "optimal": 100},
            "elbow_flexion": {"min": 0, "max": 90, "optimal": 80}
        },
        "force_vectors": ["horizontal_push", "anti_extension", "anti_rotation"],
        "stability_requirements": ["full_body_tension", "core_stability", "shoulder_stability"],
        "coordination_complexity": 4,
        "motor_learning_time": 4
    }'::JSONB,
    ARRAY['atp_cp', 'glycolytic']::energy_system[],
    'high',
    ARRAY[
        'Start in high plank position',
        'Keep body straight from head to heels',
        'Lower body as one unit toward floor',
        'Push up maintaining straight line',
        'Repeat with controlled movement'
    ]::TEXT[],
    ARRAY[
        'Body should move as one rigid unit',
        'Lower until chest nearly touches floor',
        'Keep elbows at 45-degree angle',
        'Maintain neutral head position',
        'Breathe out on the push up'
    ]::TEXT[],
    ARRAY[
        'Sagging hips or raised butt',
        'Incomplete range of motion',
        'Head leading the movement',
        'Holding breath',
        'Flaring elbows too wide'
    ]::TEXT[],
    ARRAY[
        'Master form before increasing reps',
        'Stop if form breaks down',
        'Progress gradually',
        'Focus on quality movement'
    ]::TEXT[],
    '{
        "beginner": {"sets": "2-3", "reps": "5-8", "frequency_per_week": 3},
        "intermediate": {"sets": "3-4", "reps": "10-15", "frequency_per_week": 4},
        "advanced": {"sets": "4-5", "reps": "15-25", "frequency_per_week": 4}
    }'::JSONB,
    '{
        "strength": {"rpe_range": "7-9", "tempo": "2-1-2"},
        "endurance": {"rpe_range": "6-8", "tempo": "1-1-1"},
        "power": {"rpe_range": "8-9", "tempo": "explosive-1-2"}
    }'::JSONB,
    '[
        {
            "condition": "wrist_pain",
            "modification_type": "equipment",
            "description": "Use push-up handles or perform on fists",
            "alternative_exercise_id": "knee_pushup"
        },
        {
            "condition": "shoulder_pain",
            "modification_type": "range_of_motion",
            "description": "Reduce range to pain-free zone",
            "alternative_exercise_id": "incline_pushup"
        }
    ]'::JSONB,
    '[
        {
            "equipment": "push_up_handles",
            "benefit": "Wrist protection and deeper range",
            "difficulty_change": 0
        },
        {
            "equipment": "resistance_bands",
            "benefit": "Assisted or resisted variations",
            "difficulty_change": -1
        }
    ]'::JSONB,
    true
);

-- Insert medical exercise compatibility data
INSERT INTO medical_exercise_compatibility (
    medical_condition, exercise_id, compatibility_level, required_modifications, 
    alternative_exercises, evidence_level, medical_reasoning
) VALUES 
-- Knee injury compatibilities
(
    'knee_injury',
    (SELECT id FROM enhanced_exercises WHERE name = 'Wall Push-up'),
    'safe',
    '{}',
    ARRAY[]::UUID[],
    'high',
    'Wall push-ups do not load the knees and are safe for knee injury rehabilitation'
),
(
    'knee_injury', 
    (SELECT id FROM enhanced_exercises WHERE name = 'Knee Push-up'),
    'modify_required',
    '{"knee_padding": true, "surface_modification": "soft_surface"}',
    ARRAY[(SELECT id FROM enhanced_exercises WHERE name = 'Incline Push-up')]::UUID[],
    'moderate',
    'Knee push-ups require kneeling which may aggravate knee injuries. Use padding and consider alternatives.'
),

-- Shoulder injury compatibilities  
(
    'shoulder_injury',
    (SELECT id FROM enhanced_exercises WHERE name = 'Standard Push-up'),
    'contraindicated',
    '{}',
    ARRAY[(SELECT id FROM enhanced_exercises WHERE name = 'Wall Push-up'), (SELECT id FROM enhanced_exercises WHERE name = 'Incline Push-up')]::UUID[],
    'high',
    'Standard push-ups place significant load on shoulder joint and should be avoided during acute shoulder injury'
),
(
    'shoulder_injury',
    (SELECT id FROM enhanced_exercises WHERE name = 'Incline Push-up'),
    'modify_required', 
    '{"range_of_motion": "pain_free_only", "load_reduction": 0.5}',
    ARRAY[(SELECT id FROM enhanced_exercises WHERE name = 'Wall Push-up')]::UUID[],
    'moderate',
    'Incline push-ups can be performed with reduced range of motion during shoulder rehabilitation'
),

-- Wrist injury compatibilities
(
    'wrist_injury',
    (SELECT id FROM enhanced_exercises WHERE name = 'Standard Push-up'),
    'modify_required',
    '{"equipment": "push_up_handles", "alternative_position": "fists"}',
    ARRAY[(SELECT id FROM enhanced_exercises WHERE name = 'Wall Push-up')]::UUID[],
    'high',
    'Push-ups can aggravate wrist injuries. Use equipment modifications or alternative hand positions.'
);