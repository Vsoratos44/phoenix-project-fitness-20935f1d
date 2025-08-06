import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface UserProfile {
  user_id: string;
  primary_goal: string;
  fitness_level: string;
  available_equipment: string[];
  injury_history_summary: any[];
  one_rep_max_estimates: any;
  height_cm?: number;
  weight_kg?: number;
  preferred_workout_duration: number;
  training_frequency_goal: number;
  phoenix_score?: number;
}

interface Exercise {
  id: string;
  name: string;
  description?: string;
  exercise_type: string;
  exercise_type_detailed: string;
  intensity_level: string;
  muscle_group_primary: string;
  muscle_group_secondary?: string[];
  equipment_required: string[];
  injury_contraindications?: string[];
  difficulty_level: string;
  instructions?: string[];
  progression_data?: any;
}

interface WorkoutBlock {
  name: string;
  order: number;
  exercises: ExerciseWithParams[];
  rounds?: number;
  rest_between_rounds_seconds?: number;
}

interface ExerciseWithParams extends Exercise {
  sets?: number;
  reps?: number;
  reps_min?: number;
  reps_max?: number;
  weight_kg?: number;
  duration_seconds?: number;
  rest_seconds?: number;
  superset_group?: number;
  rpe_target?: number;
  tempo?: string;
}

interface GeneratedWorkout {
  id: string;
  name: string;
  description: string;
  archetype_id: string;
  blocks: WorkoutBlock[];
  coachNotes: string;
  estimated_duration_minutes: number;
  difficulty_rating: number;
  metabolic_score: number;
  strength_score: number;
}

/**
 * Phoenix Dynamic Workout Engine
 * The core algorithm that generates personalized, adaptive workouts
 */
class PhoenixWorkoutEngine {
  constructor(private supabase: any) {}

  /**
   * Creates default exercises when database is empty
   */
  private getDefaultExercises(): Exercise[] {
    return [
      {
        id: 'default-pushup',
        name: 'Push-ups',
        description: 'Classic bodyweight chest exercise',
        exercise_type: 'strength',
        exercise_type_detailed: 'compound',
        intensity_level: 'moderate',
        muscle_group_primary: 'chest',
        muscle_group_secondary: ['shoulders', 'triceps'],
        equipment_required: [],
        difficulty_level: 'beginner',
        instructions: ['Start in plank position', 'Lower chest to ground', 'Push back up']
      },
      {
        id: 'default-squat',
        name: 'Bodyweight Squats',
        description: 'Fundamental lower body movement',
        exercise_type: 'strength',
        exercise_type_detailed: 'compound',
        intensity_level: 'moderate',
        muscle_group_primary: 'legs',
        muscle_group_secondary: ['glutes'],
        equipment_required: [],
        difficulty_level: 'beginner',
        instructions: ['Stand with feet shoulder-width apart', 'Lower into squat position', 'Return to standing']
      },
      {
        id: 'default-plank',
        name: 'Plank Hold',
        description: 'Core stability exercise',
        exercise_type: 'strength',
        exercise_type_detailed: 'isometric',
        intensity_level: 'moderate',
        muscle_group_primary: 'core',
        equipment_required: [],
        difficulty_level: 'beginner',
        instructions: ['Hold plank position', 'Keep body straight', 'Engage core muscles']
      },
      {
        id: 'default-jumping-jacks',
        name: 'Jumping Jacks',
        description: 'Cardio warm-up movement',
        exercise_type: 'cardio',
        exercise_type_detailed: 'dynamic',
        intensity_level: 'low',
        muscle_group_primary: 'full_body',
        equipment_required: [],
        difficulty_level: 'beginner',
        instructions: ['Jump feet apart while raising arms', 'Jump back to starting position']
      },
      {
        id: 'default-arm-circles',
        name: 'Arm Circles',
        description: 'Dynamic shoulder warm-up',
        exercise_type: 'stretching',
        exercise_type_detailed: 'dynamic',
        intensity_level: 'low',
        muscle_group_primary: 'shoulders',
        equipment_required: [],
        difficulty_level: 'beginner',
        instructions: ['Extend arms to sides', 'Make small circles', 'Gradually increase size']
      },
      {
        id: 'default-child-pose',
        name: 'Child\'s Pose',
        description: 'Relaxing stretch for recovery',
        exercise_type: 'stretching',
        exercise_type_detailed: 'static',
        intensity_level: 'low',
        muscle_group_primary: 'back',
        equipment_required: [],
        difficulty_level: 'beginner',
        instructions: ['Kneel and sit back on heels', 'Reach arms forward', 'Hold and breathe']
      }
    ];
  }

