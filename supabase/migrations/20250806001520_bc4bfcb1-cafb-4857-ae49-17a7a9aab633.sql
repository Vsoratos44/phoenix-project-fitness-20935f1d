-- Add comprehensive exercise database
INSERT INTO exercises (name, description, exercise_type, exercise_type_detailed, intensity_level, muscle_group_primary, muscle_group_secondary, equipment_required, difficulty_level, instructions, is_approved) VALUES

-- STRENGTH EXERCISES - Bodyweight
('Diamond Push-ups', 'Advanced push-up variation targeting triceps', 'strength', 'compound', 'high', 'chest', ARRAY['triceps', 'shoulders'], '[]'::jsonb, 'advanced', '["Form diamond with hands", "Lower chest to hands", "Push up explosively"]'::jsonb, true),
('Pike Push-ups', 'Shoulder-focused push-up variation', 'strength', 'compound', 'moderate', 'shoulders', ARRAY['triceps', 'core'], '[]'::jsonb, 'intermediate', '["Start in downward dog", "Lower head toward hands", "Push back up"]'::jsonb, true),
('Single-leg Squats', 'Unilateral leg strength exercise', 'strength', 'compound', 'high', 'legs', ARRAY['glutes', 'core'], '[]'::jsonb, 'advanced', '["Stand on one leg", "Lower into squat", "Return to standing"]'::jsonb, true),
('Jump Squats', 'Explosive lower body exercise', 'strength', 'compound', 'high', 'legs', ARRAY['glutes'], '[]'::jsonb, 'intermediate', '["Perform regular squat", "Jump up explosively", "Land softly"]'::jsonb, true),
('Bulgarian Split Squats', 'Single-leg rear-foot elevated squat', 'strength', 'compound', 'moderate', 'legs', ARRAY['glutes'], '[]'::jsonb, 'intermediate', '["Rear foot on elevated surface", "Lower into lunge", "Push back up"]'::jsonb, true),
('Single-arm Push-ups', 'Advanced unilateral push-up', 'strength', 'compound', 'high', 'chest', ARRAY['triceps', 'core'], '[]'::jsonb, 'advanced', '["One hand behind back", "Lower with one arm", "Push up with control"]'::jsonb, true),
('Archer Push-ups', 'Side-to-side push-up variation', 'strength', 'compound', 'high', 'chest', ARRAY['shoulders', 'triceps'], '[]'::jsonb, 'advanced', '["Wide hand position", "Lower toward one side", "Push back to center"]'::jsonb, true),
('Hindu Push-ups', 'Dynamic flowing push-up', 'strength', 'compound', 'moderate', 'chest', ARRAY['shoulders', 'back'], '[]'::jsonb, 'intermediate', '["Start in downward dog", "Dive down and forward", "Push up to upward dog"]'::jsonb, true),
('Tricep Dips', 'Bodyweight tricep exercise', 'strength', 'isolation', 'moderate', 'triceps', ARRAY['shoulders'], '[]'::jsonb, 'beginner', '["Hands on edge behind you", "Lower body down", "Push back up"]'::jsonb, true),
('L-Sit Hold', 'Advanced core and arm strength', 'strength', 'isometric', 'high', 'core', ARRAY['shoulders', 'triceps'], '[]'::jsonb, 'advanced', '["Sit with legs extended", "Lift body with arms", "Hold position"]'::jsonb, true),

