import { supabase } from "@/integrations/supabase/client";
import { EnhancedExercise, UserProfile, SafetyAssessment, FilteredExerciseResult } from "./EnhancedExerciseLibraryService";

export interface MedicalConditionProfile {
  avoid_completely: string[];
  modify_required: Record<string, {
    depth_limit?: number | string;
    load_reduction?: number;
    range_limit?: string;
    focus?: string;
  }>;
  recommended_alternatives: string[];
  progression_protocol: {
    phase1_weeks: number;
    phase1_exercises: string[];
    phase2_weeks: number;
    phase2_exercises: string[];
    phase3_weeks: number;
    phase3_exercises: string[];
  };
}

export enum SafetyLevel {
  SAFE = 'safe',
  MODIFY = 'modify',
  CONTRAINDICATED = 'contraindicated'
}

export class EnhancedInjuryManagementService {
  private medicalExerciseMatrix: Map<string, MedicalConditionProfile> = new Map();
  
  constructor() {
    this.initializeMedicalProfiles();
  }

  private initializeMedicalProfiles(): void {
    // Comprehensive medical condition exercise compatibility
    this.medicalExerciseMatrix.set('knee_injury', {
      avoid_completely: ['deep_squat', 'lunges', 'jumping_exercises', 'single_leg_squat'],
      modify_required: {
        'squat': { depth_limit: 90, load_reduction: 0.5 },
        'leg_press': { range_limit: 'pain_free', load_reduction: 0.3 },
        'step_ups': { load_reduction: 0.4, focus: 'controlled_movement' }
      },
      recommended_alternatives: ['leg_extension', 'hamstring_curl', 'glute_bridge', 'wall_sit'],
      progression_protocol: {
        phase1_weeks: 2,
        phase1_exercises: ['isometric_holds', 'pain_free_range'],
        phase2_weeks: 4,
        phase2_exercises: ['controlled_eccentrics', 'partial_range'],
        phase3_weeks: 6,
        phase3_exercises: ['full_range', 'progressive_loading']
      }
    });

    this.medicalExerciseMatrix.set('lower_back_pain', {
      avoid_completely: ['spinal_flexion', 'heavy_deadlifts', 'overhead_pressing', 'sit_ups'],
      modify_required: {
        'deadlift': { range_limit: 'above_knee', load_reduction: 0.6 },
        'squat': { depth_limit: 'comfortable', focus: 'hip_mobility' },
        'row': { range_limit: 'neutral_spine', load_reduction: 0.3 }
      },
      recommended_alternatives: ['glute_bridge', 'bird_dog', 'dead_bug', 'side_plank', 'cat_cow'],
      progression_protocol: {
        phase1_weeks: 1,
        phase1_exercises: ['pain_free_movement', 'gentle_mobility'],
        phase2_weeks: 3,
        phase2_exercises: ['stability_exercises', 'motor_control'],
        phase3_weeks: 8,
        phase3_exercises: ['progressive_loading', 'functional_movement']
      }
    });

    this.medicalExerciseMatrix.set('shoulder_impingement', {
      avoid_completely: ['overhead_press', 'lateral_raises', 'pull_ups_wide_grip'],
      modify_required: {
        'bench_press': { range_limit: 'above_chest', load_reduction: 0.4 },
        'push_ups': { range_limit: 'partial', focus: 'scapular_stability' },
        'rows': { focus: 'retraction', load_reduction: 0.2 }
      },
      recommended_alternatives: ['external_rotation', 'band_pull_aparts', 'face_pulls', 'wall_slides'],
      progression_protocol: {
        phase1_weeks: 2,
        phase1_exercises: ['pain_free_range', 'gentle_mobility'],
        phase2_weeks: 4,
        phase2_exercises: ['strengthening_below_90', 'scapular_stability'],
        phase3_weeks: 6,
        phase3_exercises: ['progressive_overhead', 'functional_patterns']
      }
    });

    this.medicalExerciseMatrix.set('hip_flexor_tightness', {
      avoid_completely: ['deep_hip_flexion', 'high_knees_running'],
      modify_required: {
        'lunges': { depth_limit: 'comfortable', focus: 'hip_extension' },
        'squats': { focus: 'hip_mobility', load_reduction: 0.2 }
      },
      recommended_alternatives: ['hip_flexor_stretch', 'pigeon_pose', 'couch_stretch', 'glute_activation'],
      progression_protocol: {
        phase1_weeks: 2,
        phase1_exercises: ['static_stretching', 'gentle_mobilization'],
        phase2_weeks: 3,
        phase2_exercises: ['dynamic_stretching', 'strengthening_opposing'],
        phase3_weeks: 4,
        phase3_exercises: ['functional_movement', 'sport_specific']
      }
    });

    this.medicalExerciseMatrix.set('ankle_sprain', {
      avoid_completely: ['jumping', 'lateral_movements', 'single_leg_balance'],
      modify_required: {
        'calf_raises': { range_limit: 'pain_free', load_reduction: 0.5 },
        'walking': { focus: 'controlled_movement' }
      },
      recommended_alternatives: ['ankle_pumps', 'alphabet_draws', 'towel_stretches', 'resistance_band'],
      progression_protocol: {
        phase1_weeks: 1,
        phase1_exercises: ['rest_ice_elevation', 'gentle_range_motion'],
        phase2_weeks: 2,
        phase2_exercises: ['strengthening', 'proprioception'],
        phase3_weeks: 3,
        phase3_exercises: ['sport_specific', 'plyometric_progression']
      }
    });
  }