  /**
   * Main entry point for workout generation
   */
  async generateWorkout(userProfile: UserProfile, targetDuration?: number): Promise<GeneratedWorkout> {
    console.log('🔥 Phoenix Workout Engine: Starting generation for user', userProfile.user_id);
    console.log('🕒 Target duration:', targetDuration, 'minutes');

    // Step 1: Select optimal workout archetype
    const archetype = await this.selectWorkoutArchetype(userProfile);
    console.log('📋 Selected archetype:', archetype.name);

    // Step 2: Get filtered exercise pool
    const availableExercises = await this.getFilteredExercises(userProfile);
    console.log('💪 Available exercises:', availableExercises.length);

    // Step 3: Build workout blocks - use dynamic if duration specified
    const workoutBlocks = targetDuration 
      ? await this.buildDynamicWorkoutBlocks(archetype, availableExercises, userProfile, targetDuration)
      : await this.buildWorkoutBlocks(archetype, availableExercises, userProfile);

    // Step 4: Calculate workout metrics
    const metrics = this.calculateWorkoutMetrics(workoutBlocks, archetype);
    
    // Add timing breakdown for dynamic workouts
    const timingBreakdown = targetDuration ? this.generateTimingBreakdown(workoutBlocks) : undefined;

    // Step 5: Generate empathetic coach notes
    const coachNotes = await this.generateCoachNotes(archetype, userProfile, workoutBlocks);

    const workout: GeneratedWorkout = {
      id: `phoenix_workout_${Date.now()}`,
      name: archetype.name,
      description: `${archetype.description}${targetDuration ? ` - Dynamically scaled for ${targetDuration} minutes` : ''}`,
      archetype_id: archetype.id,
      blocks: workoutBlocks,
      coachNotes,
      timing_breakdown: timingBreakdown,
      target_duration_minutes: targetDuration,
      superset_count: timingBreakdown?.total_supersets,
      ...metrics
    };

    // Step 6: Log generation for analytics and learning
    await this.logWorkoutGeneration(userProfile, archetype, workout);

    console.log('✅ Phoenix Workout Engine: Generation complete');
    return workout;
  }

  /**
   * Selects the optimal workout archetype based on user profile and Phoenix Score
   */
  private async selectWorkoutArchetype(userProfile: UserProfile): Promise<any> {
    const phoenixScore = userProfile.phoenix_score || 75; // Default if not available
    
    const { data: archetypes, error } = await this.supabase
      .from('workout_archetypes')
      .select('*')
      .contains('primary_goals', [userProfile.primary_goal])
      .contains('fitness_level_range', [userProfile.fitness_level]);

    if (error || !archetypes?.length) {
      console.warn('⚠️ No matching archetypes found, using default');
      return {
        id: 'default',
        name: 'Full Body Fitness',
        description: 'A well-rounded workout to improve all aspects of fitness',
        structure_template: { blocks: ['warmup', 'strength', 'cardio', 'cooldown'] },
        metabolic_emphasis: 0.5,
        strength_emphasis: 0.5
      };
    }

    // Filter by Phoenix Score range and select best match
    const suitableArchetypes = archetypes.filter(archetype => {
      const range = archetype.phoenix_score_range;
      return phoenixScore >= range.min && phoenixScore <= range.max;
    });

    if (suitableArchetypes.length === 0) {
      // Fallback to any archetype if Phoenix Score doesn't match
      return archetypes[0];
    }

    // For recovery days (low Phoenix Score), prioritize recovery archetypes
    if (phoenixScore < 50) {
      const recoveryArchetype = suitableArchetypes.find(a => a.name.includes('Recovery') || a.name.includes('Mobility'));
      if (recoveryArchetype) return recoveryArchetype;
    }

    return suitableArchetypes[0];
  }

  /**
   * Gets exercises filtered by equipment and injury contraindications
   */
  private async getFilteredExercises(userProfile: UserProfile): Promise<Exercise[]> {
    console.log('🔍 Fetching exercises for user profile:', userProfile.user_id);
    
    const { data: exercises, error } = await this.supabase
      .from('exercises')
      .select('*')
      .eq('is_approved', true);

    console.log('📊 Raw exercise count:', exercises?.length || 0);
    if (error) {
      console.error('❌ Error fetching exercises:', error);
      return [];
    }

    if (!exercises || exercises.length === 0) {
      console.warn('⚠️ No approved exercises found in database');
      // Return some default exercises for testing
      return this.getDefaultExercises();
    }

    // Filter by available equipment
    const equipmentFiltered = exercises.filter(exercise => {
      const required = exercise.equipment_required || [];
      const hasEquipment = required.length === 0 || required.some(eq => userProfile.available_equipment.includes(eq));
      return hasEquipment;
    });
    console.log('🏋️ After equipment filter:', equipmentFiltered.length);

    // Filter out contraindicated exercises based on injury history
    const injuryFiltered = equipmentFiltered.filter(exercise => {
      const contraindications = exercise.injury_contraindications || [];
      const userInjuries = userProfile.injury_history_summary.map((injury: any) => injury.type);
      
      const isContraindicated = contraindications.some(contra => userInjuries.includes(contra));
      return !isContraindicated;
    });
    console.log('🩹 After injury filter:', injuryFiltered.length);

    if (injuryFiltered.length === 0) {
      console.warn('⚠️ No exercises remain after filtering, falling back to defaults');
      return this.getDefaultExercises();
    }

    return injuryFiltered;
  }