-- STRENGTH EXERCISES - Equipment
('Barbell Squats', 'King of all exercises', 'strength', 'compound', 'high', 'legs', ARRAY['glutes', 'core'], '["barbell"]'::jsonb, 'intermediate', '["Bar on upper back", "Descend into squat", "Drive through heels"]'::jsonb, true),
('Deadlifts', 'Total body strength exercise', 'strength', 'compound', 'high', 'back', ARRAY['legs', 'glutes'], '["barbell"]'::jsonb, 'intermediate', '["Bar over midfoot", "Hinge at hips", "Drive hips forward"]'::jsonb, true),
('Bench Press', 'Classic chest building exercise', 'strength', 'compound', 'high', 'chest', ARRAY['triceps', 'shoulders'], '["barbell", "bench"]'::jsonb, 'intermediate', '["Lie on bench", "Lower bar to chest", "Press up powerfully"]'::jsonb, true),
('Overhead Press', 'Standing shoulder press', 'strength', 'compound', 'moderate', 'shoulders', ARRAY['triceps', 'core'], '["barbell"]'::jsonb, 'intermediate', '["Bar at shoulder height", "Press overhead", "Lower with control"]'::jsonb, true),
('Pull-ups', 'Upper body pulling exercise', 'strength', 'compound', 'moderate', 'back', ARRAY['biceps'], '["pull_up_bar"]'::jsonb, 'intermediate', '["Hang from bar", "Pull chin over bar", "Lower with control"]'::jsonb, true),
('Chin-ups', 'Bicep-focused pulling exercise', 'strength', 'compound', 'moderate', 'back', ARRAY['biceps'], '["pull_up_bar"]'::jsonb, 'beginner', '["Underhand grip", "Pull chin over bar", "Lower slowly"]'::jsonb, true),
('Dumbbell Rows', 'Single-arm back exercise', 'strength', 'compound', 'moderate', 'back', ARRAY['biceps'], '["dumbbell", "bench"]'::jsonb, 'beginner', '["Support on bench", "Row dumbbell to hip", "Lower with control"]'::jsonb, true),
('Dumbbell Chest Press', 'Chest exercise with dumbbells', 'strength', 'compound', 'moderate', 'chest', ARRAY['triceps', 'shoulders'], '["dumbbell", "bench"]'::jsonb, 'beginner', '["Lie on bench", "Press dumbbells up", "Lower to chest level"]'::jsonb, true),
('Goblet Squats', 'Front-loaded squat variation', 'strength', 'compound', 'moderate', 'legs', ARRAY['glutes', 'core'], '["dumbbell"]'::jsonb, 'beginner', '["Hold weight at chest", "Squat down", "Drive through heels"]'::jsonb, true),
('Kettlebell Swings', 'Hip hinge power exercise', 'strength', 'compound', 'high', 'glutes', ARRAY['hamstrings', 'core'], '["kettlebell"]'::jsonb, 'intermediate', '["Hinge at hips", "Swing to shoulder height", "Control the descent"]'::jsonb, true),

-- CARDIO EXERCISES
('High Knees', 'Dynamic cardio movement', 'cardio', 'dynamic', 'moderate', 'legs', ARRAY['core'], '[]'::jsonb, 'beginner', '["Run in place", "Bring knees to chest", "Pump arms actively"]'::jsonb, true),
('Butt Kicks', 'Dynamic hamstring activation', 'cardio', 'dynamic', 'moderate', 'legs', ARRAY[]::text[], '[]'::jsonb, 'beginner', '["Run in place", "Kick heels to glutes", "Keep knees pointing down"]'::jsonb, true),
('Sprint Intervals', 'High-intensity running', 'cardio', 'interval', 'high', 'legs', ARRAY['core'], '[]'::jsonb, 'intermediate', '["Sprint at max effort", "Rest between intervals", "Maintain good form"]'::jsonb, true),
('Shuttle Runs', 'Agility and cardio exercise', 'cardio', 'dynamic', 'moderate', 'legs', ARRAY['core'], '[]'::jsonb, 'intermediate', '["Run between two points", "Touch the ground", "Change direction quickly"]'::jsonb, true),
('Bear Crawls', 'Full-body crawling movement', 'cardio', 'dynamic', 'moderate', 'core', ARRAY['shoulders', 'legs'], '[]'::jsonb, 'intermediate', '["Crawl on hands and feet", "Keep knees low", "Move forward and back"]'::jsonb, true),
('Rowing Machine', 'Full-body cardio exercise', 'cardio', 'steady', 'moderate', 'back', ARRAY['legs', 'core'], '["rowing_machine"]'::jsonb, 'beginner', '["Drive with legs first", "Pull handle to chest", "Return with control"]'::jsonb, true),
('Bike Sprints', 'High-intensity cycling', 'cardio', 'interval', 'high', 'legs', ARRAY[]::text[], '["stationary_bike"]'::jsonb, 'intermediate', '["Sprint at high resistance", "Maintain cadence", "Rest between intervals"]'::jsonb, true),

