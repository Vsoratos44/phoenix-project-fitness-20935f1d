import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Play, 
  Pause, 
  Square, 
  Timer, 
  Dumbbell, 
  Heart,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
  Save,
  SkipForward,
  Volume2,
  Brain,
  Flame,
  Target,
  Gauge
} from "lucide-react";

interface ExerciseLog {
  exercise_id: string;
  sets_data: SetLog[];
  notes?: string;
  form_score?: number;
  difficulty_rating?: number;
}

interface SetLog {
  set_number: number;
  weight_kg?: number;
  reps?: number;
  duration_seconds?: number;
  rpe?: number;
  rest_seconds?: number;
  completed: boolean;
  tempo?: string;
  is_failure?: boolean;
}

interface WorkoutSessionData {
  id?: string;
  name: string;
  blocks: any[];
  start_time?: string;
  user_id?: string;
  estimated_duration_minutes?: number;
  difficulty_rating?: number;
  coachNotes?: string;
}

export default function WorkoutSession() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [sessionData, setSessionData] = useState<WorkoutSessionData | null>(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [currentSetData, setCurrentSetData] = useState<Partial<SetLog>>({});
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [phoenixAdaptations, setPhoenixAdaptations] = useState<string[]>([]);
  const [sessionStats, setSessionStats] = useState({
    totalVolume: 0,
    setsCompleted: 0,
    caloriesBurned: 0
  });

  // Load workout session data
  useEffect(() => {
    loadWorkoutSession();
  }, []);

  const loadWorkoutSession = async () => {
    // In a real app, this would come from navigation state
    // For demo, load a Phoenix-generated workout
    const mockPhoenixWorkout: WorkoutSessionData = {
      name: "Phoenix Upper Body Strength",
      estimated_duration_minutes: 55,
      difficulty_rating: 7,
      coachNotes: "Today we're focusing on progressive overload for your upper body. Remember to maintain perfect form and control the eccentric phase. You're building strength with every rep!",
      blocks: [
        {
          name: "Dynamic Warm-up",
          order: 1,
          exercises: [
            { 
              id: "1", 
              name: "Arm Circles", 
              duration_seconds: 60, 
              sets: 1,
              muscle_group_primary: "shoulders",
              description: "Dynamic shoulder mobility"
            },
            { 
              id: "2", 
              name: "Band Pull-Aparts", 
              reps: 15, 
              sets: 2,
              rest_seconds: 30,
              muscle_group_primary: "rear delts",
              description: "Activate posterior chain"
            }
          ]
        },
        {
          name: "Strength & Power",
          order: 2,
          exercises: [
            { 
              id: "3", 
              name: "Barbell Bench Press", 
              sets: 4, 
              reps: 8, 
              weight_kg: 80, 
              rest_seconds: 90,
              superset_group: 1,
              rpe_target: 7,
              muscle_group_primary: "chest",
              description: "Primary compound movement for chest development"
            },
            { 
              id: "4", 
              name: "Bent-Over Barbell Row", 
              sets: 4, 
              reps: 8, 
              weight_kg: 70, 
              rest_seconds: 90,
              superset_group: 1,
              rpe_target: 7,
              muscle_group_primary: "back",
              description: "Pull to counterbalance the pressing movement"
            },
            { 
              id: "5", 
              name: "Overhead Press", 
              sets: 3, 
              reps: 10, 
              weight_kg: 50, 
              rest_seconds: 60,
              rpe_target: 6,
              muscle_group_primary: "shoulders",
              description: "Build shoulder strength and stability"
            }
          ]
        },
        {
          name: "Metabolic Finisher",
          order: 3,
          rounds: 3,
          rest_between_rounds_seconds: 90,
          exercises: [
            {
              id: "6",
              name: "Push-up to T",
              duration_seconds: 45,
              rest_seconds: 15,
              rpe_target: 8,
              muscle_group_primary: "chest",
              description: "Dynamic movement combining push and rotation"
            },
            {
              id: "7",
              name: "Mountain Climbers",
              duration_seconds: 30,
              rest_seconds: 30,
              rpe_target: 8,
              muscle_group_primary: "core",
              description: "High-intensity cardio burst"
            }
          ]
        }
      ]
    };
    setSessionData(mockPhoenixWorkout);
  };

  const startSession = async () => {
    if (!user || !sessionData) return;

    const startTime = new Date();
    setSessionStartTime(startTime);
    setIsSessionActive(true);

    try {
      // Create workout session in database
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          name: sessionData.name,
          start_time: startTime.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      
      setSessionData(prev => prev ? { ...prev, id: data.id, user_id: user.id } : null);
      
      toast({
        title: "🔥 Phoenix Session Started!",
        description: "Time to unlock your potential!"
      });
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: "Error",
        description: "Failed to start workout session",
        variant: "destructive"
      });
    }
  };

  const endSession = async () => {
    if (!sessionData?.id || !user) return;

    const endTime = new Date();
    const duration = sessionStartTime 
      ? Math.round((endTime.getTime() - sessionStartTime.getTime()) / 1000 / 60)
      : 0;

    try {
      // Calculate final stats
      const totalVolume = exerciseLogs.reduce((total, log) => {
        return total + log.sets_data.reduce((setTotal, set) => {
          return setTotal + ((set.weight_kg || 0) * (set.reps || 0));
        }, 0);
      }, 0);

      const totalSets = exerciseLogs.reduce((total, log) => 
        total + log.sets_data.filter(set => set.completed).length, 0
      );

      // Estimate calories burned (rough calculation)
      const estimatedCalories = Math.round(duration * 8 * (sessionData.difficulty_rating || 5) / 5);

      // Update workout session
      await supabase
        .from('workout_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration_minutes: duration,
          notes: sessionNotes,
          total_exercises: exerciseLogs.length,
          total_sets: totalSets,
          total_volume_kg: totalVolume,
          calories_burned: estimatedCalories
        })
        .eq('id', sessionData.id);

      // Save exercise logs
      for (const exerciseLog of exerciseLogs) {
        const { data: exerciseLogData } = await supabase
          .from('exercise_logs')
          .insert({
            workout_session_id: sessionData.id,
            exercise_id: exerciseLog.exercise_id,
            sets_completed: exerciseLog.sets_data.filter(set => set.completed).length,
            notes: exerciseLog.notes,
            form_score: exerciseLog.form_score,
            difficulty_rating: exerciseLog.difficulty_rating,
            order_index: exerciseLogs.indexOf(exerciseLog)
          })
          .select()
          .single();

        if (exerciseLogData) {
          // Save individual set logs
          for (const setLog of exerciseLog.sets_data) {
            if (setLog.completed) {
              await supabase
                .from('set_logs')
                .insert({
                  exercise_log_id: exerciseLogData.id,
                  set_number: setLog.set_number,
                  weight_kg: setLog.weight_kg,
                  reps: setLog.reps,
                  duration_seconds: setLog.duration_seconds,
                  rpe: setLog.rpe,
                  rest_seconds: setLog.rest_seconds,
                  tempo: setLog.tempo,
                  is_failure: setLog.is_failure
                });
            }
          }
        }
      }

      // Create an event for potential SEP reward calculation
      await supabase
        .from('events')
        .insert({
          user_id: user.id,
          event_type: 'workout_completed',
          event_data: {
            workout_session_id: sessionData.id,
            duration_minutes: duration,
            total_sets: totalSets,
            total_volume_kg: totalVolume,
            difficulty_rating: sessionData.difficulty_rating
          }
        });

      setIsSessionActive(false);
      
      toast({
        title: "🎉 Phoenix Session Complete!",
        description: `Outstanding work! ${duration} minutes of pure dedication. You earned it!`
      });

    } catch (error) {
      console.error('Error ending session:', error);
      toast({
        title: "Error",
        description: "Failed to save workout session",
        variant: "destructive"
      });
    }
  };

  const completeSet = () => {
    const currentBlock = sessionData?.blocks[currentBlockIndex];
    const currentExercise = currentBlock?.exercises[currentExerciseIndex];
    if (!currentExercise) return;

    const setLog: SetLog = {
      set_number: currentSetIndex + 1,
      weight_kg: currentSetData.weight_kg || currentExercise.weight_kg,
      reps: currentSetData.reps || currentExercise.reps,
      duration_seconds: currentSetData.duration_seconds || currentExercise.duration_seconds,
      rpe: currentSetData.rpe,
      rest_seconds: currentExercise.rest_seconds,
      completed: true,
      tempo: currentSetData.tempo,
      is_failure: currentSetData.is_failure || false
    };

    // Update exercise logs
    setExerciseLogs(prev => {
      const existingLogIndex = prev.findIndex(log => log.exercise_id === currentExercise.id);
      if (existingLogIndex >= 0) {
        const updated = [...prev];
        updated[existingLogIndex].sets_data.push(setLog);
        return updated;
      } else {
        return [...prev, {
          exercise_id: currentExercise.id,
          sets_data: [setLog]
        }];
      }
    });

    // Update session stats
    setSessionStats(prev => ({
      ...prev,
      totalVolume: prev.totalVolume + ((setLog.weight_kg || 0) * (setLog.reps || 0)),
      setsCompleted: prev.setsCompleted + 1
    }));

    // Start rest timer if there's a rest period
    if (currentExercise.rest_seconds && currentSetIndex < (currentExercise.sets - 1)) {
      setRestTimer(currentExercise.rest_seconds);
      setIsResting(true);
    }

    // Move to next set or exercise
    if (currentSetIndex < (currentExercise.sets - 1)) {
      setCurrentSetIndex(prev => prev + 1);
    } else {
      moveToNextExercise();
    }

    setCurrentSetData({});
  };

  const moveToNextExercise = () => {
    const currentBlock = sessionData?.blocks[currentBlockIndex];
    if (!currentBlock) return;

    if (currentExerciseIndex < currentBlock.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSetIndex(0);
    } else if (currentBlockIndex < (sessionData?.blocks.length || 0) - 1) {
      setCurrentBlockIndex(prev => prev + 1);
      setCurrentExerciseIndex(0);
      setCurrentSetIndex(0);
    }
  };

  const adaptExercise = async (reason: string) => {
    const currentExercise = sessionData?.blocks[currentBlockIndex]?.exercises[currentExerciseIndex];
    if (!currentExercise) return;

    try {
      // Call Phoenix adaptation engine
      const { data, error } = await supabase.functions.invoke('phoenix-workout-engine', {
        body: {
          action: 'adapt',
          currentWorkout: sessionData,
          feedback: {
            exerciseId: currentExercise.id,
            difficulty_feedback: reason === 'too_hard' ? 'too_hard' : 'too_easy',
            pain_signal: reason === 'pain' ? 'discomfort' : undefined
          }
        }
      });

      if (error) throw error;

      // Update session data with adapted workout
      setSessionData(data);
      setPhoenixAdaptations(prev => [...prev, `Adapted ${currentExercise.name}: ${reason}`]);
      
      toast({
        title: "🎯 Phoenix Adapted Your Workout!",
        description: "Your session has been optimized based on your feedback."
      });

    } catch (error) {
      console.error('Error adapting exercise:', error);
      toast({
        title: "Adaptation Error",
        description: "Unable to adapt exercise. Continuing with current plan.",
        variant: "destructive"
      });
    }
  };

  // Rest timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer]);

  if (!sessionData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Loading Phoenix Session...</h3>
            <p className="text-muted-foreground">Preparing your adaptive workout experience</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentBlock = sessionData.blocks[currentBlockIndex];
  const currentExercise = currentBlock?.exercises[currentExerciseIndex];
  const totalExercises = sessionData.blocks.reduce((sum, block) => sum + block.exercises.length, 0);
  const completedExercises = sessionData.blocks.slice(0, currentBlockIndex).reduce((sum, block) => sum + block.exercises.length, 0) + currentExerciseIndex;
  const progressPercentage = (completedExercises / totalExercises) * 100;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Session Header */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-600" />
            {sessionData.name}
            <Badge variant="secondary" className="ml-auto">
              Phoenix Engine
            </Badge>
          </CardTitle>
          <CardDescription className="text-orange-700">
            {isSessionActive ? "Session in progress" : "Ready to ignite your potential"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {!isSessionActive ? (
                <Button onClick={startSession} className="bg-orange-600 hover:bg-orange-700" size="lg">
                  <Play className="mr-2 h-4 w-4" />
                  Start Phoenix Session
                </Button>
              ) : (
                <Button onClick={endSession} variant="destructive" size="lg">
                  <Square className="mr-2 h-4 w-4" />
                  Complete Session
                </Button>
              )}
              
              {sessionStartTime && (
                <div className="flex items-center gap-2 text-sm text-orange-700">
                  <Timer className="h-4 w-4" />
                  Started: {sessionStartTime.toLocaleTimeString()}
                </div>
              )}
            </div>
            
            <div className="text-right">
              <div className="text-sm text-orange-600">Session Progress</div>
              <div className="font-bold text-orange-800">{Math.round(progressPercentage)}%</div>
            </div>
          </div>

          <Progress value={progressPercentage} className="mb-4" />
          
          {/* Session Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-2 bg-white rounded-lg border border-orange-200">
              <div className="font-bold text-orange-700">{sessionStats.setsCompleted}</div>
              <div className="text-xs text-orange-600">Sets Completed</div>
            </div>
            <div className="p-2 bg-white rounded-lg border border-orange-200">
              <div className="font-bold text-orange-700">{Math.round(sessionStats.totalVolume)}kg</div>
              <div className="text-xs text-orange-600">Total Volume</div>
            </div>
            <div className="p-2 bg-white rounded-lg border border-orange-200">
              <div className="font-bold text-orange-700">{sessionData.difficulty_rating}/10</div>
              <div className="text-xs text-orange-600">Difficulty</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coach Notes */}
      {sessionData.coachNotes && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-800 mb-1">Phoenix AI Coach</h4>
                <p className="text-blue-700 text-sm leading-relaxed">{sessionData.coachNotes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isSessionActive && (
        <>
          {/* Rest Timer */}
          {isResting && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Timer className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-yellow-800">Rest Period</h3>
                  <div className="text-4xl font-bold text-yellow-600 mb-4">
                    {Math.floor(restTimer / 60)}:{(restTimer % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      onClick={() => setIsResting(false)}
                      variant="outline"
                      className="border-yellow-300"
                    >
                      <SkipForward className="mr-2 h-4 w-4" />
                      Skip Rest
                    </Button>
                    <Button 
                      onClick={() => setRestTimer(restTimer + 30)}
                      variant="outline"
                      className="border-yellow-300"
                    >
                      +30s
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Exercise */}
          {currentExercise && (
            <Card className="border-2 border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      {currentExercise.name}
                    </CardTitle>
                    <CardDescription>
                      {currentBlock.name} • Set {currentSetIndex + 1} of {currentExercise.sets || 1}
                      {currentExercise.muscle_group_primary && (
                        <span className="ml-2 text-blue-600">• Target: {currentExercise.muscle_group_primary}</span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      Exercise {completedExercises + 1} of {totalExercises}
                    </Badge>
                    {currentExercise.superset_group && (
                      <Badge variant="outline">
                        Superset {currentExercise.superset_group}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Exercise Description */}
                {currentExercise.description && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-700 text-sm">{currentExercise.description}</p>
                  </div>
                )}

                {/* Target vs Current */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Target Performance</Label>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      {currentExercise.duration_seconds ? (
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-700">
                            {Math.floor(currentExercise.duration_seconds / 60)}:{(currentExercise.duration_seconds % 60).toString().padStart(2, '0')}
                          </div>
                          <div className="text-sm text-blue-600">Duration</div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {currentExercise.weight_kg && (
                            <div className="flex justify-between">
                              <span className="text-blue-600">Weight:</span>
                              <span className="font-semibold text-blue-800">{currentExercise.weight_kg}kg</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-blue-600">Reps:</span>
                            <span className="font-semibold text-blue-800">{currentExercise.reps}</span>
                          </div>
                          {currentExercise.rpe_target && (
                            <div className="flex justify-between">
                              <span className="text-blue-600">Target RPE:</span>
                              <span className="font-semibold text-blue-800">{currentExercise.rpe_target}/10</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Actual Performance</Label>
                    <div className="space-y-3">
                      {currentExercise.weight_kg && (
                        <div>
                          <Label htmlFor="weight" className="text-sm">Weight (kg)</Label>
                          <Input
                            id="weight"
                            type="number"
                            step="0.5"
                            value={currentSetData.weight_kg || currentExercise.weight_kg}
                            onChange={(e) => setCurrentSetData(prev => ({
                              ...prev,
                              weight_kg: parseFloat(e.target.value)
                            }))}
                            className="mt-1"
                          />
                        </div>
                      )}
                      
                      {(currentExercise.reps || currentExercise.duration_seconds) && (
                        <div>
                          <Label htmlFor="reps" className="text-sm">
                            {currentExercise.duration_seconds ? 'Duration (seconds)' : 'Reps'}
                          </Label>
                          <Input
                            id="reps"
                            type="number"
                            value={currentExercise.duration_seconds 
                              ? currentSetData.duration_seconds || currentExercise.duration_seconds
                              : currentSetData.reps || currentExercise.reps
                            }
                            onChange={(e) => setCurrentSetData(prev => ({
                              ...prev,
                              [currentExercise.duration_seconds ? 'duration_seconds' : 'reps']: parseInt(e.target.value)
                            }))}
                            className="mt-1"
                          />
                        </div>
                      )}

                      <div>
                        <Label htmlFor="rpe" className="text-sm">RPE (1-10)</Label>
                        <Input
                          id="rpe"
                          type="number"
                          min="1"
                          max="10"
                          value={currentSetData.rpe || ''}
                          onChange={(e) => setCurrentSetData(prev => ({
                            ...prev,
                            rpe: parseInt(e.target.value)
                          }))}
                          className="mt-1"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="failure"
                          checked={currentSetData.is_failure || false}
                          onChange={(e) => setCurrentSetData(prev => ({
                            ...prev,
                            is_failure: e.target.checked
                          }))}
                        />
                        <Label htmlFor="failure" className="text-sm">Taken to failure</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    onClick={completeSet} 
                    className="w-full bg-green-600 hover:bg-green-700" 
                    size="lg"
                    disabled={isResting}
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Complete Set {currentSetIndex + 1}
                  </Button>

                  {/* Phoenix Adaptation Controls */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      onClick={() => adaptExercise('too_hard')}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      Too Hard
                    </Button>
                    <Button 
                      onClick={() => adaptExercise('too_easy')}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      Too Easy
                    </Button>
                    <Button 
                      onClick={() => adaptExercise('pain')}
                      variant="outline"
                      size="sm"
                      className="text-xs text-red-600 border-red-200"
                    >
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Pain
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Phoenix Adaptations Log */}
      {phoenixAdaptations.length > 0 && (
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Brain className="h-5 w-5" />
              Phoenix Adaptations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {phoenixAdaptations.map((adaptation, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-purple-700">
                  <TrendingUp className="h-4 w-4" />
                  {adaptation}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Notes */}
      {isSessionActive && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session Notes</CardTitle>
            <CardDescription>
              Record any observations, achievements, or feedback about today's session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="How did this workout feel? Any breakthroughs or challenges to note..."
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>
      )}

      {/* Completed Sets Summary */}
      {exerciseLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Completed Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exerciseLogs.map((log, index) => {
                const exercise = sessionData.blocks
                  .flatMap(block => block.exercises)
                  .find(ex => ex.id === log.exercise_id);
                
                return (
                  <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">
                      {exercise?.name} - {log.sets_data.length} sets completed
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {log.sets_data.map((set, setIndex) => (
                        <Badge key={setIndex} variant="secondary" className="text-xs">
                          Set {set.set_number}: 
                          {set.weight_kg && ` ${set.weight_kg}kg ×`}
                          {set.reps && ` ${set.reps} reps`}
                          {set.duration_seconds && ` ${set.duration_seconds}s`}
                          {set.rpe && ` (RPE: ${set.rpe})`}
                          {set.is_failure && ` 💥`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}