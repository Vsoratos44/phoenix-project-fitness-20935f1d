import { supabase } from '@/integrations/supabase/client';

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_groups: string[];
  equipment?: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  instructions: string[];
  video_url?: string;
  image_url?: string;
  tips?: string[];
  common_mistakes?: string[];
  variations?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_duration_minutes: number;
  muscle_groups: string[];
  equipment_needed?: string[];
  workout_type: string;
  is_public: boolean;
  created_by?: string;
  exercises: WorkoutExercise[];
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutExercise {
  id: string;
  exercise_id: string;
  sets?: number;
  reps?: number;
  duration_seconds?: number;
  rest_seconds?: number;
  weight_kg?: number;
  distance_meters?: number;
  order_index: number;
  notes?: string;
  exercise?: Exercise;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  template_id?: string;
  name: string;
  status: 'planned' | 'in_progress' | 'completed' | 'skipped';
  started_at?: string;
  completed_at?: string;
  duration_minutes?: number;
  total_volume_kg?: number;
  calories_burned?: number;
  notes?: string;
  ai_feedback?: any;
  exercises: WorkoutSessionExercise[];
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutSessionExercise {
  id: string;
  session_id: string;
  exercise_id: string;
  planned_sets?: number;
  planned_reps?: number;
  planned_weight_kg?: number;
  actual_sets?: number;
  actual_reps?: number;
  actual_weight_kg?: number;
  duration_seconds?: number;
  rest_seconds?: number;
  notes?: string;
  order_index: number;
  exercise?: Exercise;
}

export const workoutService = {
  // Exercise library
  async getExercises(filters?: {
    category?: string;
    muscle_groups?: string[];
    equipment?: string[];
    difficulty?: string;
    search?: string;
  }) {
    let query = supabase
      .from('exercises')
      .select('*')
      .order('name');

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.muscle_groups?.length) {
      query = query.overlaps('muscle_groups', filters.muscle_groups);
    }

    if (filters?.equipment?.length) {
      query = query.overlaps('equipment', filters.equipment);
    }

    if (filters?.difficulty) {
      query = query.eq('difficulty_level', filters.difficulty);
    }

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Exercise[];
  },

  async getExercise(id: string): Promise<Exercise | null> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Workout templates
  async getWorkoutTemplates(filters?: {
    difficulty?: string;
    workout_type?: string;
    muscle_groups?: string[];
    duration_range?: [number, number];
    is_public?: boolean;
    created_by?: string;
  }) {
    let query = supabase
      .from('workout_templates')
      .select(`
        *,
        workout_template_exercises(
          *,
          exercise:exercises(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.difficulty) {
      query = query.eq('difficulty_level', filters.difficulty);
    }

    if (filters?.workout_type) {
      query = query.eq('workout_type', filters.workout_type);
    }

    if (filters?.muscle_groups?.length) {
      query = query.overlaps('muscle_groups', filters.muscle_groups);
    }

    if (filters?.duration_range) {
      query = query
        .gte('estimated_duration_minutes', filters.duration_range[0])
        .lte('estimated_duration_minutes', filters.duration_range[1]);
    }

    if (filters?.is_public !== undefined) {
      query = query.eq('is_public', filters.is_public);
    }

    if (filters?.created_by) {
      query = query.eq('created_by', filters.created_by);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as WorkoutTemplate[];
  },

  async getWorkoutTemplate(id: string): Promise<WorkoutTemplate | null> {
    const { data, error } = await supabase
      .from('workout_templates')
      .select(`
        *,
        workout_template_exercises(
          *,
          exercise:exercises(*)
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (data) {
      data.exercises = data.workout_template_exercises || [];
      delete data.workout_template_exercises;
    }
    return data;
  },

  // Workout sessions
  async createWorkoutSession(userId: string, sessionData: {
    template_id?: string;
    name: string;
    exercises?: Partial<WorkoutSessionExercise>[];
  }): Promise<WorkoutSession> {
    const { data: session, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: userId,
        template_id: sessionData.template_id,
        name: sessionData.name,
        status: 'planned',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    if (sessionData.exercises?.length) {
      const exercises = sessionData.exercises.map((exercise, index) => ({
        ...exercise,
        session_id: session.id,
        order_index: exercise.order_index ?? index
      }));

      const { error: exercisesError } = await supabase
        .from('workout_session_exercises')
        .insert(exercises);

      if (exercisesError) throw exercisesError;
    }

    return session;
  },

  async getWorkoutSessions(userId: string, filters?: {
    status?: string;
    from_date?: string;
    to_date?: string;
    template_id?: string;
  }) {
    let query = supabase
      .from('workout_sessions')
      .select(`
        *,
        workout_session_exercises(
          *,
          exercise:exercises(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.from_date) {
      query = query.gte('created_at', filters.from_date);
    }

    if (filters?.to_date) {
      query = query.lte('created_at', filters.to_date);
    }

    if (filters?.template_id) {
      query = query.eq('template_id', filters.template_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data?.map(session => ({
      ...session,
      exercises: session.workout_session_exercises || []
    })) as WorkoutSession[];
  },

  async updateWorkoutSession(sessionId: string, updates: Partial<WorkoutSession>): Promise<WorkoutSession> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async startWorkoutSession(sessionId: string): Promise<WorkoutSession> {
    return this.updateWorkoutSession(sessionId, {
      status: 'in_progress',
      started_at: new Date().toISOString()
    });
  },

  async completeWorkoutSession(sessionId: string, completionData: {
    duration_minutes?: number;
    total_volume_kg?: number;
    calories_burned?: number;
    notes?: string;
    ai_feedback?: any;
  }): Promise<WorkoutSession> {
    return this.updateWorkoutSession(sessionId, {
      ...completionData,
      status: 'completed',
      completed_at: new Date().toISOString()
    });
  },

  // AI-powered workout generation
  async generateAIWorkout(userId: string, preferences: {
    duration_minutes?: number;
    muscle_groups?: string[];
    equipment_available?: string[];
    difficulty_preference?: string;
    workout_type?: string;
    focus_areas?: string[];
  }) {
    // This would integrate with our proprietary AI engine
    // For now, we'll create a basic template-based generation
    
    const templates = await this.getWorkoutTemplates({
      difficulty: preferences.difficulty_preference,
      workout_type: preferences.workout_type,
      muscle_groups: preferences.muscle_groups,
      duration_range: preferences.duration_minutes ? 
        [preferences.duration_minutes - 15, preferences.duration_minutes + 15] : 
        undefined,
      is_public: true
    });

    if (templates.length === 0) {
      throw new Error('No suitable workout templates found');
    }

    // Select a random template and customize it
    const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    // Create a session based on the template
    return this.createWorkoutSession(userId, {
      template_id: selectedTemplate.id,
      name: `AI Generated: ${selectedTemplate.name}`,
      exercises: selectedTemplate.exercises?.map((exercise, index) => ({
        exercise_id: exercise.exercise_id,
        planned_sets: exercise.sets,
        planned_reps: exercise.reps,
        planned_weight_kg: exercise.weight_kg,
        duration_seconds: exercise.duration_seconds,
        rest_seconds: exercise.rest_seconds,
        order_index: index,
        notes: exercise.notes
      }))
    });
  }
};