-- Add missing muscle groups
INSERT INTO muscle_groups (name, description) VALUES
('Chest', 'Pectoral muscles and surrounding chest area'),
('Back', 'Latissimus dorsi, trapezius, rhomboids, and back muscles'),
('Shoulders', 'Deltoids and rotator cuff muscles'),
('Arms', 'Biceps, triceps, and forearm muscles'),
('Core', 'Abdominals, obliques, and deep core muscles'),
('Quadriceps', 'Front thigh muscles'),
('Hamstrings', 'Posterior thigh muscles'),
('Glutes', 'Gluteal muscles'),
('Adductors', 'Inner thigh muscles'),
('Abductors', 'Outer hip muscles'),
('Calves', 'Lower leg muscles'),
('Rotator Cuff', 'Shoulder stabilizer muscles'),
('Hip Stabilizers', 'Deep hip muscles')
ON CONFLICT (name) DO NOTHING;

-- Add exercise categories
INSERT INTO exercise_categories (name, description, icon_name, color_hex) VALUES
('Regressed', 'Modified exercises for beginners or injury recovery', 'activity', '#4CAF50'),
('Foundational', 'Basic movement patterns', 'target', '#2196F3'),
('Compound', 'Multi-joint exercises', 'zap', '#FF9800'),
('Isolation', 'Single-joint exercises', 'focus', '#9C27B0'),
('Stability', 'Balance and stabilization exercises', 'shield', '#795548'),
('Plyometric', 'Explosive power exercises', 'trending-up', '#F44336')
ON CONFLICT (name) DO NOTHING;

-- Add comprehensive exercises with proper array casting
INSERT INTO exercises (name, description, category_id, muscle_group_primary, muscle_group_secondary, exercise_type, exercise_type_detailed, difficulty_level, intensity_level, equipment_required, instructions, form_cues, common_mistakes, is_bodyweight, requires_spotter, is_unilateral, biomechanics_notes, injury_contraindications, is_approved) VALUES

-- CHEST EXERCISES
('Wall Push Up', 'Modified push up performed against a wall', (SELECT id FROM exercise_categories WHERE name = 'Regressed'), 'Chest', ARRAY['Arms'], 'strength', 'isolation', 'beginner', 'low', '[]'::jsonb, '["Stand arms length from wall", "Place palms flat against wall", "Push body away from wall", "Return to starting position"]'::jsonb, '["Keep core engaged", "Maintain straight line from head to heels", "Control the movement"]'::jsonb, '["Arching back", "Incomplete range of motion"]'::jsonb, true, false, false, 'Low impact chest activation', ARRAY['shoulder impingement'], true),

('Push Up', 'Classic bodyweight chest exercise', (SELECT id FROM exercise_categories WHERE name = 'Foundational'), 'Chest', ARRAY['Arms', 'Core'], 'strength', 'compound', 'beginner', 'moderate', '[]'::jsonb, '["Start in plank position", "Lower body to floor", "Push back to starting position"]'::jsonb, '["Keep core tight", "Full range of motion", "Control descent"]'::jsonb, '["Sagging hips", "Partial range of motion"]'::jsonb, true, false, false, 'Full body engagement pattern', ARRAY['wrist pain', 'shoulder impingement'], true),

('Barbell Bench Press', 'Compound chest exercise with barbell', (SELECT id FROM exercise_categories WHERE name = 'Compound'), 'Chest', ARRAY['Arms', 'Shoulders'], 'strength', 'compound', 'intermediate', 'high', '["barbell", "bench"]'::jsonb, '["Lie on bench", "Grip barbell slightly wider than shoulders", "Lower to chest", "Press back up"]'::jsonb, '["Retract shoulder blades", "Keep feet planted", "Control the weight"]'::jsonb, '["Bouncing off chest", "Flaring elbows too wide"]'::jsonb, false, true, false, 'Primary horizontal pushing movement', ARRAY['shoulder impingement', 'lower back pain'], true),