  async filterExercisesByMedicalHistory(
    exercises: EnhancedExercise[],
    userProfile: UserProfile
  ): Promise<FilteredExerciseResult> {
    const result: FilteredExerciseResult = {
      safe_exercises: [],
      modified_exercises: [],
      contraindicated_exercises: [],
      alternative_recommendations: []
    };

    for (const exercise of exercises) {
      const safetyAssessment = await this.assessExerciseSafety(exercise, userProfile);
      
      switch (safetyAssessment.safety_level) {
        case SafetyLevel.SAFE:
          result.safe_exercises.push(exercise);
          break;
        case SafetyLevel.MODIFY:
          result.modified_exercises.push({
            exercise,
            modifications: safetyAssessment.required_modifications
          });
          break;
        case SafetyLevel.CONTRAINDICATED:
          result.contraindicated_exercises.push(exercise);
          const alternatives = await this.findSafeAlternatives(exercise, userProfile);
          result.alternative_recommendations.push(...alternatives);
          break;
      }
    }

    return result;
  }

  private async assessExerciseSafety(
    exercise: EnhancedExercise,
    userProfile: UserProfile
  ): Promise<SafetyAssessment> {
    const assessment: SafetyAssessment = {
      safety_level: SafetyLevel.SAFE,
      risk_factors: [],
      required_modifications: [],
      reasoning: []
    };

    // Check active injuries
    for (const injury of userProfile.health_data.injury_history.filter(i => i.status === 'active')) {
      const medicalProfile = this.medicalExerciseMatrix.get(injury.injury_type);
      if (!medicalProfile) continue;

      if (medicalProfile.avoid_completely.includes(exercise.id)) {
        assessment.safety_level = SafetyLevel.CONTRAINDICATED;
        assessment.reasoning.push(`Contraindicated due to active ${injury.injury_type}`);
        return assessment;
      }

      if (medicalProfile.modify_required[exercise.id]) {
        assessment.safety_level = SafetyLevel.MODIFY;
        assessment.required_modifications.push(medicalProfile.modify_required[exercise.id]);
        assessment.reasoning.push(`Requires modification due to ${injury.injury_type}`);
      }
    }

    // Check medical conditions
    for (const condition of userProfile.health_data.medical_conditions) {
      if (exercise.contraindications?.includes(condition)) {
        assessment.safety_level = SafetyLevel.CONTRAINDICATED;
        assessment.reasoning.push(`Contraindicated due to ${condition}`);
        return assessment;
      }
    }

    // Check movement restrictions
    for (const restriction of userProfile.health_data.movement_restrictions) {
      if (restriction.affected_exercises.includes(exercise.id)) {
        if (restriction.restriction_type === 'avoid') {
          assessment.safety_level = SafetyLevel.CONTRAINDICATED;
        } else {
          assessment.safety_level = SafetyLevel.MODIFY;
          assessment.required_modifications.push({
            type: restriction.restriction_type,
            details: restriction.details
          });
        }
        assessment.reasoning.push(`Movement restriction: ${restriction.details}`);
      }
    }

    // Check medical compatibility from database
    const dbCompatibility = await this.checkDatabaseCompatibility(exercise.id, userProfile.health_data.medical_conditions);
    if (dbCompatibility.length > 0) {
      const highestRisk = dbCompatibility.reduce((prev, current) => 
        this.getCompatibilityRiskLevel(current.compatibility_level) > this.getCompatibilityRiskLevel(prev.compatibility_level) 
          ? current : prev
      );

      if (highestRisk.compatibility_level === 'contraindicated') {
        assessment.safety_level = SafetyLevel.CONTRAINDICATED;
        assessment.reasoning.push(`Database contraindication: ${highestRisk.medical_reasoning}`);
      } else if (highestRisk.compatibility_level === 'modify_required') {
        assessment.safety_level = SafetyLevel.MODIFY;
        assessment.required_modifications.push(highestRisk.required_modifications);
        assessment.reasoning.push(`Database modification required: ${highestRisk.medical_reasoning}`);
      }
    }

    return assessment;
  }

