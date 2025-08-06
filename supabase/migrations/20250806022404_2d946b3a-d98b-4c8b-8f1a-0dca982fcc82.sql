-- Enable realtime for workout sessions and activity feed
ALTER TABLE public.workout_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.activity_feed REPLICA IDENTITY FULL;
ALTER TABLE public.activity_interactions REPLICA IDENTITY FULL;
ALTER TABLE public.challenge_participants REPLICA IDENTITY FULL;
ALTER TABLE public.biometric_logs REPLICA IDENTITY FULL;

-- Add realtime publication for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE workout_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE challenge_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE biometric_logs;

-- Add enhanced workout session columns
ALTER TABLE public.workout_sessions 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS challenge_id UUID REFERENCES challenges(id),
ADD COLUMN IF NOT EXISTS average_heart_rate INTEGER,
ADD COLUMN IF NOT EXISTS peak_heart_rate INTEGER,
ADD COLUMN IF NOT EXISTS average_form_score NUMERIC(3,1),
ADD COLUMN IF NOT EXISTS workout_intensity_score NUMERIC(3,1);

-- Create set_logs table for detailed set tracking
CREATE TABLE IF NOT EXISTS public.set_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_log_id UUID REFERENCES exercise_logs(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  weight_kg NUMERIC,
  reps INTEGER,
  duration_seconds INTEGER,
  rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
  rest_seconds INTEGER,
  tempo TEXT,
  is_failure BOOLEAN DEFAULT false,
  heart_rate INTEGER,
  velocity NUMERIC,
  range_of_motion_percentage INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on set_logs
ALTER TABLE public.set_logs ENABLE ROW LEVEL SECURITY;

-- RLS policy for set_logs
CREATE POLICY "Users can manage their own set logs" 
ON public.set_logs 
FOR ALL 
USING (
  exercise_log_id IN (
    SELECT el.id FROM exercise_logs el
    JOIN workout_sessions ws ON ws.id = el.workout_session_id
    WHERE ws.user_id = auth.uid()
  )
);

-- Create wearable_devices table
CREATE TABLE IF NOT EXISTS public.wearable_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('fitness_tracker', 'smartwatch', 'heart_rate_monitor', 'smartphone')),
  brand TEXT,
  model TEXT,
  is_connected BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  battery_level INTEGER,
  capabilities JSONB DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on wearable_devices
ALTER TABLE public.wearable_devices ENABLE ROW LEVEL SECURITY;

-- RLS policy for wearable_devices
CREATE POLICY "Users can manage their own wearable devices" 
ON public.wearable_devices 
FOR ALL 
USING (user_id = auth.uid());

-- Add device_id to biometric_logs for tracking source device
ALTER TABLE public.biometric_logs 
ADD COLUMN IF NOT EXISTS device_id UUID REFERENCES wearable_devices(id);

-- Create live_workout_viewers table for real-time workout viewing
CREATE TABLE IF NOT EXISTS public.live_workout_viewers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  viewer_user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workout_session_id, viewer_user_id)
);

-- Enable RLS on live_workout_viewers
ALTER TABLE public.live_workout_viewers ENABLE ROW LEVEL SECURITY;

-- RLS policies for live_workout_viewers
CREATE POLICY "Users can view public workout viewers" 
ON public.live_workout_viewers 
FOR SELECT 
USING (
  workout_session_id IN (
    SELECT id FROM workout_sessions WHERE is_public = true
  )
);

CREATE POLICY "Users can join public workouts as viewers" 
ON public.live_workout_viewers 
FOR INSERT 
WITH CHECK (
  viewer_user_id = auth.uid() AND
  workout_session_id IN (
    SELECT id FROM workout_sessions WHERE is_public = true
  )
);

CREATE POLICY "Users can update their own viewing session" 
ON public.live_workout_viewers 
FOR UPDATE 
USING (viewer_user_id = auth.uid());

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_workout_sessions_public_live ON workout_sessions(is_public, start_time) WHERE is_public = true AND end_time IS NULL;
CREATE INDEX IF NOT EXISTS idx_activity_feed_public_recent ON activity_feed(privacy_level, created_at) WHERE privacy_level = 'public';
CREATE INDEX IF NOT EXISTS idx_biometric_logs_user_recent ON biometric_logs(user_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_set_logs_exercise_log ON set_logs(exercise_log_id);
CREATE INDEX IF NOT EXISTS idx_live_workout_viewers_session ON live_workout_viewers(workout_session_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_wearable_devices_updated_at 
  BEFORE UPDATE ON wearable_devices 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample challenges if they don't exist
INSERT INTO public.challenges (
  name, 
  description, 
  challenge_type, 
  category, 
  start_date, 
  end_date, 
  goal_criteria, 
  entry_fee_sep, 
  prize_pool_sep, 
  max_participants, 
  is_public, 
  created_by
) VALUES 
(
  '10,000kg Volume Challenge',
  'Lift a total of 10,000kg in one week. Push your limits!',
  'total_volume',
  'strength',
  now(),
  now() + interval '7 days',
  '{"target_volume": 10000}',
  50,
  1000,
  100,
  true,
  gen_random_uuid()
),
(
  '30-Day Consistency Challenge',
  'Complete a workout every day for 30 days. Build the ultimate habit!',
  'workout_streak',
  'consistency',
  now(),
  now() + interval '30 days',
  '{"target_streak": 30}',
  100,
  5000,
  50,
  true,
  gen_random_uuid()
),
(
  'Phoenix Score Master',
  'Achieve a Phoenix Score of 85+ through consistent training and recovery.',
  'phoenix_score',
  'holistic',
  now(),
  now() + interval '14 days',
  '{"target_score": 85}',
  75,
  2500,
  25,
  true,
  gen_random_uuid()
)
ON CONFLICT DO NOTHING;