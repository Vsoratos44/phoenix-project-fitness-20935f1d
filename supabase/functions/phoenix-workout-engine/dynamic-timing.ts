// Dynamic timing utilities for Phoenix Workout Engine

/**
 * Builds a dynamic superset block based on duration constraints
 * Each superset follows 2:1 work to rest ratio with timing:
 * - 1 minute per exercise
 * - 3-4 exercises per superset  
 * - Max 6.5 minutes per superset (4 exercises + rest)
 */
export function buildDynamicSupersetBlock(exercises: any[], userProfile: any, order: number, targetDuration: number = 45): any {
  // Filter exercises suitable for supersets
  const supersetExercises = exercises.filter(ex => 
    ex.exercise_type === 'strength' && 
    ex.intensity_level !== 'low'
  );

  const selectedExercises: any[] = [];
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
        superset_group: currentGroup,
        rpe_target: 7,
        estimated_work_time: workTime,
        notes: `Part ${exerciseIndex + 1} of ${exercisesPerSuperset} in superset ${currentGroup}`
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
export function calculateActualWorkoutDuration(blocks: any[]): number {
  return blocks.reduce((sum, block) => {
    const blockDuration = block.exercises.reduce((exerciseSum: number, ex: any) => {
      const exerciseTime = (ex.sets || 1) * ((ex.estimated_work_time || ex.duration_seconds || 60) + (ex.rest_seconds || 60));
      return exerciseSum + exerciseTime;
    }, 0);
    return sum + blockDuration;
  }, 0);
}

/**
 * Generate timing breakdown for workout analysis
 */
export function generateTimingBreakdown(blocks: any[]): any {
  const breakdown = blocks.map(block => {
    const supersetGroups = new Set(block.exercises.map((ex: any) => ex.superset_group).filter(Boolean));
    const totalExercises = block.exercises.length;
    const estimatedMinutes = block.estimated_duration || Math.round(
      block.exercises.reduce((sum: number, ex: any) => {
        return sum + ((ex.sets || 1) * ((ex.estimated_work_time || 60) + (ex.rest_seconds || 60))) / 60;
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