  /**
   * Builds dynamic workout blocks scaled to target duration
   */
  private async buildDynamicWorkoutBlocks(archetype: any, exercises: Exercise[], userProfile: UserProfile, targetDuration: number = 45): Promise<WorkoutBlock[]> {
    const blocks: WorkoutBlock[] = [];
    let usedTime = 0;
    
    console.log(`🕒 Building dynamic workout for ${targetDuration} minutes`);

    // Always include warm-up (5-8 minutes)
    const warmupBlock = this.buildWarmupBlock(exercises, userProfile, 1);
    blocks.push(warmupBlock);
    usedTime += 7; // Average warm-up time

    // Calculate available time for main work
    const availableMainTime = targetDuration - usedTime - 5; // Reserve 5 min for cool-down
    
    // Dynamic superset allocation based on timing constraints
    if (availableMainTime >= 15) {
      const supersetBlock = this.buildDynamicSupersetBlock(exercises, userProfile, 2, availableMainTime);
      blocks.push(supersetBlock);
      usedTime += supersetBlock.estimated_duration || availableMainTime;
    }

    // Add mobility/cool-down
    const cooldownBlock = this.buildCooldownBlock(exercises, userProfile, blocks.length + 1);
    blocks.push(cooldownBlock);
    
    console.log(`✅ Dynamic blocks created: ${blocks.length} blocks, ~${usedTime + 5} minutes`);
    return blocks;
  }

  /**
   * Builds workout blocks based on archetype structure (legacy method)
   */
  private async buildWorkoutBlocks(archetype: any, exercises: Exercise[], userProfile: UserProfile): Promise<WorkoutBlock[]> {
    const blocks: WorkoutBlock[] = [];
    const structure = archetype.structure_template?.blocks || ['warmup', 'strength', 'cardio', 'cooldown'];

    console.log(`🏗️ Building ${structure.length} workout blocks using archetype: ${archetype.name}`);
    console.log(`📋 Block structure: ${structure.join(' → ')}`);

    for (let i = 0; i < structure.length; i++) {
      const blockType = structure[i];
      let block: WorkoutBlock;

      switch (blockType) {
        case 'warmup':
        case 'gentle_warmup':
          block = this.buildWarmupBlock(exercises, userProfile, i + 1);
          break;
        case 'strength':
        case 'strength_superset':
        case 'compound_strength':
          block = this.buildStrengthBlock(exercises, userProfile, i + 1, archetype);
          break;
        case 'cardio':
        case 'metabolic_circuit':
        case 'hiit_intervals':
        case 'cardio_intervals':
          block = this.buildMetabolicBlock(exercises, userProfile, i + 1, archetype);
          break;
        case 'cooldown':
        case 'deep_stretch':
          block = this.buildCooldownBlock(exercises, userProfile, i + 1);
          break;
        case 'mobility_flow':
          block = this.buildMobilityBlock(exercises, userProfile, i + 1);
          break;
        case 'accessory_work':
          block = this.buildAccessoryBlock(exercises, userProfile, i + 1);
          break;
        default:
          block = this.buildStrengthBlock(exercises, userProfile, i + 1, archetype);
      }

      blocks.push(block);
    }

    return blocks;
  }

  /**
   * Builds a dynamic warm-up block
   */
  private buildWarmupBlock(exercises: Exercise[], userProfile: UserProfile, order: number): WorkoutBlock {
    const cardioWarmup = exercises.filter(ex => 
      ex.exercise_type === 'cardio' && ex.intensity_level === 'low'
    );
    
    const dynamicStretches = exercises.filter(ex => 
      ex.exercise_type === 'stretching' && ex.description?.includes('dynamic')
    );

    const selectedExercises: ExerciseWithParams[] = [];

    // Add light cardio (5 minutes)
    if (cardioWarmup.length > 0) {
      selectedExercises.push({
        ...cardioWarmup[0],
        duration_seconds: 300,
        sets: 1
      });
    }

    // Add 2-3 dynamic movements
    const shuffledStretches = dynamicStretches.sort(() => 0.5 - Math.random());
    for (let i = 0; i < Math.min(3, shuffledStretches.length); i++) {
      selectedExercises.push({
        ...shuffledStretches[i],
        reps: 10,
        sets: 1,
        rest_seconds: 15
      });
    }

    return {
      name: 'Dynamic Warm-up',
      order,
      exercises: selectedExercises
    };
  }

  /**
   * Builds a strength training block with progressive overload
   */
  private buildStrengthBlock(exercises: Exercise[], userProfile: UserProfile, order: number, archetype: any): WorkoutBlock {
    const strengthExercises = exercises.filter(ex => ex.exercise_type === 'strength');
    
    // Prioritize compound movements
    const compoundMovements = strengthExercises.filter(ex => 
      ex.muscle_group_secondary && ex.muscle_group_secondary.length > 0
    );
    
    const isolationMovements = strengthExercises.filter(ex => 
      !ex.muscle_group_secondary || ex.muscle_group_secondary.length === 0
    );

    const selectedExercises: ExerciseWithParams[] = [];

    // Primary compound movement
    if (compoundMovements.length > 0) {
      const primaryLift = compoundMovements[Math.floor(Math.random() * compoundMovements.length)];
      const progressiveParams = this.calculateProgressiveOverload(primaryLift, userProfile);
      
      selectedExercises.push({
        ...primaryLift,
        ...progressiveParams,
        superset_group: archetype.metabolic_emphasis > 0.5 ? 1 : undefined
      });
    }

    // Accessory movements (superset for metabolic effect)
    const accessoryCount = archetype.metabolic_emphasis > 0.5 ? 3 : 2;
    const shuffledAccessory = [...compoundMovements, ...isolationMovements]
      .filter(ex => !selectedExercises.find(sel => sel.id === ex.id))
      .sort(() => 0.5 - Math.random());

    for (let i = 0; i < Math.min(accessoryCount, shuffledAccessory.length); i++) {
      const params = this.calculateAccessoryParams(shuffledAccessory[i], userProfile);
      selectedExercises.push({
        ...shuffledAccessory[i],
        ...params,
        superset_group: archetype.metabolic_emphasis > 0.5 ? (i % 2) + 1 : undefined
      });
    }

    return {
      name: 'Strength & Power',
      order,
      exercises: selectedExercises
    };
  }

