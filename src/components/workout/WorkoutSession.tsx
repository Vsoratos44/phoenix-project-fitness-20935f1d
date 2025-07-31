/**
 * Phoenix Protocol Workout Session
 * 
 * Live workout tracking with real-time analytics and performance monitoring
 * Features:
 * - Real-time set logging
 * - RPE tracking
 * - Rest timer management
 * - Heart rate monitoring
 * - Personal record detection
 * - SEP points calculation
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Pause,
  Square,
  Timer,
  Heart,
  Zap,
  TrendingUp,
  Trophy,
  Target,
  Activity,
  Dumbbell
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LiveSet {
  id: string;
  reps: number;
  weight: number;
  rpe?: number; // Rate of Perceived Exertion 1-10
  completed: boolean;
  startTime?: Date;
  endTime?: Date;
  isPersonalRecord?: boolean;
}

interface LiveExercise {
  id: string;
  name: string;
  targetSets: number;
  targetReps: number;
  targetWeight: number;
  restSeconds: number;
  sets: LiveSet[];
  currentSet: number;
  completed: boolean;
  personalBest?: {
    weight: number;
    reps: number;
    date: string;
  };
}

interface WorkoutSessionData {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  exercises: LiveExercise[];
  totalVolume: number;
  sepPointsEarned: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  isFromConnectedDevice: boolean;
}

const WorkoutSession = () => {
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [currentHeartRate, setCurrentHeartRate] = useState(0);
  const [isConnectedDevice, setIsConnectedDevice] = useState(false);

  const [workoutSession, setWorkoutSession] = useState<WorkoutSessionData>({
    id: `session-${Date.now()}`,
    name: "Upper Body Strength Circuit",
    startTime: new Date(),
    exercises: [
      {
        id: "ex-1",
        name: "Barbell Bench Press",
        targetSets: 4,
        targetReps: 8,
        targetWeight: 185,
        restSeconds: 120,
        sets: [],
        currentSet: 0,
        completed: false,
        personalBest: { weight: 185, reps: 6, date: "2024-01-15" }
      },
      {
        id: "ex-2",
        name: "Incline Dumbbell Press",
        targetSets: 3,
        targetReps: 10,
        targetWeight: 65,
        restSeconds: 90,
        sets: [],
        currentSet: 0,
        completed: false,
        personalBest: { weight: 60, reps: 10, date: "2024-01-10" }
      },
      {
        id: "ex-3",
        name: "Barbell Rows",
        targetSets: 4,
        targetReps: 8,
        targetWeight: 155,
        restSeconds: 120,
        sets: [],
        currentSet: 0,
        completed: false
      }
    ],
    totalVolume: 0,
    sepPointsEarned: 0,
    isFromConnectedDevice: false
  });

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setSessionTime(time => time + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  // Rest timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(time => {
          if (time <= 1) {
            setIsResting(false);
            toast({
              title: "Rest Complete!",
              description: "Time for your next set",
            });
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer, toast]);

  // Simulate heart rate monitoring
  useEffect(() => {
    if (isActive && !isPaused) {
      const interval = setInterval(() => {
        // Simulate heart rate data from connected device
        const baseHR = 70;
        const workoutIntensity = isResting ? 0.3 : 0.8;
        const variation = Math.random() * 10 - 5;
        const hr = Math.round(baseHR + (workoutIntensity * 50) + variation);
        setCurrentHeartRate(hr);
        setIsConnectedDevice(Math.random() > 0.1); // 90% chance of device connection
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isActive, isPaused, isResting]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startWorkout = () => {
    setIsActive(true);
    setWorkoutSession(prev => ({
      ...prev,
      startTime: new Date(),
      isFromConnectedDevice: isConnectedDevice
    }));
    
    toast({
      title: "Workout Started!",
      description: isConnectedDevice ? "Connected device detected - SEP rewards enabled" : "Manual tracking mode",
    });
  };

  const pauseWorkout = () => {
    setIsPaused(!isPaused);
  };

  const finishWorkout = () => {
    setIsActive(false);
    setIsPaused(false);
    setIsResting(false);
    
    const endTime = new Date();
    const duration = sessionTime;
    const totalVolume = calculateTotalVolume();
    const sepPoints = calculateSEPPoints(totalVolume, duration, isConnectedDevice);
    
    setWorkoutSession(prev => ({
      ...prev,
      endTime,
      totalVolume,
      sepPointsEarned: sepPoints
    }));

    toast({
      title: "Workout Complete!",
      description: `${formatTime(duration)} • ${totalVolume.toLocaleString()}lbs volume • ${sepPoints} SEP points earned`,
    });
  };

  const logSet = (exerciseId: string, reps: number, weight: number, rpe?: number) => {
    setWorkoutSession(prev => {
      const updatedExercises = prev.exercises.map(exercise => {
        if (exercise.id === exerciseId) {
          const isPersonalRecord = checkPersonalRecord(exercise, weight, reps);
          
          const newSet: LiveSet = {
            id: `set-${Date.now()}`,
            reps,
            weight,
            rpe,
            completed: true,
            startTime: new Date(),
            endTime: new Date(),
            isPersonalRecord
          };

          const updatedSets = [...exercise.sets, newSet];
          const isCompleted = updatedSets.length >= exercise.targetSets;

          if (isPersonalRecord) {
            toast({
              title: "🏆 Personal Record!",
              description: `New PR on ${exercise.name}: ${weight}lbs x ${reps} reps`,
            });
          }

          return {
            ...exercise,
            sets: updatedSets,
            currentSet: updatedSets.length,
            completed: isCompleted
          };
        }
        return exercise;
      });

      return { ...prev, exercises: updatedExercises };
    });

    // Start rest timer
    const exercise = workoutSession.exercises.find(ex => ex.id === exerciseId);
    if (exercise && exercise.sets.length < exercise.targetSets - 1) {
      setRestTimer(exercise.restSeconds);
      setIsResting(true);
    }
  };

  const checkPersonalRecord = (exercise: LiveExercise, weight: number, reps: number): boolean => {
    if (!exercise.personalBest) return true;
    
    // Simple PR logic: higher weight or same weight with more reps
    return weight > exercise.personalBest.weight || 
           (weight === exercise.personalBest.weight && reps > exercise.personalBest.reps);
  };

  const calculateTotalVolume = (): number => {
    return workoutSession.exercises.reduce((total, exercise) => {
      const exerciseVolume = exercise.sets.reduce((setTotal, set) => {
        return setTotal + (set.reps * set.weight);
      }, 0);
      return total + exerciseVolume;
    }, 0);
  };

  const calculateSEPPoints = (volume: number, duration: number, fromDevice: boolean): number => {
    if (!fromDevice) return 0; // No points for manual tracking
    
    const basePoints = Math.floor(volume / 100) * 5; // 5 points per 100lbs
    const timeBonus = duration > 1800 ? 25 : 10; // Bonus for longer workouts
    const deviceBonus = 50; // Bonus for connected device
    
    return basePoints + timeBonus + deviceBonus;
  };

  const getWorkoutProgress = (): number => {
    const totalSets = workoutSession.exercises.reduce((sum, ex) => sum + ex.targetSets, 0);
    const completedSets = workoutSession.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    return (completedSets / totalSets) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Workout Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-fitness-orange/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{workoutSession.name}</CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Timer className="h-4 w-4" />
                  {formatTime(sessionTime)}
                </div>
                {isConnectedDevice && (
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    {currentHeartRate} bpm
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  {getWorkoutProgress().toFixed(0)}% complete
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isConnectedDevice && (
                <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                  <Zap className="h-3 w-3 mr-1" />
                  Device Connected
                </Badge>
              )}
              
              {!isActive ? (
                <Button onClick={startWorkout} size="lg">
                  <Play className="h-4 w-4 mr-2" />
                  Start Workout
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={pauseWorkout}>
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                  <Button variant="destructive" onClick={finishWorkout}>
                    <Square className="h-4 w-4 mr-2" />
                    Finish
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {isActive && (
            <Progress value={getWorkoutProgress()} className="mt-4" />
          )}
        </CardHeader>
      </Card>

      {/* Rest Timer */}
      {isResting && (
        <Card className="border-fitness-orange/20 bg-fitness-orange/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-center gap-4">
              <Timer className="h-6 w-6 text-fitness-orange" />
              <div className="text-center">
                <div className="text-2xl font-bold text-fitness-orange">
                  {formatTime(restTimer)}
                </div>
                <div className="text-sm text-muted-foreground">Rest time remaining</div>
              </div>
              <Button variant="outline" onClick={() => setIsResting(false)}>
                Skip Rest
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercises */}
      <div className="space-y-4">
        {workoutSession.exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            exerciseNumber={index + 1}
            isActive={isActive}
            onLogSet={logSet}
          />
        ))}
      </div>

      {/* Session Summary */}
      {workoutSession.endTime && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-600" />
              Workout Complete!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{formatTime(sessionTime)}</div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{workoutSession.totalVolume.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Volume (lbs)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-fitness-orange">{workoutSession.sepPointsEarned}</div>
                <div className="text-sm text-muted-foreground">SEP Points</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{currentHeartRate}</div>
                <div className="text-sm text-muted-foreground">Avg Heart Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Exercise Card Component
interface ExerciseCardProps {
  exercise: LiveExercise;
  exerciseNumber: number;
  isActive: boolean;
  onLogSet: (exerciseId: string, reps: number, weight: number, rpe?: number) => void;
}

const ExerciseCard = ({ exercise, exerciseNumber, isActive, onLogSet }: ExerciseCardProps) => {
  const [currentReps, setCurrentReps] = useState(exercise.targetReps);
  const [currentWeight, setCurrentWeight] = useState(exercise.targetWeight);
  const [currentRPE, setCurrentRPE] = useState<number>(7);

  const handleLogSet = () => {
    onLogSet(exercise.id, currentReps, currentWeight, currentRPE);
  };

  return (
    <Card className={`${exercise.completed ? 'bg-green-50 border-green-200' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                {exerciseNumber}
              </Badge>
              {exercise.name}
              {exercise.completed && <Trophy className="h-4 w-4 text-green-600" />}
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              Target: {exercise.targetSets} × {exercise.targetReps} @ {exercise.targetWeight}lbs
            </div>
          </div>
          
          {exercise.personalBest && (
            <div className="text-right">
              <div className="text-sm font-medium">Personal Best</div>
              <div className="text-xs text-muted-foreground">
                {exercise.personalBest.weight}lbs × {exercise.personalBest.reps}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Completed Sets */}
        {exercise.sets.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Completed Sets</Label>
            <div className="space-y-1">
              {exercise.sets.map((set, index) => (
                <div key={set.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">Set {index + 1}</span>
                  <div className="flex items-center gap-2 text-sm">
                    <span>{set.weight}lbs × {set.reps}</span>
                    {set.rpe && <Badge variant="outline">RPE {set.rpe}</Badge>}
                    {set.isPersonalRecord && <Trophy className="h-4 w-4 text-yellow-500" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Set Input */}
        {!exercise.completed && isActive && (
          <div className="space-y-3">
            <Separator />
            <Label className="text-sm font-medium">
              Set {exercise.sets.length + 1} of {exercise.targetSets}
            </Label>
            
            <div className="grid grid-cols-4 gap-2">
              <div>
                <Label className="text-xs">Weight (lbs)</Label>
                <Input
                  type="number"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(parseInt(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">Reps</Label>
                <Input
                  type="number"
                  value={currentReps}
                  onChange={(e) => setCurrentReps(parseInt(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">RPE (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={currentRPE}
                  onChange={(e) => setCurrentRPE(parseInt(e.target.value) || 7)}
                  className="h-8"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleLogSet} size="sm" className="w-full h-8">
                  Log Set
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{exercise.sets.length}/{exercise.targetSets} sets</span>
          </div>
          <Progress value={(exercise.sets.length / exercise.targetSets) * 100} />
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutSession;