import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Gauge, 
  Heart,
  MessageSquare,
  Zap,
  Shield,
  Target,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Pause,
  SkipForward
} from "lucide-react";

interface AdaptationFeedback {
  exerciseId: string;
  exerciseName: string;
  feedbackType: 'rpe' | 'pain' | 'difficulty' | 'equipment' | 'motivation';
  rating?: number;
  description?: string;
  suggestions?: string[];
  timestamp: Date;
}

interface AdaptationResponse {
  exerciseId: string;
  adaptationType: 'intensity_increase' | 'intensity_decrease' | 'exercise_swap' | 'rest_extension' | 'form_cue';
  newParameters?: any;
  coachingMessage: string;
  reasoning: string;
}

interface RealTimeAdaptationProps {
  currentExercise: any;
  sessionData: any;
  onExerciseAdapted: (adaptedExercise: any) => void;
  onFeedbackSubmitted: (feedback: AdaptationFeedback) => void;
}

export default function RealTimeAdaptation({ 
  currentExercise, 
  sessionData, 
  onExerciseAdapted, 
  onFeedbackSubmitted 
}: RealTimeAdaptationProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentRPE, setCurrentRPE] = useState<number>(7);
  const [painLevel, setPainLevel] = useState<number>(0);
  const [motivationLevel, setMotivationLevel] = useState<number>(7);
  const [customFeedback, setCustomFeedback] = useState("");
  const [isAdapting, setIsAdapting] = useState(false);
  const [recentAdaptations, setRecentAdaptations] = useState<AdaptationResponse[]>([]);
  const [exerciseHistory, setExerciseHistory] = useState<any[]>([]);

  // Load exercise history for pattern recognition
  useEffect(() => {
    if (currentExercise && user) {
      loadExerciseHistory();
    }
  }, [currentExercise, user]);

  const loadExerciseHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('exercise_performance_history')
        .select('*')
        .eq('user_id', user?.id)
        .eq('exercise_id', currentExercise.id)
        .order('performance_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      setExerciseHistory(data || []);
    } catch (error) {
      console.error('Error loading exercise history:', error);
    }
  };

  const handleRPEFeedback = async () => {
    const feedback: AdaptationFeedback = {
      exerciseId: currentExercise.id,
      exerciseName: currentExercise.name,
      feedbackType: 'rpe',
      rating: currentRPE,
      timestamp: new Date()
    };

    onFeedbackSubmitted(feedback);

    // Auto-adapt if RPE is extreme
    if (currentRPE >= 9) {
      await adaptExercise('too_intense', `RPE reported as ${currentRPE}/10 - too high`);
    } else if (currentRPE <= 4) {
      await adaptExercise('too_easy', `RPE reported as ${currentRPE}/10 - too low`);
    }
  };

  const handlePainFeedback = async () => {
    if (painLevel > 0) {
      const feedback: AdaptationFeedback = {
        exerciseId: currentExercise.id,
        exerciseName: currentExercise.name,
        feedbackType: 'pain',
        rating: painLevel,
        description: painLevel > 5 ? 'Significant discomfort' : 'Mild discomfort',
        timestamp: new Date()
      };

      onFeedbackSubmitted(feedback);

      if (painLevel > 3) {
        await adaptExercise('pain_signal', `Pain level reported as ${painLevel}/10`);
      }
    }
  };

  const handleDifficultyFeedback = async (type: 'too_easy' | 'too_hard') => {
    const feedback: AdaptationFeedback = {
      exerciseId: currentExercise.id,
      exerciseName: currentExercise.name,
      feedbackType: 'difficulty',
      description: type === 'too_easy' ? 'Exercise is too easy' : 'Exercise is too difficult',
      timestamp: new Date()
    };

    onFeedbackSubmitted(feedback);
    await adaptExercise(type, feedback.description!);
  };

  const adaptExercise = async (reason: string, details: string) => {
    if (!currentExercise || !user) return;

    setIsAdapting(true);
    try {
      // Call Phoenix adaptation engine
      const { data, error } = await supabase.functions.invoke('phoenix-workout-engine', {
        body: {
          action: 'adapt_realtime',
          currentExercise,
          sessionData,
          feedback: {
            reason,
            details,
            rpe: currentRPE,
            painLevel,
            motivationLevel,
            exerciseHistory,
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) throw error;

      const adaptationResponse: AdaptationResponse = data;
      
      // Update exercise with new parameters
      onExerciseAdapted(adaptationResponse);
      
      // Track adaptation
      setRecentAdaptations(prev => [adaptationResponse, ...prev.slice(0, 4)]);
      
      toast({
        title: "🎯 Phoenix Adapted Your Exercise!",
        description: adaptationResponse.coachingMessage
      });

      // Log adaptation event
      await supabase
        .from('events')
        .insert({
          user_id: user.id,
          event_type: 'exercise_adaptation',
          event_data: {
            exercise_id: currentExercise.id,
            adaptation_type: adaptationResponse.adaptationType,
            reason,
            details,
            session_id: sessionData.id
          }
        });

    } catch (error) {
      console.error('Error adapting exercise:', error);
      toast({
        title: "Adaptation Error",
        description: "Unable to adapt exercise. Please continue or skip if needed.",
        variant: "destructive"
      });
    } finally {
      setIsAdapting(false);
    }
  };

  const submitCustomFeedback = async () => {
    if (!customFeedback.trim()) return;

    const feedback: AdaptationFeedback = {
      exerciseId: currentExercise.id,
      exerciseName: currentExercise.name,
      feedbackType: 'motivation',
      description: customFeedback,
      timestamp: new Date()
    };

    onFeedbackSubmitted(feedback);
    
    // Analyze custom feedback for adaptation triggers
    const lowerFeedback = customFeedback.toLowerCase();
    if (lowerFeedback.includes('pain') || lowerFeedback.includes('hurt') || lowerFeedback.includes('sore')) {
      await adaptExercise('pain_signal', customFeedback);
    } else if (lowerFeedback.includes('easy') || lowerFeedback.includes('light')) {
      await adaptExercise('too_easy', customFeedback);
    } else if (lowerFeedback.includes('hard') || lowerFeedback.includes('difficult') || lowerFeedback.includes('heavy')) {
      await adaptExercise('too_hard', customFeedback);
    }

    setCustomFeedback("");
  };

  const getLastPerformance = () => {
    if (exerciseHistory.length === 0) return null;
    const last = exerciseHistory[0];
    return {
      weight: last.weight_used_kg,
      reps: last.reps_completed,
      rpe: last.rpe_rating,
      date: new Date(last.performance_date).toLocaleDateString()
    };
  };

  const getAdaptationIcon = (type: string) => {
    switch (type) {
      case 'intensity_increase': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'intensity_decrease': return <TrendingDown className="h-4 w-4 text-orange-600" />;
      case 'exercise_swap': return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case 'rest_extension': return <Pause className="h-4 w-4 text-purple-600" />;
      case 'form_cue': return <Target className="h-4 w-4 text-yellow-600" />;
      default: return <Brain className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!currentExercise) {
    return null;
  }

  const lastPerformance = getLastPerformance();

  return (
    <div className="space-y-6">
      {/* Current Exercise Status */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-orange-600" />
            Phoenix Real-Time Adaptation
          </CardTitle>
          <CardDescription>
            Provide feedback to optimize your exercise in real-time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{currentExercise.name}</h4>
              <p className="text-sm text-muted-foreground">
                {currentExercise.muscle_group_primary} • {currentExercise.sets} sets × {currentExercise.reps} reps
              </p>
            </div>
            {lastPerformance && (
              <div className="text-right">
                <p className="text-sm font-medium">Last Performance</p>
                <p className="text-xs text-muted-foreground">
                  {lastPerformance.weight}kg × {lastPerformance.reps} reps (RPE {lastPerformance.rpe})
                </p>
                <p className="text-xs text-muted-foreground">{lastPerformance.date}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Feedback Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleDifficultyFeedback('too_easy')}
              disabled={isAdapting}
              className="h-16 flex flex-col gap-2"
            >
              <TrendingUp className="h-6 w-6 text-green-600" />
              <span>Too Easy</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleDifficultyFeedback('too_hard')}
              disabled={isAdapting}
              className="h-16 flex flex-col gap-2"
            >
              <TrendingDown className="h-6 w-6 text-red-600" />
              <span>Too Hard</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Detailed Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* RPE Scale */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Rate of Perceived Exertion (RPE)</label>
              <Badge variant="outline" className="font-mono">
                {currentRPE}/10
              </Badge>
            </div>
            <Slider
              value={[currentRPE]}
              onValueChange={(value) => setCurrentRPE(value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Very Easy</span>
              <span>Moderate</span>
              <span>Maximal</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRPEFeedback}
              className="mt-2 w-full"
            >
              <Heart className="mr-2 h-4 w-4" />
              Submit RPE Feedback
            </Button>
          </div>

          {/* Pain Level */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Discomfort Level</label>
              <Badge variant={painLevel > 3 ? "destructive" : "outline"} className="font-mono">
                {painLevel}/10
              </Badge>
            </div>
            <Slider
              value={[painLevel]}
              onValueChange={(value) => setPainLevel(value[0])}
              max={10}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>No Pain</span>
              <span>Moderate</span>
              <span>Severe</span>
            </div>
            {painLevel > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePainFeedback}
                className="mt-2 w-full text-red-600"
              >
                <Shield className="mr-2 h-4 w-4" />
                Report Discomfort
              </Button>
            )}
          </div>

          {/* Motivation Level */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Energy/Motivation Level</label>
              <Badge variant="outline" className="font-mono">
                {motivationLevel}/10
              </Badge>
            </div>
            <Slider
              value={[motivationLevel]}
              onValueChange={(value) => setMotivationLevel(value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Exhausted</span>
              <span>Moderate</span>
              <span>Energized</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Tell Phoenix How You Feel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe how this exercise feels, any concerns, or suggestions..."
            value={customFeedback}
            onChange={(e) => setCustomFeedback(e.target.value)}
            rows={3}
          />
          <Button
            onClick={submitCustomFeedback}
            disabled={!customFeedback.trim() || isAdapting}
            className="w-full"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Send Feedback to Phoenix
          </Button>
        </CardContent>
      </Card>

      {/* Recent Adaptations */}
      {recentAdaptations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Recent Adaptations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAdaptations.map((adaptation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                {getAdaptationIcon(adaptation.adaptationType)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{adaptation.coachingMessage}</p>
                  <p className="text-xs text-muted-foreground">{adaptation.reasoning}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Adaptation Loading */}
      {isAdapting && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="text-center py-6">
            <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-3 animate-spin" />
            <h3 className="text-lg font-semibold text-blue-800">Phoenix is Adapting...</h3>
            <p className="text-blue-700">Analyzing your feedback and optimizing the exercise</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}