('Pec Fly Machine', 'Isolated chest exercise on machine', (SELECT id FROM exercise_categories WHERE name = 'Isolation'), 'Chest', ARRAY[]::text[], 'strength', 'isolation', 'beginner', 'moderate', '["machine"]'::jsonb, '["Sit with back against pad", "Bring arms together in arc motion", "Squeeze chest muscles", "Return slowly"]'::jsonb, '["Focus on chest contraction", "Slow controlled movement", "Full range of motion"]'::jsonb, '["Using momentum", "Partial range of motion"]'::jsonb, false, false, false, 'Isolated pectoral activation', ARRAY['shoulder impingement'], true),

('Clap Push Up', 'Explosive push up variation', (SELECT id FROM exercise_categories WHERE name = 'Plyometric'), 'Chest', ARRAY['Arms', 'Core'], 'strength', 'plyometric', 'advanced', 'high', '[]'::jsonb, '["Start in push up position", "Push up explosively", "Clap hands mid-air", "Land and repeat"]'::jsonb, '["Maximum explosive power", "Soft landing", "Maintain form"]'::jsonb, '["Poor landing mechanics", "Insufficient power"]'::jsonb, true, false, false, 'Explosive upper body power', ARRAY['wrist pain', 'shoulder impingement'], true),

-- BACK EXERCISES  
('Lower Superman', 'Beginner back strengthening exercise', (SELECT id FROM exercise_categories WHERE name = 'Regressed'), 'Back', ARRAY['Core'], 'strength', 'isolation', 'beginner', 'low', '[]'::jsonb, '["Lie face down", "Lift only legs off ground", "Hold briefly", "Lower slowly"]'::jsonb, '["Keep hips on ground", "Squeeze glutes", "Controlled movement"]'::jsonb, '["Lifting too high", "Jerky movements"]'::jsonb, true, false, false, 'Posterior chain activation', ARRAY['lower back pain'], true),

('Superman Exercise', 'Back extension exercise', (SELECT id FROM exercise_categories WHERE name = 'Foundational'), 'Back', ARRAY['Core', 'Glutes'], 'strength', 'isolation', 'beginner', 'moderate', '[]'::jsonb, '["Lie face down", "Lift chest and legs simultaneously", "Hold briefly", "Lower slowly"]'::jsonb, '["Engage posterior chain", "Smooth movement", "Keep neck neutral"]'::jsonb, '["Over-extending neck", "Jerky movements"]'::jsonb, true, false, false, 'Full posterior chain engagement', ARRAY['lower back pain'], true),

('Barbell Deadlift', 'Fundamental posterior chain exercise', (SELECT id FROM exercise_categories WHERE name = 'Compound'), 'Back', ARRAY['Glutes', 'Hamstrings'], 'strength', 'compound', 'intermediate', 'high', '["barbell"]'::jsonb, '["Stand with feet hip-width", "Grip barbell", "Lift by extending hips and knees", "Stand tall", "Lower with control"]'::jsonb, '["Keep bar close to body", "Neutral spine", "Drive through heels"]'::jsonb, '["Rounding back", "Bar drifting away"]'::jsonb, false, false, false, 'Hip hinge movement pattern', ARRAY['lower back pain'], true),

('Seated Row Machine', 'Horizontal pulling exercise', (SELECT id FROM exercise_categories WHERE name = 'Isolation'), 'Back', ARRAY['Arms'], 'strength', 'compound', 'beginner', 'moderate', '["machine"]'::jsonb, '["Sit with chest up", "Pull handle to torso", "Squeeze shoulder blades", "Return slowly"]'::jsonb, '["Retract shoulder blades", "Keep chest up", "Control the weight"]'::jsonb, '["Leaning back too much", "Using momentum"]'::jsonb, false, false, false, 'Horizontal pulling pattern', ARRAY['shoulder impingement'], true),

('Medicine Ball Slam', 'Explosive back and core exercise', (SELECT id FROM exercise_categories WHERE name = 'Plyometric'), 'Back', ARRAY['Core', 'Arms'], 'strength', 'plyometric', 'intermediate', 'high', '["medicine ball"]'::jsonb, '["Hold ball overhead", "Slam down explosively", "Squat to pick up", "Repeat"]'::jsonb, '["Full body engagement", "Maximum power", "Safe lifting mechanics"]'::jsonb, '["Poor squat form", "Insufficient power"]'::jsonb, false, false, false, 'Explosive posterior chain', ARRAY['lower back pain'], true),

