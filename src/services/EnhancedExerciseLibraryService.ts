import { supabase } from "@/integrations/supabase/client";

export interface EnhancedExercise {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  modality?: string | null;
  movement_patterns?: string[] | null;
  primary_muscles?: string[] | null;
  secondary_muscles?: string[] | null;
  equipment_required?: string[] | null;
  difficulty_level: number;
  contraindications?: string[] | null;
  injury_risk_factors?: string[] | null;
  movement_restrictions?: string[] | null;
  prerequisites?: any;
  progression_pathway?: any;
  regression_options?: string[] | null;
  mastery_criteria?: any;
  biomechanical_demands?: any;
  energy_system_emphasis?: string[] | null;
  research_evidence?: string | null;
  instruction_steps?: string[] | null;
  form_cues?: string[] | null;
  common_mistakes?: string[] | null;
  safety_notes?: string[] | null;
  volume_guidelines?: any;
  intensity_recommendations?: any;
  frequency_recommendations?: any;
  modifications?: any;
  equipment_alternatives?: any;
  environmental_adaptations?: any;
  video_url?: string | null;
  thumbnail_url?: string | null;
  animation_url?: string | null;
  is_approved: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  user_id: string;
  equipment_access: {
    home_equipment: string[];
    gym_access: boolean;
  };
  health_data: {
    medical_conditions: string[];
    injury_history: Array<{
      injury_type: string;
      status: 'active' | 'recovering' | 'resolved';
      affected_exercises?: string[];
    }>;
    movement_restrictions: Array<{
      affected_exercises: string[];
      restriction_type: string;
      details: string;
    }>;
  };
  fitness_profile: {
    training_level: 'beginner' | 'intermediate' | 'advanced';
  };
  performance_data: {
    personal_records: Record<string, any>;
  };
  biometrics: {
    phoenix_score: number;
  };
}

export interface FilteredExerciseResult {
  safe_exercises: EnhancedExercise[];
  modified_exercises: Array<{
    exercise: EnhancedExercise;
    modifications: any[];
  }>;
  contraindicated_exercises: EnhancedExercise[];
  alternative_recommendations: EnhancedExercise[];
}

export interface SafetyAssessment {
  safety_level: 'safe' | 'modify' | 'contraindicated';
  risk_factors: string[];
  required_modifications: any[];
  reasoning: string[];
}

export interface ProgressionRecommendation {
  type: 'progression' | 'maintain' | 'deload';
  target_load?: number;
  target_step?: any;
  reasoning: string;
  duration_weeks: number;
  next_assessment: string;
}

export class EnhancedExerciseLibraryService {
  async getExercisesByMovementPattern(
    pattern: string,
    userProfile: UserProfile,
    difficulty?: number
  ): Promise<EnhancedExercise[]> {
    try {
      let query = supabase
        .from('enhanced_exercises')
        .select('*')
        .eq('is_approved', true);

      // Filter by movement pattern
      if (pattern) {
        query = query.contains('movement_patterns', [pattern]);
      }

      // Filter by difficulty
      if (difficulty) {
        query = query.lte('difficulty_level', difficulty);
      }

      const { data: exercises, error } = await query;

      if (error) throw error;

      if (!exercises) return [];

      // Apply user-specific filtering
      const filteredExercises = this.filterByUserConstraints(exercises, userProfile);
      
      return this.sortByProgression(filteredExercises, userProfile);
    } catch (error) {
      console.error('Error fetching exercises by movement pattern:', error);
      return [];
    }
  }

  async getExerciseById(exerciseId: string): Promise<EnhancedExercise | null> {
    try {
      const { data: exercise, error } = await supabase
        .from('enhanced_exercises')
        .select('*')
        .eq('id', exerciseId)
        .eq('is_approved', true)
        .single();

      if (error) throw error;
      return exercise;
    } catch (error) {
      console.error('Error fetching exercise by ID:', error);
      return null;
    }
  }