-- STRETCHING EXERCISES
('Downward Dog', 'Full-body stretching pose', 'stretching', 'static', 'low', 'hamstrings', ARRAY['calves', 'shoulders'], '[]'::jsonb, 'beginner', '["Hands and feet on ground", "Form inverted V", "Hold and breathe"]'::jsonb, true),
('Cat-Cow Stretch', 'Spinal mobility exercise', 'stretching', 'dynamic', 'low', 'back', ARRAY['core'], '[]'::jsonb, 'beginner', '["Start on hands and knees", "Arch and round spine", "Move slowly and controlled"]'::jsonb, true),
('Hip Flexor Stretch', 'Hip opening stretch', 'stretching', 'static', 'low', 'hip_flexors', ARRAY[]::text[], '[]'::jsonb, 'beginner', '["Lunge position", "Push hips forward", "Hold stretch"]'::jsonb, true),
('Pigeon Pose', 'Deep hip stretch', 'stretching', 'static', 'moderate', 'hips', ARRAY['glutes'], '[]'::jsonb, 'intermediate', '["One leg forward and bent", "Extend back leg", "Lean forward into stretch"]'::jsonb, true),
('Thread the Needle', 'Thoracic spine mobility', 'stretching', 'dynamic', 'low', 'thoracic_spine', ARRAY['shoulders'], '[]'::jsonb, 'beginner', '["Start on hands and knees", "Thread arm under body", "Rotate and reach"]'::jsonb, true),
('Cobra Stretch', 'Back extension stretch', 'stretching', 'static', 'low', 'back', ARRAY['chest'], '[]'::jsonb, 'beginner', '["Lie face down", "Push up with arms", "Arch back gently"]'::jsonb, true),
('Hamstring Stretch', 'Posterior chain flexibility', 'stretching', 'static', 'low', 'hamstrings', ARRAY[]::text[], '[]'::jsonb, 'beginner', '["Extend leg forward", "Reach toward toes", "Keep back straight"]'::jsonb, true),
('Shoulder Rolls', 'Shoulder mobility warm-up', 'stretching', 'dynamic', 'low', 'shoulders', ARRAY[]::text[], '[]'::jsonb, 'beginner', '["Roll shoulders backward", "Full circular motion", "Reverse direction"]'::jsonb, true),

-- PLYOMETRIC EXERCISES
('Box Jumps', 'Explosive jumping exercise', 'plyometrics', 'explosive', 'high', 'legs', ARRAY['glutes'], '["box"]'::jsonb, 'intermediate', '["Jump onto box", "Land softly", "Step down"]'::jsonb, true),
('Depth Jumps', 'Advanced plyometric exercise', 'plyometrics', 'explosive', 'high', 'legs', ARRAY['glutes'], '["box"]'::jsonb, 'advanced', '["Step off box", "Land and immediately jump", "Maximum height"]'::jsonb, true),
('Lateral Bounds', 'Side-to-side jumping', 'plyometrics', 'explosive', 'moderate', 'legs', ARRAY['glutes'], '[]'::jsonb, 'intermediate', '["Jump laterally", "Land on one foot", "Bound to other side"]'::jsonb, true),
('Tuck Jumps', 'Knee-to-chest jumps', 'plyometrics', 'explosive', 'high', 'legs', ARRAY['core'], '[]'::jsonb, 'intermediate', '["Jump bringing knees up", "Land softly", "Repeat immediately"]'::jsonb, true),
('Clap Push-ups', 'Explosive upper body plyometric', 'plyometrics', 'explosive', 'high', 'chest', ARRAY['triceps', 'shoulders'], '[]'::jsonb, 'advanced', '["Push up explosively", "Clap hands in air", "Land in push-up position"]'::jsonb, true);