-- SHOULDER EXERCISES
('Small Range Shoulder Taps', 'Gentle shoulder activation', (SELECT id FROM exercise_categories WHERE name = 'Regressed'), 'Shoulders', ARRAY['Core'], 'strength', 'isolation', 'beginner', 'low', '[]'::jsonb, '["In plank position", "Gently tap opposite shoulder", "Maintain stability", "Alternate sides"]'::jsonb, '["Minimal hip movement", "Maintain plank", "Controlled taps"]'::jsonb, '["Excessive hip movement", "Losing plank position"]'::jsonb, true, false, true, 'Shoulder stability with core', ARRAY['shoulder impingement', 'wrist pain'], true),

('Shoulder Taps', 'Core and shoulder stability exercise', (SELECT id FROM exercise_categories WHERE name = 'Foundational'), 'Shoulders', ARRAY['Core'], 'strength', 'isolation', 'beginner', 'moderate', '[]'::jsonb, '["Hold plank position", "Tap opposite shoulder", "Keep hips stable", "Alternate sides"]'::jsonb, '["Stable core", "Minimal rotation", "Controlled movement"]'::jsonb, '["Hip rotation", "Losing plank form"]'::jsonb, true, false, true, 'Anti-rotation core stability', ARRAY['shoulder impingement', 'wrist pain'], true),

('Barbell Overhead Press', 'Compound shoulder pressing exercise', (SELECT id FROM exercise_categories WHERE name = 'Compound'), 'Shoulders', ARRAY['Arms', 'Core'], 'strength', 'compound', 'intermediate', 'high', '["barbell"]'::jsonb, '["Stand with feet hip-width", "Press barbell overhead", "Lock out arms", "Lower with control"]'::jsonb, '["Keep core tight", "Full overhead lockout", "Control descent"]'::jsonb, '["Arching back", "Pressing behind neck"]'::jsonb, false, false, false, 'Vertical pressing pattern', ARRAY['shoulder impingement'], true),

('Overhead Press Machine', 'Machine-based shoulder press', (SELECT id FROM exercise_categories WHERE name = 'Isolation'), 'Shoulders', ARRAY['Arms'], 'strength', 'compound', 'beginner', 'moderate', '["machine"]'::jsonb, '["Sit with back support", "Press handles overhead", "Full extension", "Lower slowly"]'::jsonb, '["Full range of motion", "Controlled movement", "Keep core engaged"]'::jsonb, '["Partial range of motion", "Using momentum"]'::jsonb, false, false, false, 'Supported vertical pressing', ARRAY['shoulder impingement'], true),

('Medicine Ball Overhead Throws', 'Explosive shoulder exercise', (SELECT id FROM exercise_categories WHERE name = 'Plyometric'), 'Shoulders', ARRAY['Core', 'Arms'], 'strength', 'plyometric', 'intermediate', 'high', '["medicine ball"]'::jsonb, '["Hold ball overhead", "Throw forward explosively", "Follow through", "Retrieve and repeat"]'::jsonb, '["Full body power", "Follow through", "Safe throwing mechanics"]'::jsonb, '["Poor throw mechanics", "Insufficient follow through"]'::jsonb, false, false, false, 'Explosive overhead pattern', ARRAY['shoulder impingement'], true),

-- ARM EXERCISES  
('Assisted Machine Pull Up', 'Assisted vertical pulling', (SELECT id FROM exercise_categories WHERE name = 'Regressed'), 'Arms', ARRAY['Back'], 'strength', 'compound', 'beginner', 'moderate', '["machine"]'::jsonb, '["Kneel on assistance pad", "Pull body up", "Chin over bar", "Lower slowly"]'::jsonb, '["Full range of motion", "Control descent", "Engage lats"]'::jsonb, '["Kipping motion", "Partial range"]'::jsonb, false, false, false, 'Assisted vertical pull pattern', ARRAY['shoulder impingement'], true),

('Pull Ups', 'Bodyweight vertical pulling exercise', (SELECT id FROM exercise_categories WHERE name = 'Foundational'), 'Arms', ARRAY['Back'], 'strength', 'compound', 'intermediate', 'high', '["pull up bar"]'::jsonb, '["Hang from bar", "Pull body up", "Chin over bar", "Lower with control"]'::jsonb, '["Full range of motion", "Control movement", "Engage back"]'::jsonb, '["Kipping", "Partial range of motion"]'::jsonb, true, false, false, 'Vertical pulling pattern', ARRAY['shoulder impingement'], true),

