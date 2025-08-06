import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import RealTimeAdaptation from "./RealTimeAdaptation";
import PhoenixSession from "./PhoenixSession";
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
  Gauge,
  Users,
  Camera,
  Share2,
  Trophy,
  Zap,
  Watch,
  Bluetooth,
  Wifi,
  Phone
} from "lucide-react";

interface ExerciseLog {
  exercise_id: string;
  sets_data: SetLog[];
  notes?: string;
  form_score?: number;
  difficulty_rating?: number;
  range_of_motion_score?: number;
  movement_quality_score?: number;
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
  heart_rate?: number;
  velocity?: number;
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
  is_public?: boolean;
  challenge_id?: string;
}

interface BiometricData {
  heart_rate?: number;
  hrv?: number;
  calories_burned?: number;
  active_minutes?: number;
  steps?: number;
}

export default function EnhancedWorkoutSession() {
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
  const [phoenixSessionActive, setPhoenixSessionActive] = useState(false);
  const [phoenixAdaptations, setPhoenixAdaptations] = useState<string[]>([]);
  
  // Enhanced tracking features
  const [realTimeBiometrics, setRealTimeBiometrics] = useState<BiometricData>({});
  const [isPublicSession, setIsPublicSession] = useState(false);
  const [liveViewers, setLiveViewers] = useState<string[]>([]);
  const [sessionPhotos, setSessionPhotos] = useState<string[]>([]);
  const [wearableConnected, setWearableConnected] = useState(false);
  const [socialFeedEnabled, setSocialFeedEnabled] = useState(true);
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null);
  
  const [sessionStats, setSessionStats] = useState({
    totalVolume: 0,
    setsCompleted: 0,
    caloriesBurned: 0,
    averageHeartRate: 0,
    peakHeartRate: 0,
    totalRestTime: 0,
    workoutIntensity: 0
  });

  // Real-time session updates
  useEffect(() => {
    if (isSessionActive && sessionData?.id) {
      setupRealtimeSession();
    }
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [isSessionActive, sessionData?.id]);

  const setupRealtimeSession = () => {
    const channel = supabase
      .channel(`workout_session_${sessionData?.id}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const viewers = Object.keys(presenceState).filter(key => key !== user?.id);
        setLiveViewers(viewers);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined workout viewing:', key);
        if (key !== user?.id) {
          toast({
            title: "👋 New Viewer",
            description: "Someone is watching your workout!"
          });
        }
      })
      .on('broadcast', { event: 'exercise_completed' }, (payload) => {
        // Handle real-time exercise completion updates
        console.log('Exercise completed by viewer:', payload);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user?.id,
            workout_name: sessionData?.name,
            current_exercise: getCurrentExercise()?.name,
            online_at: new Date().toISOString()
          });
        }
      });

    setRealtimeChannel(channel);
  };

  // Wearable device integration
  useEffect(() => {
    if (isSessionActive) {
      connectWearableDevices();
      startBiometricTracking();
    }
  }, [isSessionActive]);

  const connectWearableDevices = async () => {
    try {
      // Check for Web Bluetooth support
      if ('bluetooth' in navigator) {
        // This would connect to fitness devices like heart rate monitors
        // For demo purposes, we'll simulate the connection
        setTimeout(() => {
          setWearableConnected(true);
          toast({
            title: "⌚ Wearable Connected",
            description: "Heart rate monitoring active"
          });
          simulateHeartRateData();
        }, 2000);
      }
    } catch (error) {
      console.error('Wearable connection error:', error);
    }
  };

  const simulateHeartRateData = () => {
    const interval = setInterval(() => {
      if (!isSessionActive) {
        clearInterval(interval);
        return;
      }
      
      // Simulate realistic heart rate data based on exercise type
      const baseHR = 70;
      const exerciseMultiplier = isResting ? 1.2 : 1.8;
      const randomVariation = Math.random() * 20 - 10;
      const heartRate = Math.round(baseHR * exerciseMultiplier + randomVariation);
      
      setRealTimeBiometrics(prev => ({
        ...prev,
        heart_rate: heartRate,
        calories_burned: (prev.calories_burned || 0) + 0.2
      }));

      setSessionStats(prev => ({
        ...prev,
        averageHeartRate: ((prev.averageHeartRate * 0.9) + (heartRate * 0.1)),
        peakHeartRate: Math.max(prev.peakHeartRate, heartRate)
      }));
    }, 5000); // Update every 5 seconds
  };

  const startBiometricTracking = () => {
    // Start continuous biometric data collection
    setInterval(() => {
      if (isSessionActive && user) {
        saveBiometricSnapshot();
      }
    }, 30000); // Save every 30 seconds
  };

  const saveBiometricSnapshot = async () => {
    if (!user || !realTimeBiometrics.heart_rate) return;

    try {
      await supabase
        .from('biometric_logs')
        .insert({
          user_id: user.id,
          resting_heart_rate: realTimeBiometrics.heart_rate,
          energy_level: 8, // Could be derived from HRV
          recorded_at: new Date().toISOString(),
          source: 'workout_session'
        });
    } catch (error) {
      console.error('Error saving biometric data:', error);
    }
  };

  const loadWorkoutSession = async () => {
    // Enhanced Phoenix workout with real-time features
    const mockPhoenixWorkout: WorkoutSessionData = {
      name: "Phoenix Upper Body Power",
      estimated_duration_minutes: 55,
      difficulty_rating: 8,
      is_public: false,
      coachNotes: "Today's session focuses on explosive power development. Your biometrics show you're ready for high-intensity work. Let's make every rep count!",
      blocks: [
        {
          name: "Neural Activation",
          order: 1,
          exercises: [
            { 
              id: "1", 
              name: "Dynamic Shoulder Circles", 
              duration_seconds: 60, 
              sets: 1,
              muscle_group_primary: "shoulders",
              description: "Prime the nervous system"
            },
            { 
              id: "2", 
              name: "Explosive Push-Ups", 
              reps: 8, 
              sets: 2,
              rest_seconds: 60,
              muscle_group_primary: "chest",
              description: "CNS activation"
            }
          ]
        },
        {
          name: "Power Development",
          order: 2,
          exercises: [
            { 
              id: "3", 
              name: "Barbell Bench Press", 
              sets: 5, 
              reps: 3, 
              weight_kg: 85, 
              rest_seconds: 180,
              superset_group: 1,
              rpe_target: 8,
              muscle_group_primary: "chest",
              description: "Maximum power output"
            },
            { 
              id: "4", 
              name: "Weighted Pull-Ups", 
              sets: 4, 
              reps: 5, 
              weight_kg: 20, 
              rest_seconds: 120,
              rpe_target: 8,
              muscle_group_primary: "back",
              description: "Pull power development"
            }
          ]
        }
      ]
    };
    setSessionData(mockPhoenixWorkout);
  };

  useEffect(() => {
    loadWorkoutSession();
  }, []);

  const getCurrentExercise = () => {
    return sessionData?.blocks[currentBlockIndex]?.exercises[currentExerciseIndex];
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
          is_public: isPublicSession,
          challenge_id: sessionData.challenge_id
        })
        .select()
        .single();

      if (error) throw error;
      
      setSessionData(prev => prev ? { ...prev, id: data.id, user_id: user.id } : null);
      
      // Create activity feed entry if public
      if (isPublicSession && socialFeedEnabled) {
        await supabase
          .from('activity_feed')
          .insert({
            user_id: user.id,
            activity_type: 'workout_started',
            content: `Started: ${sessionData.name}`,
            reference_id: data.id,
            privacy_level: 'public',
            metadata: {
              workout_type: 'strength',
              estimated_duration: sessionData.estimated_duration_minutes
            }
          });
      }
      
      toast({
        title: "🔥 Phoenix Session Started!",
        description: "Biometric tracking active. Time to dominate!"
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

  const completeSet = async () => {
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
      is_failure: currentSetData.is_failure || false,
      heart_rate: realTimeBiometrics.heart_rate,
      velocity: currentSetData.velocity
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
          sets_data: [setLog],
          range_of_motion_score: 8, // Could be measured with sensors
          movement_quality_score: 7
        }];
      }
    });

    // Broadcast set completion for real-time viewers
    if (realtimeChannel && isPublicSession) {
      realtimeChannel.send({
        type: 'broadcast',
        event: 'set_completed',
        payload: {
          exercise: currentExercise.name,
          set: currentSetIndex + 1,
          reps: setLog.reps,
          weight: setLog.weight_kg
        }
      });
    }

    // Update session stats
    setSessionStats(prev => ({
      ...prev,
      totalVolume: prev.totalVolume + ((setLog.weight_kg || 0) * (setLog.reps || 0)),
      setsCompleted: prev.setsCompleted + 1,
      workoutIntensity: ((prev.workoutIntensity * prev.setsCompleted) + (setLog.rpe || 7)) / (prev.setsCompleted + 1)
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

  const endSession = async () => {
    if (!sessionData?.id || !user) return;

    const endTime = new Date();
    const duration = sessionStartTime 
      ? Math.round((endTime.getTime() - sessionStartTime.getTime()) / 1000 / 60)
      : 0;

    try {
      // Calculate comprehensive final stats
      const totalVolume = exerciseLogs.reduce((total, log) => {
        return total + log.sets_data.reduce((setTotal, set) => {
          return setTotal + ((set.weight_kg || 0) * (set.reps || 0));
        }, 0);
      }, 0);

      const totalSets = exerciseLogs.reduce((total, log) => 
        total + log.sets_data.filter(set => set.completed).length, 0
      );

      const avgFormScore = exerciseLogs.reduce((total, log) => 
        total + (log.form_score || 7), 0) / Math.max(exerciseLogs.length, 1);

      // Enhanced calorie calculation based on heart rate data
      const enhancedCalories = sessionStats.averageHeartRate > 0 
        ? Math.round(duration * ((sessionStats.averageHeartRate - 70) / 10) * 2)
        : Math.round(duration * 8);

      // Update workout session with comprehensive data
      await supabase
        .from('workout_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration_minutes: duration,
          notes: sessionNotes,
          total_exercises: exerciseLogs.length,
          total_sets: totalSets,
          total_volume_kg: totalVolume,
          calories_burned: enhancedCalories,
          average_heart_rate: Math.round(sessionStats.averageHeartRate),
          peak_heart_rate: sessionStats.peakHeartRate,
          average_form_score: Math.round(avgFormScore * 10) / 10,
          workout_intensity_score: Math.round(sessionStats.workoutIntensity * 10) / 10
        })
        .eq('id', sessionData.id);

      // Save enhanced performance logs
      for (const exerciseLog of exerciseLogs) {
        await supabase
          .from('enhanced_performance_logs')
          .insert({
            user_id: user.id,
            exercise_id: exerciseLog.exercise_id,
            workout_session_id: sessionData.id,
            sets_completed: exerciseLog.sets_data.filter(set => set.completed).length,
            reps_completed: exerciseLog.sets_data.map(set => set.reps || 0),
            load_used_kg: exerciseLog.sets_data[0]?.weight_kg || 0,
            rpe_scores: exerciseLog.sets_data.map(set => set.rpe || 7),
            average_rpe: exerciseLog.sets_data.reduce((sum, set) => sum + (set.rpe || 7), 0) / exerciseLog.sets_data.length,
            form_score: exerciseLog.form_score || 7,
            range_of_motion_score: exerciseLog.range_of_motion_score || 8,
            movement_quality_score: exerciseLog.movement_quality_score || 7,
            progressive_overload_applied: true // Could be calculated based on previous sessions
          });
      }

      // Create comprehensive activity feed entry
      if (socialFeedEnabled) {
        await supabase
          .from('activity_feed')
          .insert({
            user_id: user.id,
            activity_type: 'workout_completed',
            content: `Completed: ${sessionData.name}`,
            reference_id: sessionData.id,
            privacy_level: isPublicSession ? 'public' : 'private',
            metadata: {
              duration_minutes: duration,
              total_volume_kg: totalVolume,
              calories_burned: enhancedCalories,
              peak_heart_rate: sessionStats.peakHeartRate,
              total_sets: totalSets,
              avg_form_score: avgFormScore
            }
          });
      }

      // Create event for SEP rewards and achievements
      await supabase
        .from('events')
        .insert({
          user_id: user.id,
          event_type: 'enhanced_workout_completed',
          event_data: {
            workout_session_id: sessionData.id,
            duration_minutes: duration,
            total_sets: totalSets,
            total_volume_kg: totalVolume,
            difficulty_rating: sessionData.difficulty_rating,
            biometric_data: {
              avg_heart_rate: sessionStats.averageHeartRate,
              peak_heart_rate: sessionStats.peakHeartRate,
              calories_burned: enhancedCalories
            },
            performance_metrics: {
              avg_form_score: avgFormScore,
              workout_intensity: sessionStats.workoutIntensity,
              adaptations_made: phoenixAdaptations.length
            }
          }
        });

      setIsSessionActive(false);
      
      toast({
        title: "🎉 Phoenix Session Complete!",
        description: `Epic performance! ${duration} minutes of excellence achieved.`
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

  const takeWorkoutPhoto = async () => {
    try {
      // In a real app, this would access the camera
      // For demo, we'll simulate adding a photo
      const photoUrl = `https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop&crop=center`;
      setSessionPhotos(prev => [...prev, photoUrl]);
      
      toast({
        title: "📸 Photo Captured",
        description: "Added to your workout gallery"
      });
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const shareSessionProgress = async () => {
    if (!sessionData) return;

    const shareData = {
      title: `${sessionData.name} - Phoenix Workout`,
      text: `Just crushed a ${sessionData.estimated_duration_minutes}-minute workout! 💪`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        toast({
          title: "📋 Copied to Clipboard",
          description: "Share your progress with friends!"
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
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

  
  // Show Phoenix Session if activated
  if (phoenixSessionActive) {
    return <PhoenixSession onExit={() => setPhoenixSessionActive(false)} />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Enhanced Session Header */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-600" />
            {sessionData.name}
            <div className="ml-auto flex items-center gap-2">
              {wearableConnected && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Watch className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              )}
              {isPublicSession && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Users className="h-3 w-3 mr-1" />
                  Live ({liveViewers.length})
                </Badge>
              )}
              <Badge variant="secondary">Phoenix Engine</Badge>
            </div>
          </CardTitle>
          <CardDescription className="text-orange-700">
            {isSessionActive ? "Session in progress" : "Ready for enhanced tracking"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="workout" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="workout">Workout</TabsTrigger>
              <TabsTrigger value="biometrics">Live Data</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="workout" className="space-y-4">
              {/* Rest of the workout interface continues here... */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {sessionData.estimated_duration_minutes} min
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Intensity: {sessionData.difficulty_rating}/10
                    </span>
                  </div>
                </div>
                
                {!isSessionActive ? (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setPhoenixSessionActive(true)} 
                      size="lg" 
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Flame className="mr-2 h-4 w-4" />
                      Start Phoenix Session
                    </Button>
                    <Button onClick={startSession} variant="outline" size="lg">
                      <Play className="mr-2 h-4 w-4" />
                      Start Session
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={takeWorkoutPhoto} variant="outline" size="sm">
                      <Camera className="h-4 w-4" />
                    </Button>
                    <Button onClick={shareSessionProgress} variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button onClick={endSession} variant="destructive" size="lg">
                      <Square className="mr-2 h-4 w-4" />
                      End Session
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Progress value={progressPercentage} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    Exercise {completedExercises + 1} of {totalExercises}
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{sessionStats.setsCompleted}</p>
                    <p className="text-xs text-muted-foreground">Sets</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{Math.round(sessionStats.totalVolume)}</p>
                    <p className="text-xs text-muted-foreground">Volume (kg)</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{Math.round(sessionStats.caloriesBurned)}</p>
                    <p className="text-xs text-muted-foreground">Calories</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="biometrics" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{realTimeBiometrics.heart_rate || '--'}</p>
                    <p className="text-xs text-muted-foreground">BPM</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{Math.round(realTimeBiometrics.calories_burned || 0)}</p>
                    <p className="text-xs text-muted-foreground">Calories</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{Math.round(sessionStats.averageHeartRate)}</p>
                    <p className="text-xs text-muted-foreground">Avg HR</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{sessionStats.peakHeartRate}</p>
                    <p className="text-xs text-muted-foreground">Peak HR</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="social" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Social Features</h3>
                  <p className="text-sm text-muted-foreground">Share your progress and connect with others</p>
                </div>
                <Switch
                  checked={socialFeedEnabled}
                  onCheckedChange={setSocialFeedEnabled}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{liveViewers.length}</p>
                    <p className="text-xs text-muted-foreground">Live Viewers</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Camera className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{sessionPhotos.length}</p>
                    <p className="text-xs text-muted-foreground">Photos</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Public Session</h4>
                    <p className="text-sm text-muted-foreground">Allow others to follow your workout</p>
                  </div>
                  <Switch
                    checked={isPublicSession}
                    onCheckedChange={setIsPublicSession}
                    disabled={isSessionActive}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Wearable Integration</h4>
                    <p className="text-sm text-muted-foreground">
                      {wearableConnected ? 'Device connected' : 'Connect fitness device'}
                    </p>
                  </div>
                  <Badge variant={wearableConnected ? "default" : "outline"}>
                    {wearableConnected ? <Bluetooth className="h-3 w-3 mr-1" /> : <Phone className="h-3 w-3 mr-1" />}
                    {wearableConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Current Exercise Display */}
      {currentExercise && isSessionActive && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                {currentExercise.name}
                <Badge variant="outline" className="ml-auto">
                  Set {currentSetIndex + 1}/{currentExercise.sets}
                </Badge>
              </CardTitle>
              <CardDescription>
                {currentBlock.name} • {currentExercise.muscle_group_primary}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Set logging interface */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={currentSetData.weight_kg || currentExercise.weight_kg || ''}
                    onChange={(e) => setCurrentSetData(prev => ({ ...prev, weight_kg: parseFloat(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="reps">Reps</Label>
                  <Input
                    id="reps"
                    type="number"
                    value={currentSetData.reps || currentExercise.reps || ''}
                    onChange={(e) => setCurrentSetData(prev => ({ ...prev, reps: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rpe">RPE (1-10)</Label>
                  <Input
                    id="rpe"
                    type="number"
                    min="1"
                    max="10"
                    value={currentSetData.rpe || ''}
                    onChange={(e) => setCurrentSetData(prev => ({ ...prev, rpe: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={completeSet} className="w-full">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Complete Set
                  </Button>
                </div>
              </div>

              {isResting && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="text-center py-4">
                    <Timer className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-800">{restTimer}s</p>
                    <p className="text-blue-700">Rest time remaining</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Real-time adaptation component */}
          <RealTimeAdaptation
            currentExercise={currentExercise}
            sessionData={sessionData}
            onExerciseAdapted={(adaptedExercise) => {
              // Handle exercise adaptation
              setPhoenixAdaptations(prev => [...prev, `Adapted: ${adaptedExercise.exerciseId}`]);
            }}
            onFeedbackSubmitted={(feedback) => {
              console.log('Feedback submitted:', feedback);
            }}
          />
        </div>
      )}
    </div>
  );
}