  private async checkDatabaseCompatibility(exerciseId: string, medicalConditions: string[]): Promise<any[]> {
    try {
      const { data: compatibilities, error } = await supabase
        .from('medical_exercise_compatibility')
        .select('*')
        .eq('exercise_id', exerciseId)
        .in('medical_condition', medicalConditions);

      if (error) throw error;
      return compatibilities || [];
    } catch (error) {
      console.error('Error checking database compatibility:', error);
      return [];
    }
  }

  private getCompatibilityRiskLevel(level: string): number {
    const riskLevels = {
      'safe': 0,
      'caution': 1,
      'modify_required': 2,
      'contraindicated': 3
    };
    return riskLevels[level as keyof typeof riskLevels] || 0;
  }

  private async findSafeAlternatives(
    contraindicatedExercise: EnhancedExercise,
    userProfile: UserProfile
  ): Promise<EnhancedExercise[]> {
    try {
      // Find exercises with similar movement patterns but different execution
      const { data: alternatives, error } = await supabase
        .from('enhanced_exercises')
        .select('*')
        .overlaps('movement_patterns', contraindicatedExercise.movement_patterns || [])
        .neq('id', contraindicatedExercise.id)
        .eq('is_approved', true);

      if (error) throw error;

      if (!alternatives) return [];

      // Filter alternatives to ensure they're safe for the user
      const safeAlternatives: EnhancedExercise[] = [];
      for (const alternative of alternatives) {
        const safety = await this.assessExerciseSafety(alternative, userProfile);
        if (safety.safety_level === SafetyLevel.SAFE) {
          safeAlternatives.push(alternative);
        }
      }

      return safeAlternatives.slice(0, 3); // Return top 3 alternatives
    } catch (error) {
      console.error('Error finding safe alternatives:', error);
      return [];
    }
  }

  async getRehabilitationProgression(
    injuryType: string,
    currentPhase: number
  ): Promise<{
    exercises: string[];
    duration_weeks: number;
    progression_criteria: string[];
    next_phase?: number;
  } | null> {
    const profile = this.medicalExerciseMatrix.get(injuryType);
    if (!profile) return null;

    switch (currentPhase) {
      case 1:
        return {
          exercises: profile.progression_protocol.phase1_exercises,
          duration_weeks: profile.progression_protocol.phase1_weeks,
          progression_criteria: ['Pain-free movement', 'Improved range of motion'],
          next_phase: 2
        };
      case 2:
        return {
          exercises: profile.progression_protocol.phase2_exercises,
          duration_weeks: profile.progression_protocol.phase2_weeks,
          progression_criteria: ['Strength improvements', 'Stability gains'],
          next_phase: 3
        };
      case 3:
        return {
          exercises: profile.progression_protocol.phase3_exercises,
          duration_weeks: profile.progression_protocol.phase3_weeks,
          progression_criteria: ['Return to function', 'Sport-specific readiness']
        };
      default:
        return null;
    }
  }

  async logInjuryAssessment(
    userId: string,
    exerciseId: string,
    assessment: SafetyAssessment
  ): Promise<boolean> {
    try {
      // For now, we'll log this locally or to a generic events table
      // since injury_assessments table doesn't exist yet
      console.log('Injury Assessment:', {
        user_id: userId,
        exercise_id: exerciseId,
        safety_level: assessment.safety_level,
        risk_factors: assessment.risk_factors,
        modifications: assessment.required_modifications,
        reasoning: assessment.reasoning,
        assessed_at: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error logging injury assessment:', error);
      return false;
    }
  }

  async updateMedicalCompatibility(
    exerciseId: string,
    medicalCondition: string,
    compatibilityData: {
      compatibility_level: 'safe' | 'caution' | 'modify_required' | 'contraindicated';
      required_modifications?: any;
      alternative_exercises?: string[];
      medical_reasoning?: string;
      evidence_level?: 'high' | 'moderate' | 'low' | 'expert_opinion';
    }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('medical_exercise_compatibility')
        .upsert({
          exercise_id: exerciseId,
          medical_condition: medicalCondition,
          ...compatibilityData
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating medical compatibility:', error);
      return false;
    }
  }
}