('Barbell Curl', 'Compound arm exercise', (SELECT id FROM exercise_categories WHERE name = 'Compound'), 'Arms', ARRAY[]::text[], 'strength', 'isolation', 'beginner', 'moderate', '["barbell"]'::jsonb, '["Stand with barbell", "Curl weight up", "Squeeze biceps", "Lower slowly"]'::jsonb, '["Keep elbows stable", "Full range of motion", "Control weight"]'::jsonb, '["Swinging weight", "Using momentum"]'::jsonb, false, false, false, 'Elbow flexion pattern', ARRAY['elbow pain'], true),

-- CORE EXERCISES
('Knees Down Plank', 'Modified plank for beginners', (SELECT id FROM exercise_categories WHERE name = 'Regressed'), 'Core', ARRAY[]::text[], 'strength', 'isometric', 'beginner', 'low', '[]'::jsonb, '["Kneel on ground", "Lower to forearms", "Keep straight line", "Hold position"]'::jsonb, '["Engage core", "Straight line", "Breathe normally"]'::jsonb, '["Sagging hips", "Holding breath"]'::jsonb, true, false, false, 'Core stabilization pattern', ARRAY['lower back pain'], true),

('Plank', 'Isometric core strengthening', (SELECT id FROM exercise_categories WHERE name = 'Foundational'), 'Core', ARRAY['Shoulders'], 'strength', 'isometric', 'beginner', 'moderate', '[]'::jsonb, '["Start in push-up position", "Hold straight line", "Engage core", "Breathe normally"]'::jsonb, '["Neutral spine", "Strong core", "Full body tension"]'::jsonb, '["Sagging hips", "Raising hips too high"]'::jsonb, true, false, false, 'Anti-extension core pattern', ARRAY['lower back pain', 'wrist pain'], true),

('Barbell Front Squat', 'Compound core and leg exercise', (SELECT id FROM exercise_categories WHERE name = 'Compound'), 'Core', ARRAY['Quadriceps', 'Glutes'], 'strength', 'compound', 'intermediate', 'high', '["barbell", "squat rack"]'::jsonb, '["Rest barbell on front shoulders", "Squat down", "Keep chest up", "Drive up through heels"]'::jsonb, '["Keep elbows up", "Chest tall", "Control descent"]'::jsonb, '["Elbows dropping", "Forward lean"]'::jsonb, false, true, false, 'Anti-flexion core pattern', ARRAY['knee pain', 'ankle mobility'], true),

-- LEG EXERCISES
('Wall Sit', 'Isometric leg strengthening', (SELECT id FROM exercise_categories WHERE name = 'Regressed'), 'Quadriceps', ARRAY['Glutes'], 'strength', 'isometric', 'beginner', 'low', '[]'::jsonb, '["Back against wall", "Slide down to squat", "Hold position", "Keep knees at 90 degrees"]'::jsonb, '["Keep back flat", "Weight in heels", "Breathe normally"]'::jsonb, '["Knees caving in", "Coming up on toes"]'::jsonb, true, false, false, 'Isometric quad strengthening', ARRAY['knee pain'], true),

('Squats', 'Fundamental lower body exercise', (SELECT id FROM exercise_categories WHERE name = 'Foundational'), 'Quadriceps', ARRAY['Glutes', 'Core'], 'strength', 'compound', 'beginner', 'moderate', '[]'::jsonb, '["Stand with feet hip-width", "Squat down", "Keep chest up", "Drive through heels to stand"]'::jsonb, '["Keep knees tracking over toes", "Chest up", "Full range of motion"]'::jsonb, '["Knees caving in", "Forward lean"]'::jsonb, true, false, false, 'Hip and knee flexion pattern', ARRAY['knee pain', 'ankle mobility'], true),

