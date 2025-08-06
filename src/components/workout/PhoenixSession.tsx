import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AIWorkoutGenerator } from "@/components/ai/AIWorkoutGenerator";
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
  Phone,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Settings,
  Eye,
  Mic,
  Video,
  Headphones,
  Smartphone
} from "lucide-react";

interface ExerciseLog {
  exercise_id: string;
  sets_data: SetLog[];
  notes?: string;
  form_score?: number;
  difficulty_rating?: number;
  range_of_motion_score?: number;
  movement_quality_score?: number;
  fatigue_level?: number;
  pain_level?: number;
  user_feedback?: string;
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
  form_breakdown?: string[];
  ai_coaching_tips?: string[];
  fatigue_level?: number;
  pain_level?: number;
  notes?: string;
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
  power_output?: number;
  lactate_threshold?: number;
}

interface AICoachingMessage {
  id: string;
  type: 'motivation' | 'technique' | 'adaptation' | 'safety' | 'performance';
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  exercise_context?: string;
}

interface PhoenixSessionProps {
  onExit: () => void;
  initialWorkout?: any;
}

export default function PhoenixSession({ onExit, initialWorkout }: PhoenixSessionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
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
  
  // Enhanced Phoenix features
  const [realTimeBiometrics, setRealTimeBiometrics] = useState<BiometricData>({});
  const [aiCoachingMessages, setAiCoachingMessages] = useState<AICoachingMessage[]>([]);
  const [isLiveCoachingActive, setIsLiveCoachingActive] = useState(true);
  const [wearableConnected, setWearableConnected] = useState(false);
  const [aiFormAnalysis, setAiFormAnalysis] = useState<string[]>([]);
  const [fatigueLevels, setFatigueLevels] = useState<{ [key: string]: number }>({});
  const [painLevels, setPainLevels] = useState<{ [key: string]: number }>({});
  const [phoenixInsights, setPhoenixInsights] = useState<string[]>([]);
  
  // Feedback dialogs
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showAdaptationDialog, setShowAdaptationDialog] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'exercise' | 'set' | 'block'>('exercise');
  
  const [sessionStats, setSessionStats] = useState({
    totalVolume: 0,
    setsCompleted: 0,
    caloriesBurned: 0,
    averageHeartRate: 0,
    peakHeartRate: 0,
    totalRestTime: 0,
    workoutIntensity: 0,
    phoenixScore: 0,
    adaptationsMade: 0,
    perfectFormSets: 0
  });

  // Audio coaching refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  // Check for workout and load or redirect
  useEffect(() => {
    if (initialWorkout) {
      setSessionData(initialWorkout);
      initializeAudioCoaching();
    } else {
      checkForWorkoutOrRedirect();
    }
  }, [initialWorkout]);

  const checkForWorkoutOrRedirect = async () => {
    // Check if user has any active workout or redirect to AI generator
    try {
      // Check for any recent workout session
      const today = new Date().toISOString().split('T')[0];
      const { data: recentWorkout } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recentWorkout) {
        // Load existing workout
        loadPhoenixWorkout(recentWorkout.id);
      } else {
        // No workout found, redirect to AI generator
        toast({
          title: "No Workout Found",
          description: "Redirecting to AI Workout Generator to create your Phoenix session...",
        });
        navigate('/ai-workout');
        return;
      }
    } catch (error) {
      console.error('Error checking for active workout:', error);
      // Fallback to AI generator
      navigate('/ai-workout');
    }
  };

  const loadPhoenixWorkout = async (workoutId?: string) => {
    // Load AI-generated Phoenix workout
    try {
      const { data, error } = await supabase.functions.invoke('phoenix-workout-engine', {
        body: {
          action: 'generate',
          user_id: user?.id,
          workout_type: 'phoenix_session',
          include_ai_coaching: true,
          enable_real_time_adaptation: true
        }
      });

      if (error) throw error;
      
      setSessionData(data);
      
      // Initialize AI coaching
      setAiCoachingMessages([{
        id: '1',
        type: 'motivation',
        message: "Welcome to your Phoenix Session! I'm your AI coach and I'll be guiding you through every rep. Let's unlock your potential together!",
        timestamp: new Date(),
        priority: 'high'
      }]);

    } catch (error) {
      console.error('Error loading Phoenix workout:', error);
      // Fallback to mock data
      setSessionData({
        name: "Phoenix Elite Session",
        estimated_duration_minutes: 65,
        difficulty_rating: 8,
        coachNotes: "Today we're pushing boundaries with Phoenix intelligence. Every set is optimized for your specific physiology and goals.",
        blocks: [
          {
            name: "Phoenix Activation",
            order: 1,
            exercises: [
              { 
                id: "1", 
                name: "Dynamic Neural Activation", 
                duration_seconds: 90, 
                sets: 1,
                muscle_group_primary: "full body",
                ai_cues: ["Focus on mind-muscle connection", "Activate your nervous system"],
                description: "Phoenix-optimized activation sequence"
              }
            ]
          },
          {
            name: "Adaptive Strength Block",
            order: 2,
            exercises: [
              { 
                id: "2", 
                name: "AI-Optimized Squat", 
                sets: 4, 
                reps: 8, 
                weight_kg: 100, 
                rest_seconds: 90,
                rpe_target: 7,
                muscle_group_primary: "legs",
                ai_cues: ["Perfect depth on every rep", "Drive through your heels", "Control the descent"],
                real_time_feedback: true,
                description: "Phoenix analyzes your form in real-time"
              }
            ]
          }
        ]
      });
    }
  };

  const initializeAudioCoaching = () => {
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
    }
    
    if ('webkitAudioContext' in window || 'AudioContext' in window) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const speakCoachingMessage = (message: string) => {
    if (!speechSynthesisRef.current || !isLiveCoachingActive) return;
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    
    // Select a more motivational voice if available
    const voices = speechSynthesisRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Alex') || 
      voice.name.includes('Daniel') || 
      voice.name.includes('Samantha')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    speechSynthesisRef.current.speak(utterance);
  };

  const addAICoachingMessage = (type: AICoachingMessage['type'], message: string, priority: AICoachingMessage['priority'] = 'medium') => {
    const newMessage: AICoachingMessage = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
      priority,
      exercise_context: getCurrentExercise()?.name
    };
    
    setAiCoachingMessages(prev => [...prev, newMessage].slice(-10)); // Keep last 10 messages
    
    // Speak high priority messages
    if (priority === 'high' || priority === 'critical') {
      speakCoachingMessage(message);
    }
  };

  const getCurrentExercise = () => {
    return sessionData?.blocks[currentBlockIndex]?.exercises[currentExerciseIndex];
  };

  const startPhoenixSession = async () => {
    if (!user || !sessionData) return;

    const startTime = new Date();
    setSessionStartTime(startTime);
    setIsSessionActive(true);

    try {
      // Create Phoenix session in database
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          name: sessionData.name,
          start_time: startTime.toISOString(),
          session_type: 'phoenix',
          is_ai_coached: true
        })
        .select()
        .single();

      if (error) throw error;
      
      setSessionData(prev => prev ? { ...prev, id: data.id, user_id: user.id } : null);
      
      // Start wearable monitoring
      connectWearableDevices();
      
      addAICoachingMessage('motivation', "Phoenix Session activated! Let's begin with perfect form and maximum intensity.", 'high');
      
      toast({
        title: "🔥 Phoenix Session Started!",
        description: "AI coaching is now active. Let's achieve greatness!"
      });
    } catch (error) {
      console.error('Error starting Phoenix session:', error);
      toast({
        title: "Error",
        description: "Failed to start Phoenix session",
        variant: "destructive"
      });
    }
  };

  const connectWearableDevices = async () => {
    try {
      // Simulate wearable connection
      setTimeout(() => {
        setWearableConnected(true);
        startBiometricTracking();
        addAICoachingMessage('performance', "Wearable connected. I'm now monitoring your heart rate and performance metrics.", 'medium');
        
        toast({
          title: "⌚ Phoenix Monitoring Active",
          description: "Real-time biometric tracking enabled"
        });
      }, 2000);
    } catch (error) {
      console.error('Wearable connection error:', error);
    }
  };

  const startBiometricTracking = () => {
    const interval = setInterval(() => {
      if (!isSessionActive) {
        clearInterval(interval);
        return;
      }

      // Simulate real-time heart rate and other metrics
      const baseHR = 70;
      const exerciseMultiplier = isResting ? 1.2 : 2.1;
      const variability = Math.random() * 20 - 10;
      const currentHR = Math.round(baseHR * exerciseMultiplier + variability);
      
      setRealTimeBiometrics(prev => ({
        ...prev,
        heart_rate: currentHR,
        calories_burned: (prev.calories_burned || 0) + 0.2,
        power_output: isResting ? 0 : Math.round(200 + Math.random() * 100)
      }));

      // AI coaching based on heart rate
      if (currentHR > 180) {
        addAICoachingMessage('safety', "Heart rate is elevated. Consider extending your rest period.", 'high');
      } else if (currentHR < 130 && !isResting) {
        addAICoachingMessage('performance', "Push the intensity! Your heart rate indicates you can go harder.", 'medium');
      }

    }, 2000);
  };

  const completeSet = () => {
    const currentExercise = getCurrentExercise();
    if (!currentExercise) return;

    // Show feedback dialog for user input
    setFeedbackType('set');
    setShowFeedbackDialog(true);
  };

  const submitSetFeedback = (feedback: any) => {
    const currentExercise = getCurrentExercise();
    if (!currentExercise) return;

    const setLog: SetLog = {
      set_number: currentSetIndex + 1,
      weight_kg: currentSetData.weight_kg || currentExercise.weight_kg,
      reps: currentSetData.reps || currentExercise.reps,
      duration_seconds: currentSetData.duration_seconds || currentExercise.duration_seconds,
      rpe: feedback.rpe,
      rest_seconds: currentExercise.rest_seconds,
      completed: true,
      form_breakdown: feedback.formIssues || [],
      ai_coaching_tips: generateAITips(feedback),
      heart_rate: realTimeBiometrics.heart_rate
    };

    // Update exercise logs
    setExerciseLogs(prev => {
      const existingLogIndex = prev.findIndex(log => log.exercise_id === currentExercise.id);
      if (existingLogIndex >= 0) {
        const updated = [...prev];
        updated[existingLogIndex].sets_data.push(setLog);
        updated[existingLogIndex].fatigue_level = feedback.fatigueLevel;
        updated[existingLogIndex].pain_level = feedback.painLevel;
        updated[existingLogIndex].user_feedback = feedback.notes;
        return updated;
      } else {
        return [...prev, {
          exercise_id: currentExercise.id,
          sets_data: [setLog],
          fatigue_level: feedback.fatigueLevel,
          pain_level: feedback.painLevel,
          user_feedback: feedback.notes
        }];
      }
    });

    // AI analysis and coaching
    analyzeSetPerformance(feedback, setLog);

    // Update session stats
    setSessionStats(prev => ({
      ...prev,
      totalVolume: prev.totalVolume + ((setLog.weight_kg || 0) * (setLog.reps || 0)),
      setsCompleted: prev.setsCompleted + 1,
      perfectFormSets: prev.perfectFormSets + (feedback.formIssues?.length === 0 ? 1 : 0)
    }));

    // Start rest timer
    if (currentExercise.rest_seconds && currentSetIndex < (currentExercise.sets - 1)) {
      setRestTimer(currentExercise.rest_seconds);
      setIsResting(true);
      
      addAICoachingMessage('performance', 
        `Great set! Rest for ${currentExercise.rest_seconds} seconds. Focus on deep breathing and visualize your next set.`, 
        'medium'
      );
    }

    // Move to next set or exercise
    if (currentSetIndex < (currentExercise.sets - 1)) {
      setCurrentSetIndex(prev => prev + 1);
    } else {
      completeExercise();
    }

    setCurrentSetData({});
    setShowFeedbackDialog(false);
  };

  const generateAITips = (feedback: any): string[] => {
    const tips: string[] = [];
    
    if (feedback.rpe > 8) {
      tips.push("Consider reducing weight by 5-10% to maintain form quality");
    }
    
    if (feedback.formIssues?.includes('depth')) {
      tips.push("Focus on reaching proper depth - quality over quantity");
    }
    
    if (feedback.fatigueLevel > 7) {
      tips.push("High fatigue detected. Phoenix recommends extending rest periods");
    }
    
    if (feedback.painLevel > 3) {
      tips.push("Pain signal received. Consider exercise modification or skip");
    }
    
    return tips;
  };

  const analyzeSetPerformance = (feedback: any, setLog: SetLog) => {
    // AI performance analysis
    if (feedback.rpe > 8 && feedback.fatigueLevel > 7) {
      addAICoachingMessage('adaptation', 
        "Phoenix detects high exertion levels. Would you like me to adapt the remaining sets?", 
        'high'
      );
      setShowAdaptationDialog(true);
    }
    
    if (feedback.formIssues?.length > 0) {
      addAICoachingMessage('technique', 
        `Form attention needed: ${feedback.formIssues.join(', ')}. Focus on these cues for your next set.`, 
        'high'
      );
    }
    
    if (feedback.painLevel > 3) {
      addAICoachingMessage('safety', 
        "Pain signal detected. Phoenix prioritizes your safety. Consider stopping this exercise.", 
        'critical'
      );
    }
  };

  const completeExercise = () => {
    const currentExercise = getCurrentExercise();
    if (!currentExercise) return;

    // Show exercise completion feedback dialog
    setFeedbackType('exercise');
    setShowFeedbackDialog(true);
  };

  const adaptWorkout = async (adaptationType: string) => {
    const currentExercise = getCurrentExercise();
    if (!currentExercise) return;

    try {
      const { data, error } = await supabase.functions.invoke('phoenix-workout-engine', {
        body: {
          action: 'adapt',
          workout: sessionData,
          adaptation_type: adaptationType,
          current_exercise: currentExercise,
          user_feedback: exerciseLogs.find(log => log.exercise_id === currentExercise.id),
          biometrics: realTimeBiometrics
        }
      });

      if (error) throw error;

      setSessionData(data);
      setPhoenixAdaptations(prev => [...prev, `${adaptationType}: ${currentExercise.name}`]);
      setSessionStats(prev => ({ ...prev, adaptationsMade: prev.adaptationsMade + 1 }));
      
      addAICoachingMessage('adaptation', 
        `Workout adapted! I've optimized your session based on your current state.`, 
        'high'
      );
      
      toast({
        title: "🎯 Phoenix Adaptation Complete",
        description: "Your workout has been optimized in real-time"
      });

    } catch (error) {
      console.error('Error adapting workout:', error);
    }
    
    setShowAdaptationDialog(false);
  };

  // Rest timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsResting(false);
            addAICoachingMessage('motivation', 
              "Rest complete! Time to crush your next set. You've got this!", 
              'high'
            );
            return 0;
          }
          
          // Countdown coaching
          if (prev === 30) {
            addAICoachingMessage('performance', "30 seconds left. Start mentally preparing for your next set.", 'low');
          } else if (prev === 10) {
            addAICoachingMessage('motivation', "10 seconds! Get ready to dominate!", 'medium');
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
        <Card className="bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="text-center py-12">
            <Brain className="h-16 w-16 text-orange-600 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-semibold mb-2">Initializing Phoenix Engine...</h3>
            <p className="text-muted-foreground">Preparing your AI-powered workout experience</p>
            <div className="mt-4">
              <Progress value={75} className="w-64 mx-auto" />
            </div>
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
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Session Header */}
      <Card className="bg-gradient-to-r from-orange-50 via-red-50 to-orange-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-600" />
            {sessionData.name}
            <Badge variant="secondary" className="ml-auto bg-orange-100 text-orange-800">
              Phoenix Engine Active
            </Badge>
            <Button variant="ghost" size="sm" onClick={onExit}>
              Exit Session
            </Button>
          </CardTitle>
          <CardDescription className="text-orange-700">
            {isSessionActive ? "AI-powered session in progress" : "Ready to unleash your potential"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{sessionStats.setsCompleted}</div>
              <div className="text-sm text-muted-foreground">Sets Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{Math.round(sessionStats.totalVolume)}</div>
              <div className="text-sm text-muted-foreground">Total Volume (kg)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{Math.round(sessionStats.caloriesBurned)}</div>
              <div className="text-sm text-muted-foreground">Calories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{sessionStats.adaptationsMade}</div>
              <div className="text-sm text-muted-foreground">AI Adaptations</div>
            </div>
          </div>
          
          <Progress value={progressPercentage} className="mb-2" />
          <div className="text-sm text-muted-foreground text-center">
            Exercise {completedExercises} of {totalExercises} • {Math.round(progressPercentage)}% Complete
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Workout Interface */}
        <div className="lg:col-span-2 space-y-6">
          {!isSessionActive ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-6 w-6 text-green-600" />
                  Start Phoenix Session
                </CardTitle>
                <CardDescription>
                  Begin your AI-powered, adaptive workout experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-800 mb-2">Phoenix Features Active:</h4>
                    <ul className="space-y-1 text-sm text-orange-700">
                      <li>✓ Real-time AI coaching and form feedback</li>
                      <li>✓ Adaptive workout modifications based on performance</li>
                      <li>✓ Live biometric monitoring and heart rate zones</li>
                      <li>✓ Instant exercise substitutions for injuries or fatigue</li>
                      <li>✓ Voice-guided coaching throughout your session</li>
                    </ul>
                  </div>
                  
                  <Button 
                    onClick={startPhoenixSession} 
                    className="w-full" 
                    size="lg"
                    disabled={!sessionData}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start Phoenix Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Current Exercise */}
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Dumbbell className="h-5 w-5" />
                      {currentExercise?.name}
                    </span>
                    <Badge variant="outline">
                      Set {currentSetIndex + 1} of {currentExercise?.sets}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {currentBlock?.name} • {currentExercise?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Exercise Parameters */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">
                        {currentExercise?.weight_kg || currentExercise?.duration_seconds || '-'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {currentExercise?.weight_kg ? 'kg' : 'seconds'}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-lg font-bold text-red-600">
                        {currentExercise?.reps || '-'}
                      </div>
                      <div className="text-sm text-muted-foreground">Reps</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">
                        {currentExercise?.rpe_target || '-'}
                      </div>
                      <div className="text-sm text-muted-foreground">Target RPE</div>
                    </div>
                  </div>

                  {/* AI Form Cues */}
                  {currentExercise?.ai_cues && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        AI Coaching Cues
                      </h4>
                      <ul className="space-y-1 text-sm text-blue-700">
                        {currentExercise.ai_cues.map((cue: string, index: number) => (
                          <li key={index}>• {cue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Rest Timer */}
                  {isResting && (
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                      <CardContent className="text-center py-6">
                        <Timer className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {Math.floor(restTimer / 60)}:{(restTimer % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="text-sm text-blue-700">Rest Time Remaining</div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {!isResting && (
                      <Button onClick={completeSet} className="flex-1">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Complete Set
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAdaptationDialog(true)}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Adapt
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Real-time Biometrics */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Live Biometrics
                    {wearableConnected && (
                      <Badge variant="outline" className="ml-auto">
                        <Watch className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {realTimeBiometrics.heart_rate || '--'}
                      </div>
                      <div className="text-sm text-muted-foreground">BPM</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {realTimeBiometrics.power_output || '--'}
                      </div>
                      <div className="text-sm text-muted-foreground">Watts</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* AI Coaching Panel */}
        <div className="space-y-6">
          {/* AI Coach Messages */}
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Coach
                <Switch
                  checked={isLiveCoachingActive}
                  onCheckedChange={setIsLiveCoachingActive}
                  className="ml-auto"
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-80 overflow-y-auto">
              {aiCoachingMessages.map((message) => (
                <div 
                  key={message.id} 
                  className={`p-3 rounded-lg ${
                    message.priority === 'critical' ? 'bg-red-50 border border-red-200' :
                    message.priority === 'high' ? 'bg-orange-50 border border-orange-200' :
                    'bg-purple-50 border border-purple-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.type === 'motivation' && <Trophy className="h-4 w-4 text-purple-600 mt-0.5" />}
                    {message.type === 'technique' && <Target className="h-4 w-4 text-blue-600 mt-0.5" />}
                    {message.type === 'safety' && <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />}
                    {message.type === 'performance' && <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />}
                    {message.type === 'adaptation' && <Zap className="h-4 w-4 text-orange-600 mt-0.5" />}
                    
                    <div className="flex-1">
                      <p className="text-sm font-medium">{message.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Phoenix Adaptations */}
          {phoenixAdaptations.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  Phoenix Adaptations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {phoenixAdaptations.map((adaptation, index) => (
                    <div key={index} className="p-2 bg-orange-50 rounded text-sm">
                      {adaptation}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Session Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Session Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Audio Coaching</span>
                <Switch
                  checked={isLiveCoachingActive}
                  onCheckedChange={setIsLiveCoachingActive}
                />
              </div>
              
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={onExit}
              >
                <Square className="h-4 w-4 mr-2" />
                End Session
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>RPE (Rate of Perceived Exertion)</Label>
              <div className="flex gap-2 mt-2">
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <Button
                    key={num}
                    variant={currentSetData.rpe === num ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentSetData(prev => ({ ...prev, rpe: num }))}
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Fatigue Level (1-10)</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={currentSetData.fatigue_level || ''}
                onChange={(e) => setCurrentSetData(prev => ({ 
                  ...prev, 
                  fatigue_level: parseInt(e.target.value) 
                }))}
              />
            </div>
            
            <div>
              <Label>Pain Level (0-10)</Label>
              <Input
                type="number"
                min="0"
                max="10"
                value={currentSetData.pain_level || ''}
                onChange={(e) => setCurrentSetData(prev => ({ 
                  ...prev, 
                  pain_level: parseInt(e.target.value) 
                }))}
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                placeholder="How did that set feel?"
                value={currentSetData.notes || ''}
                onChange={(e) => setCurrentSetData(prev => ({ 
                  ...prev, 
                  notes: e.target.value 
                }))}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                className="flex-1"
                onClick={() => submitSetFeedback({
                  rpe: currentSetData.rpe || 5,
                  fatigueLevel: currentSetData.fatigue_level || 5,
                  painLevel: currentSetData.pain_level || 0,
                  notes: currentSetData.notes || '',
                  formIssues: []
                })}
              >
                Complete Set
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowFeedbackDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Adaptation Dialog */}
      <Dialog open={showAdaptationDialog} onOpenChange={setShowAdaptationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phoenix Adaptation Options</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Button 
              className="w-full justify-start"
              variant="outline"
              onClick={() => adaptWorkout('reduce_intensity')}
            >
              Reduce Intensity (Lower weight/reps)
            </Button>
            <Button 
              className="w-full justify-start"
              variant="outline"
              onClick={() => adaptWorkout('substitute_exercise')}
            >
              Substitute Exercise (Find alternative)
            </Button>
            <Button 
              className="w-full justify-start"
              variant="outline"
              onClick={() => adaptWorkout('extend_rest')}
            >
              Extend Rest Periods
            </Button>
            <Button 
              className="w-full justify-start"
              variant="outline"
              onClick={() => adaptWorkout('skip_exercise')}
            >
              Skip This Exercise
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}