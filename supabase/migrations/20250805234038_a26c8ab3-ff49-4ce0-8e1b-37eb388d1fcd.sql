-- Drop existing conflicting indexes and constraints if they exist
DROP INDEX IF EXISTS idx_enhanced_profiles_user_id;
DROP INDEX IF EXISTS idx_injury_history_user_id;
DROP INDEX IF EXISTS idx_movement_restrictions_user_id;
DROP INDEX IF EXISTS idx_performance_analytics_user_exercise;
DROP INDEX IF EXISTS idx_workout_adaptations_user_session;
DROP INDEX IF EXISTS idx_overload_plans_user_exercise;
DROP INDEX IF EXISTS idx_generation_logs_user_created;
DROP INDEX IF EXISTS idx_contraindications_exercise;
DROP INDEX IF EXISTS idx_workout_blocks_user_type;

-- Recreate indexes for performance
CREATE INDEX idx_enhanced_profiles_user_id ON public.enhanced_user_profiles(user_id);
CREATE INDEX idx_injury_history_user_id ON public.injury_history(user_id);
CREATE INDEX idx_movement_restrictions_user_id ON public.movement_restrictions(user_id);
CREATE INDEX idx_performance_analytics_user_exercise ON public.exercise_performance_analytics(user_id, exercise_id);
CREATE INDEX idx_workout_adaptations_user_session ON public.workout_adaptations(user_id, workout_session_id);
CREATE INDEX idx_overload_plans_user_exercise ON public.progressive_overload_plans(user_id, exercise_id);
CREATE INDEX idx_generation_logs_user_created ON public.workout_generation_logs(user_id, created_at);
CREATE INDEX idx_contraindications_exercise ON public.exercise_contraindications(exercise_id);
CREATE INDEX idx_workout_blocks_user_type ON public.workout_blocks(user_id, block_type);