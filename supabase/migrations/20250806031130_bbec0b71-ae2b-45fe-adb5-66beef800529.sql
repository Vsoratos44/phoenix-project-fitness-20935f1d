-- Insert sample biometric data for demonstration
INSERT INTO biometric_logs (
  user_id, 
  sleep_hours, 
  sleep_quality, 
  resting_heart_rate, 
  stress_level, 
  energy_level, 
  mood,
  recorded_at
) VALUES 
-- Sample data for authenticated user (will be created when user signs up)
('00000000-0000-0000-0000-000000000000', 7.5, 8, 65, 3, 8, 7, CURRENT_DATE),
('00000000-0000-0000-0000-000000000000', 8.0, 9, 62, 2, 9, 8, CURRENT_DATE - INTERVAL '1 day'),
('00000000-0000-0000-0000-000000000000', 6.5, 6, 68, 5, 6, 6, CURRENT_DATE - INTERVAL '2 days');

-- Insert sample workout data
INSERT INTO workout_sessions (
  user_id,
  workout_name,
  duration_minutes,
  total_volume_kg,
  perceived_exertion,
  workout_date,
  status
) VALUES 
('00000000-0000-0000-0000-000000000000', 'Upper Body Strength', 45, 2500, 7, CURRENT_DATE - INTERVAL '1 day', 'completed'),
('00000000-0000-0000-0000-000000000000', 'Lower Body Power', 50, 3200, 8, CURRENT_DATE - INTERVAL '2 days', 'completed'),
('00000000-0000-0000-0000-000000000000', 'Full Body Circuit', 35, 1800, 6, CURRENT_DATE - INTERVAL '3 days', 'completed');

-- Insert sample meal data
INSERT INTO meal_logs (
  user_id,
  date,
  meal_type,
  total_calories,
  total_protein_g,
  total_carbs_g,
  total_fat_g,
  food_items
) VALUES 
('00000000-0000-0000-0000-000000000000', CURRENT_DATE, 'breakfast', 450, 25, 45, 18, '["Oatmeal with berries", "Greek yogurt", "Coffee"]'::jsonb),
('00000000-0000-0000-0000-000000000000', CURRENT_DATE, 'lunch', 650, 35, 55, 22, '["Grilled chicken salad", "Quinoa", "Avocado"]'::jsonb),
('00000000-0000-0000-0000-000000000000', CURRENT_DATE - INTERVAL '1 day', 'breakfast', 380, 20, 40, 15, '["Protein smoothie", "Banana", "Spinach"]'::jsonb);

-- Insert sample Phoenix Score data to show the functionality
INSERT INTO phoenix_scores (
  user_id,
  date,
  overall_score,
  sleep_score,
  recovery_score,
  training_load_score,
  nutrition_score,
  stress_score,
  hrv_score,
  recommendation,
  suggested_intensity,
  factors
) VALUES 
('00000000-0000-0000-0000-000000000000', CURRENT_DATE, 78, 82, 75, 70, 85, 80, 76, 'Good readiness for moderate to high intensity training. Your sleep and nutrition are excellent, but watch your training load recovery.', 'moderate-high', '{"sleep_hours": 7.5, "stress_level": 3, "energy_level": 8}'::jsonb),
('00000000-0000-0000-0000-000000000000', CURRENT_DATE - INTERVAL '1 day', 85, 90, 88, 75, 82, 85, 84, 'Excellent readiness! This is a perfect day for high-intensity training and pushing your limits.', 'high', '{"sleep_hours": 8.0, "stress_level": 2, "energy_level": 9}'::jsonb),
('00000000-0000-0000-0000-000000000000', CURRENT_DATE - INTERVAL '2 days', 65, 60, 68, 60, 75, 65, 64, 'Moderate readiness. Consider lighter training or focus on technique and mobility work.', 'moderate', '{"sleep_hours": 6.5, "stress_level": 5, "energy_level": 6}'::jsonb);