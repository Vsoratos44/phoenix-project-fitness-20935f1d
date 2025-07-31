-- Add sample foods with nutritional data and color coding
INSERT INTO foods (name, brand, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, serving_size_g, serving_size_description, traffic_light_category, food_group, category, is_verified, serving_sizes) VALUES
-- Green Foods (Healthy)
('Spinach', 'Fresh', 23, 2.9, 3.6, 0.4, 2.2, 0.4, 79, 100, '1 cup (100g)', 'green', 'vegetables', 'leafy_greens', true, '[{"unit": "cup", "grams": 30}, {"unit": "handful", "grams": 20}]'),
('Chicken Breast', 'Skinless', 165, 31, 0, 3.6, 0, 0, 74, 100, '3.5 oz (100g)', 'green', 'protein', 'lean_meat', true, '[{"unit": "breast", "grams": 150}, {"unit": "oz", "grams": 28}]'),
('Broccoli', 'Fresh', 34, 2.8, 7, 0.4, 2.6, 1.5, 33, 100, '1 cup chopped (100g)', 'green', 'vegetables', 'cruciferous', true, '[{"unit": "cup", "grams": 90}, {"unit": "floret", "grams": 15}]'),
('Salmon', 'Atlantic', 208, 25, 0, 12, 0, 0, 59, 100, '3.5 oz (100g)', 'green', 'protein', 'fish', true, '[{"unit": "fillet", "grams": 150}, {"unit": "oz", "grams": 28}]'),
('Greek Yogurt', 'Plain 0% Fat', 59, 10, 3.6, 0.4, 0, 3.2, 36, 100, '3/4 cup (100g)', 'green', 'dairy', 'yogurt', true, '[{"unit": "cup", "grams": 245}, {"unit": "container", "grams": 170}]'),
('Blueberries', 'Fresh', 57, 0.7, 14, 0.3, 2.4, 10, 1, 100, '1/2 cup (100g)', 'green', 'fruits', 'berries', true, '[{"unit": "cup", "grams": 148}, {"unit": "handful", "grams": 50}]'),
('Sweet Potato', 'Baked', 86, 1.6, 20, 0.1, 3, 4.2, 54, 100, '1 medium (100g)', 'green', 'vegetables', 'starchy', true, '[{"unit": "medium", "grams": 128}, {"unit": "cup cubed", "grams": 133}]'),

-- Yellow Foods (Moderate)
('Banana', 'Medium', 89, 1.1, 23, 0.3, 2.6, 12, 1, 100, '1 medium (100g)', 'yellow', 'fruits', 'tropical', true, '[{"unit": "medium", "grams": 118}, {"unit": "large", "grams": 136}]'),
('Brown Rice', 'Cooked', 111, 2.6, 23, 0.9, 1.8, 0.4, 5, 100, '1/2 cup cooked (100g)', 'yellow', 'grains', 'whole_grain', true, '[{"unit": "cup", "grams": 195}, {"unit": "serving", "grams": 150}]'),
('Whole Wheat Bread', 'Sliced', 247, 13, 41, 4.2, 7, 6, 584, 100, '2 slices (100g)', 'yellow', 'grains', 'bread', true, '[{"unit": "slice", "grams": 28}, {"unit": "roll", "grams": 85}]'),
('Avocado', 'Fresh', 160, 2, 9, 15, 7, 0.7, 7, 100, '1/2 medium (100g)', 'yellow', 'fruits', 'high_fat', true, '[{"unit": "medium", "grams": 200}, {"unit": "cup sliced", "grams": 146}]'),
('Almonds', 'Raw', 579, 21, 22, 50, 12, 4.4, 1, 100, '1 oz (28g)', 'yellow', 'nuts_seeds', 'tree_nuts', true, '[{"unit": "oz", "grams": 28}, {"unit": "handful", "grams": 23}]'),
('Pasta', 'Whole Wheat Cooked', 124, 5.3, 25, 1.1, 3.9, 0.8, 4, 100, '1/2 cup cooked (100g)', 'yellow', 'grains', 'pasta', true, '[{"unit": "cup", "grams": 140}, {"unit": "serving", "grams": 85}]'),

