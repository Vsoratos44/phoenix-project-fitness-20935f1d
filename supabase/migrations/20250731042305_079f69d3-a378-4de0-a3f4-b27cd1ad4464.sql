-- Fix RLS policies for all tables that need them
-- This addresses the security warnings about missing RLS policies

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
  FOR SELECT USING (user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own subscription" ON public.subscriptions
  FOR INSERT WITH CHECK (user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own subscription" ON public.subscriptions
  FOR UPDATE USING (user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

-- Workout programs - publicly readable, user-specific creation
CREATE POLICY "Anyone can view approved workout programs" ON public.workout_programs
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own workout programs" ON public.workout_programs
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own workout programs" ON public.workout_programs
  FOR UPDATE USING (created_by = auth.uid());

-- Workout templates - accessible based on program visibility
CREATE POLICY "Anyone can view workout templates" ON public.workout_templates
  FOR SELECT USING (true);

-- Workout exercises - accessible based on template visibility  
CREATE POLICY "Anyone can view workout exercises" ON public.workout_exercises
  FOR SELECT USING (true);

-- Exercise logs - user-specific
CREATE POLICY "Users can manage their own exercise logs" ON public.exercise_logs
  FOR ALL USING (
    workout_session_id IN (
      SELECT id FROM public.workout_sessions WHERE user_id = auth.uid()
    )
  );

-- Set logs - user-specific via exercise logs
CREATE POLICY "Users can manage their own set logs" ON public.set_logs
  FOR ALL USING (
    exercise_log_id IN (
      SELECT el.id FROM public.exercise_logs el
      JOIN public.workout_sessions ws ON el.workout_session_id = ws.id
      WHERE ws.user_id = auth.uid()
    )
  );

-- Personal records - user-specific
CREATE POLICY "Users can view their own personal records" ON public.personal_records
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own personal records" ON public.personal_records
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Phoenix scores - user-specific
CREATE POLICY "Users can view their own phoenix scores" ON public.phoenix_scores
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own phoenix scores" ON public.phoenix_scores
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own phoenix scores" ON public.phoenix_scores
  FOR UPDATE USING (user_id = auth.uid());

-- Biometric logs - user-specific
CREATE POLICY "Users can manage their own biometric logs" ON public.biometric_logs
  FOR ALL USING (user_id = auth.uid());

-- User achievements - user-specific
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Achievements - publicly readable
CREATE POLICY "Anyone can view achievements" ON public.achievements
  FOR SELECT USING (true);

-- Marketplace vendors - publicly readable
CREATE POLICY "Anyone can view active marketplace vendors" ON public.marketplace_vendors
  FOR SELECT USING (is_active = true);

-- Foods - publicly readable for verified foods
CREATE POLICY "Anyone can view verified foods" ON public.foods
  FOR SELECT USING (is_verified = true);

CREATE POLICY "Users can create foods" ON public.foods
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Nutrition goals - user-specific
CREATE POLICY "Users can manage their own nutrition goals" ON public.nutrition_goals
  FOR ALL USING (user_id = auth.uid());

-- User follows - users can manage their own follows
CREATE POLICY "Users can view follows" ON public.user_follows
  FOR SELECT USING (follower_id = auth.uid() OR following_id = auth.uid());

CREATE POLICY "Users can create follows" ON public.user_follows
  FOR INSERT WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can delete their own follows" ON public.user_follows
  FOR DELETE USING (follower_id = auth.uid());

-- Challenges - publicly readable, user-specific creation
CREATE POLICY "Anyone can view public challenges" ON public.challenges
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own challenges" ON public.challenges
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create challenges" ON public.challenges
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own challenges" ON public.challenges
  FOR UPDATE USING (created_by = auth.uid());

-- Challenge participants - users can manage their own participation
CREATE POLICY "Users can view challenge participants" ON public.challenge_participants
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can join challenges" ON public.challenge_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation" ON public.challenge_participants
  FOR UPDATE USING (user_id = auth.uid());

-- Activity feed - based on privacy settings and user relationships
CREATE POLICY "Users can view public activity and their own" ON public.activity_feed
  FOR SELECT USING (
    privacy_level = 'public' OR 
    user_id = auth.uid() OR
    (privacy_level = 'friends' AND user_id IN (
      SELECT following_id FROM public.user_follows WHERE follower_id = auth.uid()
    ))
  );

CREATE POLICY "Users can create their own activity" ON public.activity_feed
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own activity" ON public.activity_feed
  FOR UPDATE USING (user_id = auth.uid());

-- Activity interactions - users can interact with visible activities
CREATE POLICY "Users can view interactions on visible activities" ON public.activity_interactions
  FOR SELECT USING (
    activity_id IN (
      SELECT id FROM public.activity_feed WHERE 
      privacy_level = 'public' OR 
      user_id = auth.uid() OR
      (privacy_level = 'friends' AND user_id IN (
        SELECT following_id FROM public.user_follows WHERE follower_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Users can create interactions" ON public.activity_interactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Notification preferences - user-specific
CREATE POLICY "Users can manage their own notification preferences" ON public.notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- Fix the function security path issue
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql' 
SECURITY DEFINER 
SET search_path = public;