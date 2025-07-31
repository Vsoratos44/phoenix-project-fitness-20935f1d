import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
  date_of_birth?: string;
  height_cm?: number;
  weight_kg?: number;
  fitness_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  primary_goals?: string[];
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'super_active';
  injuries_limitations?: string[];
  preferred_workout_types?: string[];
  available_equipment?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  notification_settings?: any;
  privacy_settings?: any;
  workout_reminders?: boolean;
  preferred_units?: 'metric' | 'imperial';
  theme_preference?: 'light' | 'dark' | 'system';
  created_at?: string;
  updated_at?: string;
}

export const userService = {
  // Profile management
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Preferences management
  async getPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({ user_id: userId, ...preferences })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Progress tracking
  async getProgressStats(userId: string, timeframe: 'week' | 'month' | 'year' = 'month') {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .gte('recorded_at', new Date(Date.now() - (timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString())
      .order('recorded_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async recordProgress(userId: string, progressData: {
    weight_kg?: number;
    body_fat_percentage?: number;
    muscle_mass_kg?: number;
    measurements?: any;
    photos?: string[];
    notes?: string;
  }) {
    const { data, error } = await supabase
      .from('user_progress')
      .insert({
        user_id: userId,
        ...progressData,
        recorded_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Achievements and streaks
  async getAchievements(userId: string) {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getCurrentStreak(userId: string) {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(30);

    if (error) throw error;

    // Calculate streak from consecutive workout days
    let streak = 0;
    if (data && data.length > 0) {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      let currentDate = today;
      const workoutDates = data.map(session => new Date(session.completed_at).toDateString());

      while (workoutDates.includes(currentDate.toDateString()) || 
             (streak === 0 && workoutDates.includes(yesterday.toDateString()))) {
        if (workoutDates.includes(currentDate.toDateString())) {
          streak++;
        }
        currentDate.setDate(currentDate.getDate() - 1);
      }
    }

    return streak;
  }
};