-- Red Foods (Limit)
('Pizza', 'Pepperoni', 298, 12, 36, 11, 2.3, 3.8, 760, 100, '1 slice (100g)', 'red', 'mixed_dishes', 'fast_food', true, '[{"unit": "slice", "grams": 107}, {"unit": "personal", "grams": 150}]'),
('Ice Cream', 'Vanilla', 207, 3.5, 24, 11, 0.7, 21, 80, 100, '1/2 cup (100g)', 'red', 'desserts', 'frozen', true, '[{"unit": "cup", "grams": 132}, {"unit": "scoop", "grams": 65}]'),
('French Fries', 'Fast Food', 365, 4, 63, 17, 4, 0.3, 246, 100, '1 medium serving (100g)', 'red', 'vegetables', 'fried', true, '[{"unit": "small", "grams": 75}, {"unit": "medium", "grams": 115}]'),
('Chocolate', 'Milk', 535, 7.6, 60, 30, 3.4, 52, 79, 100, '1 bar (100g)', 'red', 'desserts', 'candy', true, '[{"unit": "bar", "grams": 43}, {"unit": "square", "grams": 10}]'),
('Soda', 'Cola', 42, 0, 11, 0, 0, 11, 6, 100, '12 fl oz can (355ml)', 'red', 'beverages', 'sugary', true, '[{"unit": "can", "grams": 355}, {"unit": "bottle", "grams": 500}]'),
('Burger', 'Big Mac Style', 257, 13, 33, 10, 3, 5, 540, 100, '1 burger (100g)', 'red', 'mixed_dishes', 'fast_food', true, '[{"unit": "burger", "grams": 215}, {"unit": "serving", "grams": 200}]');

-- Add sample nutrition goals for demonstration
INSERT INTO nutrition_goals (user_id, calories_target, protein_target_g, carbs_target_g, fat_target_g, fiber_target_g, water_target_ml, is_active) 
SELECT 
  auth.uid(),
  2000,
  150,
  250,
  67,
  25,
  2000,
  true
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id) WHERE is_active = true 
DO UPDATE SET
  calories_target = EXCLUDED.calories_target,
  protein_target_g = EXCLUDED.protein_target_g,
  carbs_target_g = EXCLUDED.carbs_target_g,
  fat_target_g = EXCLUDED.fat_target_g,
  fiber_target_g = EXCLUDED.fiber_target_g,
  water_target_ml = EXCLUDED.water_target_ml,
  updated_at = now();

-- Add some sample nutrition logs for today
INSERT INTO nutrition_logs (user_id, food_id, meal_type, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g, date)
SELECT 
  auth.uid(),
  f.id,
  'breakfast',
  1,
  'serving',
  f.calories_per_100g * 1.5,
  f.protein_per_100g * 1.5,
  f.carbs_per_100g * 1.5,
  f.fat_per_100g * 1.5,
  f.fiber_per_100g * 1.5,
  CURRENT_DATE
FROM foods f 
WHERE f.name IN ('Greek Yogurt', 'Blueberries')
AND auth.uid() IS NOT NULL;

INSERT INTO nutrition_logs (user_id, food_id, meal_type, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g, date)
SELECT 
  auth.uid(),
  f.id,
  'lunch',
  1,
  'serving',
  f.calories_per_100g * 1.2,
  f.protein_per_100g * 1.2,
  f.carbs_per_100g * 1.2,
  f.fat_per_100g * 1.2,
  f.fiber_per_100g * 1.2,
  CURRENT_DATE
FROM foods f 
WHERE f.name IN ('Chicken Breast', 'Brown Rice', 'Broccoli')
AND auth.uid() IS NOT NULL;