  async searchExercises(
    searchTerm: string,
    filters: {
      category?: string;
      modality?: string;
      difficulty_level?: number;
      equipment?: string[];
    } = {}
  ): Promise<EnhancedExercise[]> {
    try {
      let query = supabase
        .from('enhanced_exercises')
        .select('*')
        .eq('is_approved', true);

      // Search in name and description
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.modality) {
        query = query.eq('modality', filters.modality as any);
      }

      if (filters.difficulty_level) {
        query = query.lte('difficulty_level', filters.difficulty_level);
      }

      if (filters.equipment && filters.equipment.length > 0) {
        query = query.overlaps('equipment_required', filters.equipment);
      }

      const { data: exercises, error } = await query;

      if (error) throw error;
      return exercises || [];
    } catch (error) {
      console.error('Error searching exercises:', error);
      return [];
    }
  }

  filterByUserConstraints(exercises: EnhancedExercise[], userProfile: UserProfile): EnhancedExercise[] {
    return exercises.filter(exercise => {
      // Equipment availability check
      const hasRequiredEquipment = exercise.equipment_required?.every(eq =>
        userProfile.equipment_access.home_equipment.includes(eq) || userProfile.equipment_access.gym_access
      ) ?? true;

      if (!hasRequiredEquipment) return false;

      // Medical contraindications check
      const hasContraindications = exercise.contraindications?.some(condition =>
        userProfile.health_data.medical_conditions.includes(condition)
      ) ?? false;

      if (hasContraindications) return false;

      // Injury-specific filtering
      const hasInjuryConflict = userProfile.health_data.injury_history
        .filter(injury => injury.status === 'active')
        .some(injury => injury.affected_exercises?.includes(exercise.id));

      if (hasInjuryConflict) return false;

      return true;
    });
  }

  private sortByProgression(exercises: EnhancedExercise[], userProfile: UserProfile): EnhancedExercise[] {
    return exercises.sort((a, b) => {
      const aReadiness = this.calculateProgressionReadiness(a, userProfile);
      const bReadiness = this.calculateProgressionReadiness(b, userProfile);
      
      return bReadiness - aReadiness;
    });
  }

  private calculateProgressionReadiness(exercise: EnhancedExercise, userProfile: UserProfile): number {
    let readiness = 0;
    
    // Check prerequisites completion
    const prerequisitesMet = exercise.prerequisites?.every(prereq => {
      const userPR = userProfile.performance_data.personal_records[prereq.exercise_id];
      return userPR && this.meetsRequirement(userPR, prereq.requirement);
    }) ?? true;
    
    if (prerequisitesMet) readiness += 50;
    
    // Training level appropriateness
    const levelMatch = this.isAppropriateForLevel(exercise, userProfile.fitness_profile.training_level);
    if (levelMatch) readiness += 30;
    
    // Recent performance boost
    const recentPerformance = this.getRecentPerformance(exercise.id, userProfile);
    if (recentPerformance) readiness += 20;
    
    return readiness;
  }

  private meetsRequirement(userPR: any, requirement: any): boolean {
    // Simplified requirement checking logic
    if (requirement.type === 'reps' && userPR.best_reps >= requirement.value) return true;
    if (requirement.type === 'weight' && userPR.best_weight >= requirement.value) return true;
    if (requirement.type === 'form_score' && userPR.best_form_score >= requirement.value) return true;
    
    return false;
  }

  private isAppropriateForLevel(exercise: EnhancedExercise, trainingLevel: string): boolean {
    const levelMapping = {
      'beginner': [1, 2],
      'intermediate': [2, 3, 4],
      'advanced': [3, 4, 5]
    };
    
    const appropriateLevels = levelMapping[trainingLevel as keyof typeof levelMapping] || [1, 2, 3];
    return appropriateLevels.includes(exercise.difficulty_level);
  }

  private getRecentPerformance(exerciseId: string, userProfile: UserProfile): boolean {
    // Check if user has recent performance data for this exercise
    return !!userProfile.performance_data.personal_records[exerciseId];
  }

  async getMedicalCompatibility(
    exerciseId: string,
    medicalCondition: string
  ): Promise<any> {
    try {
      const { data: compatibility, error } = await supabase
        .from('medical_exercise_compatibility')
        .select('*')
        .eq('exercise_id', exerciseId)
        .eq('medical_condition', medicalCondition)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return compatibility;
    } catch (error) {
      console.error('Error fetching medical compatibility:', error);
      return null;
    }
  }

  async getExerciseProgressions(exerciseId: string): Promise<any[]> {
    try {
      const { data: progressions, error } = await supabase
        .from('exercise_progressions')
        .select(`
          *,
          enhanced_exercises!exercise_progressions_prerequisite_exercise_id_fkey(
            id,
            name,
            difficulty_level
          )
        `)
        .eq('exercise_id', exerciseId)
        .order('progression_level');

      if (error) throw error;
      return progressions || [];
    } catch (error) {
      console.error('Error fetching exercise progressions:', error);
      return [];
    }
  }

  async logPerformance(performanceData: {
    user_id: string;
    exercise_id: string;
    workout_session_id?: string;
    sets_completed: number;
    reps_completed: number[];
    load_used_kg?: number;
    duration_seconds?: number;
    rpe_scores: number[];
    form_score?: number;
    completion_rate?: number;
    progression_level?: number;
    progression_notes?: string;
  }): Promise<boolean> {
    try {
      // Calculate average RPE
      const averageRpe = performanceData.rpe_scores.length > 0
        ? performanceData.rpe_scores.reduce((sum, rpe) => sum + rpe, 0) / performanceData.rpe_scores.length
        : null;

      const { error } = await supabase
        .from('enhanced_performance_logs')
        .insert({
          ...performanceData,
          average_rpe: averageRpe,
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error logging performance:', error);
      return false;
    }
  }

  async getUserExerciseMastery(userId: string, exerciseId: string): Promise<any> {
    try {
      const { data: mastery, error } = await supabase
        .from('user_exercise_mastery')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return mastery;
    } catch (error) {
      console.error('Error fetching user exercise mastery:', error);
      return null;
    }
  }

  async updateExerciseMastery(
    userId: string,
    exerciseId: string,
    masteryData: {
      current_progression_level?: number;
      mastery_achieved?: boolean;
      best_performance?: any;
      consistency_score?: number;
      technique_score?: number;
    }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_exercise_mastery')
        .upsert({
          user_id: userId,
          exercise_id: exerciseId,
          ...masteryData,
          mastery_date: masteryData.mastery_achieved ? new Date().toISOString().split('T')[0] : null,
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating exercise mastery:', error);
      return false;
    }
  }
}