  /**
   * Builds a metabolic conditioning block
   */
  private buildMetabolicBlock(exercises: Exercise[], userProfile: UserProfile, order: number, archetype: any): WorkoutBlock {
    const metabolicExercises = exercises.filter(ex => 
      ex.exercise_type === 'cardio' || 
      ex.exercise_type === 'plyometrics' ||
      (ex.exercise_type === 'strength' && ex.intensity_level === 'high')
    );

    const selectedExercises: ExerciseWithParams[] = [];
    const shuffled = metabolicExercises.sort(() => 0.5 - Math.random());
    
    // Select 3-4 exercises for circuit
    const circuitSize = Math.min(4, shuffled.length);
    const workDuration = userProfile.fitness_level === 'beginner' ? 30 : 45;
    const restDuration = userProfile.fitness_level === 'beginner' ? 60 : 30;

    for (let i = 0; i < circuitSize; i++) {
      selectedExercises.push({
        ...shuffled[i],
        duration_seconds: workDuration,
        rest_seconds: restDuration,
        rpe_target: userProfile.fitness_level === 'beginner' ? 7 : 8
      });
    }

    return {
      name: 'Metabolic Conditioning Circuit',
      order,
      exercises: selectedExercises,
      rounds: userProfile.fitness_level === 'beginner' ? 2 : 3,
      rest_between_rounds_seconds: 90
    };
  }

  /**
   * Builds a cool-down block
   */
  private buildCooldownBlock(exercises: Exercise[], userProfile: UserProfile, order: number): WorkoutBlock {
    const staticStretches = exercises.filter(ex => 
      ex.exercise_type === 'stretching' && 
      (!ex.description?.includes('dynamic') || ex.description?.includes('static'))
    );

    const selectedExercises: ExerciseWithParams[] = [];
    const shuffled = staticStretches.sort(() => 0.5 - Math.random());

    for (let i = 0; i < Math.min(4, shuffled.length); i++) {
      selectedExercises.push({
        ...shuffled[i],
        duration_seconds: 60,
        sets: 1
      });
    }

    return {
      name: 'Cool-down & Recovery',
      order,
      exercises: selectedExercises
    };
  }

  /**
   * Builds a mobility-focused block
   */
  private buildMobilityBlock(exercises: Exercise[], userProfile: UserProfile, order: number): WorkoutBlock {
    const mobilityExercises = exercises.filter(ex => 
      ex.exercise_type === 'stretching' || 
      (ex.exercise_type === 'strength' && ex.intensity_level === 'low')
    );

    const selectedExercises: ExerciseWithParams[] = [];
    const shuffled = mobilityExercises.sort(() => 0.5 - Math.random());

    for (let i = 0; i < Math.min(5, shuffled.length); i++) {
      selectedExercises.push({
        ...shuffled[i],
        duration_seconds: 45,
        sets: 2,
        rest_seconds: 30
      });
    }

    return {
      name: 'Mobility & Movement Flow',
      order,
      exercises: selectedExercises
    };
  }