('Barbell Back Squat', 'Compound leg exercise with barbell', (SELECT id FROM exercise_categories WHERE name = 'Compound'), 'Quadriceps', ARRAY['Glutes', 'Core'], 'strength', 'compound', 'intermediate', 'high', '["barbell", "squat rack"]'::jsonb, '["Bar on upper back", "Squat down", "Keep chest up", "Drive up through heels"]'::jsonb, '["Keep bar over mid-foot", "Chest up", "Control descent"]'::jsonb, '["Forward lean", "Knees caving"]'::jsonb, false, true, false, 'Loaded squat pattern', ARRAY['knee pain', 'lower back pain'], true),

('Leg Extension Machine', 'Isolated quadriceps exercise', (SELECT id FROM exercise_categories WHERE name = 'Isolation'), 'Quadriceps', ARRAY[]::text[], 'strength', 'isolation', 'beginner', 'moderate', '["machine"]'::jsonb, '["Sit with back against pad", "Extend legs", "Squeeze quadriceps", "Lower slowly"]'::jsonb, '["Full range of motion", "Control weight", "Focus on quads"]'::jsonb, '["Partial range of motion", "Using momentum"]'::jsonb, false, false, false, 'Isolated knee extension', ARRAY['knee pain'], true),

('Box Jump', 'Explosive leg exercise', (SELECT id FROM exercise_categories WHERE name = 'Plyometric'), 'Quadriceps', ARRAY['Glutes', 'Calves'], 'strength', 'plyometric', 'intermediate', 'high', '["plyometric box"]'::jsonb, '["Stand in front of box", "Jump onto box", "Land softly", "Step down"]'::jsonb, '["Soft landing", "Full hip extension", "Control landing"]'::jsonb, '["Hard landing", "Jumping down"]'::jsonb, false, false, false, 'Explosive leg power', ARRAY['knee pain', 'ankle pain'], true),

-- GLUTE EXERCISES
('Glute Bridge', 'Basic glute activation', (SELECT id FROM exercise_categories WHERE name = 'Foundational'), 'Glutes', ARRAY['Hamstrings'], 'strength', 'isolation', 'beginner', 'low', '[]'::jsonb, '["Lie on back", "Knees bent", "Lift hips up", "Squeeze glutes", "Lower slowly"]'::jsonb, '["Squeeze glutes at top", "Keep core engaged", "Full range of motion"]'::jsonb, '["Using back instead of glutes", "Partial range"]'::jsonb, true, false, false, 'Hip extension pattern', ARRAY[]::text[], true),

('Barbell Hip Thrust', 'Compound glute exercise', (SELECT id FROM exercise_categories WHERE name = 'Compound'), 'Glutes', ARRAY['Hamstrings'], 'strength', 'compound', 'intermediate', 'high', '["barbell", "bench"]'::jsonb, '["Back on bench", "Barbell on hips", "Thrust hips up", "Squeeze glutes", "Lower with control"]'::jsonb, '["Full hip extension", "Squeeze glutes", "Keep core tight"]'::jsonb, '["Partial range of motion", "Arching back"]'::jsonb, false, false, false, 'Loaded hip extension', ARRAY['lower back pain'], true),

-- CALF EXERCISES
('Calf Raises', 'Basic calf strengthening', (SELECT id FROM exercise_categories WHERE name = 'Foundational'), 'Calves', ARRAY[]::text[], 'strength', 'isolation', 'beginner', 'low', '[]'::jsonb, '["Stand on balls of feet", "Rise up on toes", "Hold briefly", "Lower slowly"]'::jsonb, '["Full range of motion", "Control movement", "Squeeze calves"]'::jsonb, '["Partial range of motion", "Bouncing"]'::jsonb, true, false, false, 'Plantarflexion pattern', ARRAY['achilles tendon pain'], true),

('Jump Rope', 'Plyometric calf exercise', (SELECT id FROM exercise_categories WHERE name = 'Plyometric'), 'Calves', ARRAY['Quadriceps'], 'cardio', 'plyometric', 'beginner', 'moderate', '["jump rope"]'::jsonb, '["Hold rope handles", "Jump over rope", "Land on balls of feet", "Keep rhythm"]'::jsonb, '["Soft landings", "Stay on balls of feet", "Maintain rhythm"]'::jsonb, '["Landing on heels", "Jumping too high"]'::jsonb, false, false, false, 'Repeated ankle extension', ARRAY['achilles tendon pain', 'shin splints'], true);