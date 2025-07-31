/**
 * Phoenix Project Fitness - Workout Logger
 * 
 * Comprehensive workout tracking system with real-time logging,
 * set tracking, rest timers, and SEP rewards calculation.
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Play, 
  Pause, 
  Square, 
  Plus,
  Trash2,
  Timer,
  Target,
  TrendingUp,
  Award,
  Flame,
  Clock,
  Weight
} from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  primary_muscle_groups: string[];
  instructions?: any;
  met_value?: number;
}

interface Set {
  id: string;
  setNumber: number;
  reps: number | null;
  weightKg: number | null;
  durationSeconds: number | null;
  restSeconds: number | null;
  rpe: number | null;
  isCompleted: boolean;
  isPersonalRecord: boolean;
}

interface ExerciseLog {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  orderIndex: number;
  sets: Set[];
  notes: string;
  targetSets: number;
  targetReps: number;
  targetWeight: number;
  isCompleted: boolean;
}

interface WorkoutSession {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date | null;
  exercises: ExerciseLog[];
  notes: string;
  isActive: boolean;
}

interface WorkoutLoggerProps {
  initialWorkout?: Partial<WorkoutSession>;
  onWorkoutComplete?: (session: WorkoutSession) => void;
}

export function WorkoutLogger({ initialWorkout, onWorkoutComplete }: WorkoutLoggerProps) {
  const [workout, setWorkout] = useState<WorkoutSession>({
    id: '',
    name: initialWorkout?.name || 'New Workout',
    startTime: new Date(),
    endTime: null,
    exercises: initialWorkout?.exercises || [],
    notes: '',
    isActive: true,
  });

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);

  const { toast } = useToast();
  const { user } = useAuth();

  // Timer for workout duration
  useEffect(() => {
    if (!workout.isActive) return;

    const interval = setInterval(() => {
      setWorkoutDuration(Date.now() - workout.startTime.getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [workout.isActive, workout.startTime]);

  // Rest timer
  useEffect(() => {
    if (!isResting || restTimeRemaining <= 0) return;

    const interval = setInterval(() => {
      setRestTimeRemaining(prev => {
        if (prev <= 1) {
          setIsResting(false);
          toast({
            title: "Rest Complete! 💪",
            description: "Time for your next set!",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isResting, restTimeRemaining, toast]);

  // Load available exercises
  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('id, name, primary_muscle_groups, instructions, met_value')
        .eq('is_approved', true)
        .limit(50);

      if (error) throw error;
      setAvailableExercises(data || []);
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const startWorkout = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          name: workout.name,
          start_time: workout.startTime.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setWorkout(prev => ({ ...prev, id: data.id }));
      
      toast({
        title: "Workout Started! 🔥",
        description: "Let's crush this session!",
      });
    } catch (error) {
      console.error('Error starting workout:', error);
      toast({
        title: "Error",
        description: "Failed to start workout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addExercise = (exercise: Exercise) => {
    const newExerciseLog: ExerciseLog = {
      id: `temp-${Date.now()}`,
      exerciseId: exercise.id,
      exercise,
      orderIndex: workout.exercises.length,
      sets: [],
      notes: '',
      targetSets: 3,
      targetReps: 12,
      targetWeight: 0,
      isCompleted: false,
    };

    setWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExerciseLog],
    }));
  };

  const addSet = (exerciseIndex: number) => {
    const exercise = workout.exercises[exerciseIndex];
    const newSet: Set = {
      id: `temp-set-${Date.now()}`,
      setNumber: exercise.sets.length + 1,
      reps: exercise.targetReps,
      weightKg: exercise.targetWeight,
      durationSeconds: null,
      restSeconds: 60,
      rpe: null,
      isCompleted: false,
      isPersonalRecord: false,
    };

    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, index) =>
        index === exerciseIndex
          ? { ...ex, sets: [...ex.sets, newSet] }
          : ex
      ),
    }));
  };

  const updateSet = (exerciseIndex: number, setIndex: number, updates: Partial<Set>) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, exIndex) =>
        exIndex === exerciseIndex
          ? {
              ...ex,
              sets: ex.sets.map((set, setIndex_) =>
                setIndex_ === setIndex ? { ...set, ...updates } : set
              ),
            }
          : ex
      ),
    }));
  };

  const completeSet = async (exerciseIndex: number, setIndex: number) => {
    const exercise = workout.exercises[exerciseIndex];
    const set = exercise.sets[setIndex];

    updateSet(exerciseIndex, setIndex, { isCompleted: true });

    // Start rest timer if specified
    if (set.restSeconds && set.restSeconds > 0) {
      setRestTimeRemaining(set.restSeconds);
      setIsResting(true);
    }

    // Check for personal record (simplified logic)
    const isNewPR = set.reps && set.weightKg && (set.reps * set.weightKg) > 100; // Placeholder logic
    if (isNewPR) {
      updateSet(exerciseIndex, setIndex, { isPersonalRecord: true });
      toast({
        title: "New Personal Record! 🏆",
        description: `Amazing work on ${exercise.exercise.name}!`,
      });
    }

    toast({
      title: "Set Complete! 💪",
      description: `Great work! ${set.restSeconds ? `Rest for ${set.restSeconds}s` : 'Ready for next set'}`,
    });
  };

  const finishWorkout = async () => {
    if (!user || !workout.id) return;

    setIsLoading(true);
    try {
      const endTime = new Date();
      const durationMinutes = Math.round((endTime.getTime() - workout.startTime.getTime()) / 60000);
      
      // Calculate workout statistics
      const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.isCompleted).length, 0);
      const totalVolume = workout.exercises.reduce((sum, ex) => 
        sum + ex.sets.reduce((setSum, set) => 
          setSum + (set.isCompleted && set.reps && set.weightKg ? set.reps * set.weightKg : 0), 0
        ), 0
      );

      // Update workout session
      const { error: sessionError } = await supabase
        .from('workout_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration_minutes: durationMinutes,
          total_sets: totalSets,
          total_exercises: workout.exercises.length,
          total_volume_kg: totalVolume,
          notes: workout.notes,
        })
        .eq('id', workout.id);

      if (sessionError) throw sessionError;

      // Save exercise logs and sets
      for (const exercise of workout.exercises) {
        const { data: exerciseLog, error: exerciseError } = await supabase
          .from('exercise_logs')
          .insert({
            workout_session_id: workout.id,
            exercise_id: exercise.exerciseId,
            order_index: exercise.orderIndex,
            sets_completed: exercise.sets.filter(s => s.isCompleted).length,
            notes: exercise.notes,
          })
          .select()
          .single();

        if (exerciseError) throw exerciseError;

        // Save sets
        if (exercise.sets.length > 0) {
          const setsToInsert = exercise.sets
            .filter(set => set.isCompleted)
            .map(set => ({
              exercise_log_id: exerciseLog.id,
              set_number: set.setNumber,
              reps: set.reps,
              weight_kg: set.weightKg,
              duration_seconds: set.durationSeconds,
              rest_seconds: set.restSeconds,
              rpe: set.rpe,
              is_personal_record: set.isPersonalRecord,
            }));

          if (setsToInsert.length > 0) {
            const { error: setsError } = await supabase
              .from('set_logs')
              .insert(setsToInsert);

            if (setsError) throw setsError;
          }
        }
      }

      // Calculate and award SEP points
      await calculateAndAwardSEP(workout, durationMinutes);

      setWorkout(prev => ({ ...prev, isActive: false, endTime }));
      
      toast({
        title: "Workout Complete! 🎉",
        description: `Amazing session! You completed ${totalSets} sets and burned some serious calories.`,
      });

      if (onWorkoutComplete) {
        onWorkoutComplete({ ...workout, endTime, isActive: false });
      }

    } catch (error) {
      console.error('Error finishing workout:', error);
      toast({
        title: "Error",
        description: "Failed to save workout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAndAwardSEP = async (workoutData: WorkoutSession, durationMinutes: number) => {
    if (!user) return;

    try {
      // Calculate SEP based on Phoenix Project algorithm
      const basePoints = 10;
      const durationFactor = Math.min(durationMinutes / 30, 2); // Cap at 2x for 60+ min workouts
      const volumeFactor = Math.min(workoutData.exercises.length / 5, 2); // Cap at 2x for 5+ exercises
      
      const calculatedSEP = Math.round(basePoints * durationFactor * volumeFactor);

      // Award SEP points
      const { error } = await supabase
        .from('sep_ledger')
        .insert({
          user_id: user.id,
          points: calculatedSEP,
          base_points: basePoints,
          multipliers: {
            duration: durationFactor,
            volume: volumeFactor,
          },
          transaction_type: 'earn',
          activity_type: 'workout',
          activity_reference_id: workoutData.id,
          description: `Workout: ${workoutData.name}`,
        });

      if (error) throw error;

      toast({
        title: `+${calculatedSEP} SEP Points! 🔥`,
        description: "Points added to your Sweat Equity balance",
      });

    } catch (error) {
      console.error('Error calculating SEP:', error);
    }
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const currentExercise = workout.exercises[currentExerciseIndex];
  const completedSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.isCompleted).length, 0);
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

  if (!workout.isActive && workout.endTime) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-fitness-green-electric/10">
                <Award className="h-12 w-12 text-fitness-green-electric" />
              </div>
            </div>
            <CardTitle className="text-3xl">Workout Complete! 🎉</CardTitle>
            <CardDescription>
              Amazing work! Here's your session summary.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">
                  {formatTime(workout.endTime.getTime() - workout.startTime.getTime())}
                </div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{completedSets}</div>
                <div className="text-sm text-muted-foreground">Sets Completed</div>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = '/workouts'} 
              className="w-full"
            >
              View Workout History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Workout Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{workout.name}</CardTitle>
              <CardDescription>
                {workout.isActive ? 'Active Session' : 'Workout Planning'}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              {isResting && (
                <div className="flex items-center space-x-2 text-fitness-orange">
                  <Timer className="h-5 w-5" />
                  <span className="font-mono text-lg">
                    {Math.floor(restTimeRemaining / 60)}:{(restTimeRemaining % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
              <div className="text-right">
                <div className="text-2xl font-mono">{formatTime(workoutDuration)}</div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
            </div>
          </div>
          
          {totalSets > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{completedSets}/{totalSets} sets</span>
              </div>
              <Progress value={(completedSets / totalSets) * 100} className="h-2" />
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Exercise Selection */}
      {workout.exercises.length === 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Exercises</CardTitle>
            <CardDescription>Choose exercises for your workout</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableExercises.slice(0, 8).map((exercise) => (
                <Button
                  key={exercise.id}
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => addExercise(exercise)}
                >
                  <div className="text-left">
                    <div className="font-semibold">{exercise.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {exercise.primary_muscle_groups?.join(', ')}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Cards */}
      {workout.exercises.map((exercise, exerciseIndex) => (
        <Card key={exercise.id} className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{exercise.exercise.name}</CardTitle>
                <CardDescription>
                  {exercise.exercise.primary_muscle_groups?.join(', ')}
                </CardDescription>
              </div>
              <Badge variant={exercise.isCompleted ? "default" : "secondary"}>
                {exercise.sets.filter(s => s.isCompleted).length}/{exercise.sets.length} sets
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Sets */}
            <div className="space-y-3">
              {exercise.sets.map((set, setIndex) => (
                <div key={set.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-8 text-center font-semibold">
                    {set.setNumber}
                  </div>
                  
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Weight (kg)</Label>
                      <Input
                        type="number"
                        value={set.weightKg || ''}
                        onChange={(e) => updateSet(exerciseIndex, setIndex, { 
                          weightKg: parseFloat(e.target.value) || null 
                        })}
                        disabled={set.isCompleted}
                        className="h-8"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">Reps</Label>
                      <Input
                        type="number"
                        value={set.reps || ''}
                        onChange={(e) => updateSet(exerciseIndex, setIndex, { 
                          reps: parseInt(e.target.value) || null 
                        })}
                        disabled={set.isCompleted}
                        className="h-8"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">RPE (1-10)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={set.rpe || ''}
                        onChange={(e) => updateSet(exerciseIndex, setIndex, { 
                          rpe: parseInt(e.target.value) || null 
                        })}
                        disabled={set.isCompleted}
                        className="h-8"
                      />
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => completeSet(exerciseIndex, setIndex)}
                    disabled={set.isCompleted || !set.reps || !set.weightKg}
                    variant={set.isCompleted ? "secondary" : "default"}
                  >
                    {set.isCompleted ? 'Done' : 'Complete'}
                  </Button>
                  
                  {set.isPersonalRecord && (
                    <Badge variant="secondary" className="bg-fitness-orange/10 text-fitness-orange">
                      PR!
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addSet(exerciseIndex)}
                className="flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add Set</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Workout Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-3">
            {!workout.id ? (
              <Button onClick={startWorkout} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Start Workout
              </Button>
            ) : (
              <Button 
                onClick={finishWorkout} 
                disabled={isLoading || completedSets === 0}
                className="flex-1"
              >
                <Square className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Finish Workout'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}