  /**
   * Builds an accessory work block
   */
  private buildAccessoryBlock(exercises: Exercise[], userProfile: UserProfile, order: number): WorkoutBlock {
    const accessoryExercises = exercises.filter(ex => 
      ex.exercise_type === 'strength' && 
      ex.difficulty_level !== 'advanced'
    );

    const selectedExercises: ExerciseWithParams[] = [];
    const shuffled = accessoryExercises.sort(() => 0.5 - Math.random());

    for (let i = 0; i < Math.min(3, shuffled.length); i++) {
      const params = this.calculateAccessoryParams(shuffled[i], userProfile);
      selectedExercises.push({
        ...shuffled[i],
        ...params
      });
    }

    return {
      name: 'Accessory & Isolation',
      order,
      exercises: selectedExercises
    };
  /**
   * Builds a comprehensive dynamic superset block with intelligent exercise selection
   */
  private buildDynamicSupersetBlock(exercises: Exercise[], userProfile: UserProfile, order: number, targetMinutes: number): WorkoutBlock {
    console.log(`🏗️ Building dynamic superset block for ${targetMinutes} minutes`);
    console.log(`💪 Total available exercises: ${exercises.length}`);
    
    // Filter exercises by type and difficulty
    const strengthExercises = exercises.filter(ex => 
      ex.exercise_type === 'strength' && 
      (ex.difficulty_level === userProfile.fitness_level || 
       (userProfile.fitness_level === 'intermediate' && ex.difficulty_level === 'beginner'))
    );

    const cardioExercises = exercises.filter(ex => 
      ex.exercise_type === 'cardio' && 
      ex.intensity_level !== 'low'
    );

    const plyoExercises = exercises.filter(ex => 
      ex.exercise_type === 'plyometrics'
    );

    console.log(`🏋️ Strength exercises: ${strengthExercises.length}`);
    console.log(`🏃 Cardio exercises: ${cardioExercises.length}`);
    console.log(`🚀 Plyometric exercises: ${plyoExercises.length}`);

    // Combine all suitable exercises for superset selection
    const supersetExercises = [...strengthExercises, ...cardioExercises, ...plyoExercises];
    
    if (supersetExercises.length === 0) {
      console.warn('⚠️ No suitable exercises found for supersets, using defaults');
      return {
        name: 'Dynamic Superset Complex (0 supersets)',
        order,
        exercises: [],
        estimated_duration: targetMinutes
      };
    }

    const selectedExercises: ExerciseWithParams[] = [];
    
    // Calculate work parameters based on time constraint and fitness level
    const workTime = userProfile.fitness_level === 'beginner' ? 30 : 45; // seconds per exercise
    const restTime = userProfile.fitness_level === 'beginner' ? 45 : 30; // seconds between exercises
    const supersetRest = userProfile.fitness_level === 'beginner' ? 120 : 90; // seconds between supersets
    
    // Determine optimal superset structure
    const exercisesPerSuperset = 2;
    const timePerSuperset = (workTime * exercisesPerSuperset) + (restTime * (exercisesPerSuperset - 1)) + supersetRest;
    const targetSupersets = Math.max(1, Math.floor((targetMinutes * 60) / timePerSuperset));
    const exercisesNeeded = targetSupersets * exercisesPerSuperset;
    
    console.log(`🎯 Target: ${targetSupersets} supersets with ${exercisesNeeded} exercises`);
    console.log(`⏱️ Work: ${workTime}s, Rest: ${restTime}s, Superset Rest: ${supersetRest}s`);

    // Intelligent exercise selection for balanced supersets
    const selectedCount = Math.min(exercisesNeeded, supersetExercises.length);
    const shuffledExercises = supersetExercises.sort(() => 0.5 - Math.random());
    
    // Create balanced supersets (alternate muscle groups when possible)
    for (let i = 0; i < selectedCount; i++) {
      const exercise = shuffledExercises[i];
      const supersetGroup = Math.floor(i / exercisesPerSuperset) + 1;
      
      // Determine exercise parameters based on type and user level
      let exerciseParams: Partial<ExerciseWithParams> = {
        sets: userProfile.fitness_level === 'beginner' ? 2 : 3,
        rest_seconds: restTime,
        superset_group: supersetGroup,
        rpe_target: userProfile.fitness_level === 'beginner' ? 6 : 7
      };

      // Type-specific parameters
      if (exercise.exercise_type === 'strength') {
        exerciseParams = {
          ...exerciseParams,
          reps_min: userProfile.fitness_level === 'beginner' ? 8 : 10,
          reps_max: userProfile.fitness_level === 'beginner' ? 12 : 15,
          rpe_target: userProfile.fitness_level === 'beginner' ? 7 : 8
        };
      } else if (exercise.exercise_type === 'cardio' || exercise.exercise_type === 'plyometrics') {
        exerciseParams = {
          ...exerciseParams,
          duration_seconds: workTime,
          rpe_target: userProfile.fitness_level === 'beginner' ? 8 : 9
        };
      }
      
      selectedExercises.push({
        ...exercise,
        ...exerciseParams
      });
    }

    console.log(`✅ Created ${selectedExercises.length} exercises in ${Math.ceil(selectedCount / exercisesPerSuperset)} supersets`);

    // Log exercise breakdown by type
    const strengthCount = selectedExercises.filter(ex => ex.exercise_type === 'strength').length;
    const cardioCount = selectedExercises.filter(ex => ex.exercise_type === 'cardio').length;
    const plyoCount = selectedExercises.filter(ex => ex.exercise_type === 'plyometrics').length;
    
    console.log(`📊 Exercise breakdown - Strength: ${strengthCount}, Cardio: ${cardioCount}, Plyo: ${plyoCount}`);

    return {
      name: `Dynamic Superset Complex (${Math.ceil(selectedCount / exercisesPerSuperset)} supersets)`,
      order,
      exercises: selectedExercises,
      estimated_duration: targetMinutes
    };
  }

  /**
   * Generates timing breakdown for dynamic workouts
   */
  private generateTimingBreakdown(blocks: WorkoutBlock[]): any {
    let totalExercises = 0;
    let totalSupersets = 0;
    let estimatedMinutes = 0;

    blocks.forEach(block => {
      totalExercises += block.exercises.length;
      
      // Count supersets
      const supersetGroups = new Set(block.exercises.map(ex => ex.superset_group).filter(Boolean));
      totalSupersets += supersetGroups.size;
      
      // Estimate duration
      estimatedMinutes += block.estimated_duration || this.calculateBlockDuration(block);
    });

    return {
      total_exercises: totalExercises,
      total_supersets: totalSupersets,
      estimated_minutes: Math.round(estimatedMinutes)
    };
  }

  /**
   * Calculates estimated duration for a workout block
   */
  private calculateBlockDuration(block: WorkoutBlock): number {
    let totalSeconds = 0;
    
    block.exercises.forEach(exercise => {
      const sets = exercise.sets || 1;
      const workTime = exercise.duration_seconds || (exercise.reps || 12) * 3; // Estimate 3 seconds per rep
      const restTime = exercise.rest_seconds || 60;
      
      totalSeconds += (workTime + restTime) * sets;
    });
    
    return Math.round(totalSeconds / 60); // Convert to minutes
  }

  /**
   * Calculates progressive overload parameters for primary lifts
   */
  private calculateProgressiveOverload(exercise: Exercise, userProfile: UserProfile): any {
    const oneRepMax = userProfile.one_rep_max_estimates?.[exercise.id];
    
    if (oneRepMax) {
      // Use percentage-based programming
      const intensity = userProfile.fitness_level === 'beginner' ? 0.7 : 0.8;
      const weight = oneRepMax * intensity;
      
      return {
        sets: userProfile.fitness_level === 'beginner' ? 3 : 4,
        reps: userProfile.fitness_level === 'beginner' ? 10 : 8,
        weight_kg: Math.round(weight * 10) / 10,
        rest_seconds: 90,
        rpe_target: 7
      };
    }

    // Default parameters for new exercises
    return {
      sets: 3,
      reps: userProfile.fitness_level === 'beginner' ? 12 : 10,
      rest_seconds: 90,
      rpe_target: 6
    };
  }

  /**
   * Calculates parameters for accessory exercises
   */
  private calculateAccessoryParams(exercise: Exercise, userProfile: UserProfile): any {
    return {
      sets: 3,
      reps_min: 8,
      reps_max: 12,
      rest_seconds: 60,
      rpe_target: userProfile.fitness_level === 'beginner' ? 6 : 7
    };
  }

  /**
   * Calculates workout metrics
   */
  private calculateWorkoutMetrics(blocks: WorkoutBlock[], archetype: any): any {
    let estimatedDuration = 0;
    
    blocks.forEach(block => {
      block.exercises.forEach(exercise => {
        if (exercise.duration_seconds) {
          estimatedDuration += exercise.duration_seconds * (exercise.sets || 1);
        } else {
          // Estimate time for rep-based exercises
          const timePerSet = (exercise.reps || exercise.reps_max || 10) * 3; // 3 seconds per rep
          estimatedDuration += timePerSet * (exercise.sets || 1);
        }
        
        estimatedDuration += (exercise.rest_seconds || 60) * ((exercise.sets || 1) - 1);
      });
      
      if (block.rounds && block.rounds > 1) {
        estimatedDuration *= block.rounds;
        estimatedDuration += (block.rest_between_rounds_seconds || 60) * (block.rounds - 1);
      }
    });

    return {
      estimated_duration_minutes: Math.round(estimatedDuration / 60),
      difficulty_rating: this.calculateDifficultyRating(blocks),
      metabolic_score: Math.round(archetype.metabolic_emphasis * 100),
      strength_score: Math.round(archetype.strength_emphasis * 100)
    };
  }

  /**
   * Calculates difficulty rating based on exercise selection and parameters
   */
  private calculateDifficultyRating(blocks: WorkoutBlock[]): number {
    let totalDifficulty = 0;
    let exerciseCount = 0;

    blocks.forEach(block => {
      block.exercises.forEach(exercise => {
        let difficulty = 5; // Base difficulty

        if (exercise.difficulty_level === 'beginner') difficulty = 3;
        else if (exercise.difficulty_level === 'intermediate') difficulty = 5;
        else if (exercise.difficulty_level === 'advanced') difficulty = 8;

        // Adjust based on intensity
        if (exercise.rpe_target && exercise.rpe_target >= 8) difficulty += 2;
        if (exercise.superset_group) difficulty += 1;

        totalDifficulty += difficulty;
        exerciseCount++;
      });
    });

    return Math.min(10, Math.round(totalDifficulty / exerciseCount));
  }

  /**
   * Generates empathetic coaching notes using LLM
   */
  private async generateCoachNotes(archetype: any, userProfile: UserProfile, blocks: WorkoutBlock[]): Promise<string> {
    if (!openAIApiKey) {
      return `Today's ${archetype.name} workout is designed specifically for your ${userProfile.primary_goal} goal. Focus on proper form and listen to your body throughout the session. You've got this! 💪`;
    }

    try {
      const keyExercises = blocks
        .flatMap(block => block.exercises)
        .slice(0, 3)
        .map(ex => ex.name)
        .join(', ');

      const phoenixScore = userProfile.phoenix_score || 75;
      
      const prompt = `You are Phoenix, a world-class, empathetic, and encouraging personal trainer. Your client's profile:
      
Name: (Keep anonymous, use "you" or "friend")
Primary Goal: ${userProfile.primary_goal.replace('_', ' ')}
Fitness Level: ${userProfile.fitness_level}
Phoenix Readiness Score: ${phoenixScore}/100
Workout Type: ${archetype.name}
Key Exercises: ${keyExercises}
Estimated Duration: ${this.calculateWorkoutMetrics(blocks, archetype).estimated_duration_minutes} minutes

Write a brief, motivational "Coach's Note" (2-3 sentences) that:
1. Acknowledges their readiness level
2. Explains the workout's purpose 
3. Provides encouraging motivation
4. Includes specific guidance for their goal

Keep it personal, positive, and actionable. Use a warm, supportive tone.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are Phoenix, an empathetic and encouraging personal trainer who provides brief, motivational coaching notes.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 200
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content.trim();
      }
    } catch (error) {
      console.error('⚠️ Error generating coach notes:', error);
    }

    // Fallback coaching note
    return `Today's ${archetype.name} workout is perfectly calibrated for your current readiness level. Remember to focus on quality over quantity - every rep is building a stronger, more resilient you. Trust the process and give it your best effort! 🔥`;
  }

  /**
   * Logs workout generation for analytics and future improvements
   */
  private async logWorkoutGeneration(userProfile: UserProfile, archetype: any, workout: GeneratedWorkout): Promise<void> {
    try {
      await this.supabase
        .from('workout_generations')
        .insert({
          user_id: userProfile.user_id,
          archetype_id: archetype.id,
          generation_context: {
            phoenix_score: userProfile.phoenix_score,
            fitness_level: userProfile.fitness_level,
            primary_goal: userProfile.primary_goal,
            available_equipment: userProfile.available_equipment
          },
          generated_workout: workout,
          phoenix_score_at_generation: userProfile.phoenix_score || 75
        });
    } catch (error) {
      console.error('⚠️ Error logging workout generation:', error);
    }
  }

  /**
   * Real-time workout adaptation during session
   */
  async adaptWorkout(currentWorkout: GeneratedWorkout, feedback: {
    exerciseId: string;
    rpe?: number;
    pain_signal?: string;
    difficulty_feedback?: string;
  }): Promise<GeneratedWorkout> {
    const { exerciseId, rpe, pain_signal, difficulty_feedback } = feedback;

    // Find and modify the specific exercise
    for (const block of currentWorkout.blocks) {
      const exerciseIndex = block.exercises.findIndex(ex => ex.id === exerciseId);
      
      if (exerciseIndex > -1) {
        const currentExercise = block.exercises[exerciseIndex];

        // Handle pain signals - immediate substitution
        if (pain_signal) {
          const alternative = await this.findSafeAlternative(currentExercise);
          if (alternative) {
            block.exercises[exerciseIndex] = {
              ...alternative,
              sets: currentExercise.sets,
              reps: currentExercise.reps,
              duration_seconds: currentExercise.duration_seconds
            };
            
            currentWorkout.coachNotes += `\n\n🚨 I noticed you felt some discomfort, so I've swapped that exercise for a safer alternative. Always listen to your body - you're making the right choice!`;
          }
          break;
        }

        // Handle high RPE - reduce intensity
        if (rpe && rpe >= 9) {
          if (currentExercise.weight_kg) {
            currentExercise.weight_kg = Math.round((currentExercise.weight_kg * 0.9) * 10) / 10;
          }
          if (currentExercise.reps && currentExercise.reps > 6) {
            currentExercise.reps -= 2;
          }
          
          currentWorkout.coachNotes += `\n\n💡 I've adjusted the intensity based on your feedback. Quality over quantity - you're doing great!`;
        }

        // Handle difficulty feedback
        if (difficulty_feedback === 'too_easy' && currentExercise.weight_kg) {
          currentExercise.weight_kg = Math.round((currentExercise.weight_kg * 1.1) * 10) / 10;
        }
        
        break;
      }
    }

    return currentWorkout;
  }

  /**
   * Finds a safe alternative exercise
   */
  private async findSafeAlternative(exercise: ExerciseWithParams): Promise<Exercise | null> {
    const { data: alternatives } = await this.supabase
      .from('exercises')
      .select('*')
      .eq('muscle_group_primary', exercise.muscle_group_primary)
      .eq('is_approved', true)
      .neq('id', exercise.id)
      .limit(5);

    if (alternatives && alternatives.length > 0) {
      // Return a simpler/safer alternative (preferring lower difficulty)
      return alternatives.find(alt => alt.difficulty_level === 'beginner') || alternatives[0];
    }

    return null;
  }

  /**
   * Builds a dynamic superset block based on duration constraints
   * Each superset follows 2:1 work to rest ratio with timing:
   * - 1 minute per exercise
   * - 3-4 exercises per superset  
   * - Max 6.5 minutes per superset (4 exercises + rest)
   */
  private buildDynamicSupersetBlock(exercises: Exercise[], userProfile: UserProfile, order: number, targetDuration: number = 45): WorkoutBlock & { estimated_duration?: number; timing_notes?: string } {
    // Filter exercises suitable for supersets
    const supersetExercises = exercises.filter(ex => 
      ex.exercise_type === 'strength' && 
      ex.intensity_level !== 'low'
    );

    const selectedExercises: ExerciseWithParams[] = [];
    let currentGroup = 'A';
    
    // Calculate number of supersets based on duration
    // Each superset should take ~6.5 minutes (4 exercises × 1 min + 2.5 min rest)
    const supersetDuration = 6.5; // minutes per superset
    const maxSupersets = Math.floor(targetDuration / supersetDuration);
    const exercisesPerSuperset = targetDuration < 35 ? 3 : 4; // Fewer exercises for shorter workouts
    
    // Create dynamic number of supersets
    const totalSupersets = Math.min(maxSupersets, Math.floor(supersetExercises.length / exercisesPerSuperset));
    
    for (let supersetIndex = 0; supersetIndex < totalSupersets; supersetIndex++) {
      const startIndex = supersetIndex * exercisesPerSuperset;
      
      for (let exerciseIndex = 0; exerciseIndex < exercisesPerSuperset && startIndex + exerciseIndex < supersetExercises.length; exerciseIndex++) {
        const exercise = supersetExercises[startIndex + exerciseIndex];
        const isLastInSuperset = exerciseIndex === exercisesPerSuperset - 1;
        
        // Calculate timing based on 2:1 work to rest ratio within superset
        const workTime = 60; // 1 minute per exercise
        const intraSetRest = 30; // 30 seconds between exercises in superset
        const interSetRest = isLastInSuperset ? 150 : intraSetRest; // 2.5 minutes after completing superset
        
        selectedExercises.push({
          ...exercise,
          sets: 3,
          reps_min: 10,
          reps_max: 12,
          rest_seconds: interSetRest,
          superset_group: currentGroup.charCodeAt(0) - 64, // Convert A,B,C to 1,2,3
          rpe_target: 7
        });
      }
      
      currentGroup = String.fromCharCode(currentGroup.charCodeAt(0) + 1);
    }

    return {
      name: `Dynamic Superset Complex (${totalSupersets} supersets)`,
      order,
      exercises: selectedExercises,
      estimated_duration: totalSupersets * supersetDuration,
      timing_notes: `Each superset: ~${supersetDuration} min (2:1 work:rest ratio)`
    };
  }

  /**
   * Calculate actual workout duration based on blocks
   */
  private calculateActualWorkoutDuration(blocks: WorkoutBlock[]): number {
    return blocks.reduce((sum, block) => {
      const blockDuration = block.exercises.reduce((exerciseSum, ex) => {
        const exerciseTime = (ex.sets || 1) * ((ex.duration_seconds || 60) + (ex.rest_seconds || 60));
        return exerciseSum + exerciseTime;
      }, 0);
      return sum + blockDuration;
    }, 0);
  }

  /**
   * Generate timing breakdown for workout analysis
   */
  private generateTimingBreakdown(blocks: WorkoutBlock[]): any {
    const breakdown = blocks.map(block => {
      const supersetGroups = new Set(block.exercises.map(ex => ex.superset_group).filter(Boolean));
      const totalExercises = block.exercises.length;
      const estimatedMinutes = Math.round(
        block.exercises.reduce((sum, ex) => {
          return sum + ((ex.sets || 1) * ((ex.duration_seconds || 60) + (ex.rest_seconds || 60))) / 60;
        }, 0)
      );

      return {
        name: block.name,
        exercises: totalExercises,
        supersets: supersetGroups.size,
        estimated_minutes: estimatedMinutes,
        timing_strategy: supersetGroups.size > 0 ? '2:1 work:rest ratio' : 'Standard rest periods'
      };
    });

    return {
      blocks: breakdown,
      total_supersets: breakdown.reduce((sum, block) => sum + block.supersets, 0),
      total_exercises: breakdown.reduce((sum, block) => sum + block.exercises, 0),
      total_estimated_minutes: breakdown.reduce((sum, block) => sum + block.estimated_minutes, 0)
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userProfile, currentWorkout, feedback, targetDuration } = await req.json();
    
    // For testing, allow requests without strict auth
    let userId = 'test-user';
    
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (user) {
          userId = user.id;
        }
      } catch (error) {
        console.log('Auth failed, continuing with test user:', error);
      }
    }

    console.log(`🔥 Phoenix Engine request: ${action} for user ${userId}`);

    const engine = new PhoenixWorkoutEngine(supabase);
    let result;

    switch (action) {
      case 'generate':
        if (userProfile) {
          result = await engine.generateWorkout({ ...userProfile, user_id: userId }, targetDuration || userProfile.preferred_workout_duration);
        } else {
          // Create a default profile for testing
          const defaultProfile = {
            user_id: userId,
            primary_goal: 'build_muscle',
            fitness_level: 'intermediate',
            available_equipment: ['bodyweight'],
            injury_history_summary: [],
            one_rep_max_estimates: {},
            preferred_workout_duration: 45,
            training_frequency_goal: 3,
            phoenix_score: 75
          };
          result = await engine.generateWorkout(defaultProfile, targetDuration || 45);
        }
        break;

      case 'adapt':
        if (!currentWorkout || !feedback) {
          throw new Error('Current workout and feedback required for adaptation');
        }
        result = await engine.adaptWorkout(currentWorkout, feedback);
        break;

      default:
        throw new Error('Invalid action. Use "generate" or "adapt"');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Phoenix Workout Engine Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: 'Phoenix Workout Engine encountered an error'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});