import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Brain, 
  Activity, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  Zap,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Heart
} from "lucide-react";

interface AdaptationTrigger {
  type: 'rpe_feedback' | 'pain_signal' | 'form_breakdown' | 'fatigue' | 'equipment_unavailable';
  value: any;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
}

interface ExerciseAdaptation {
  id: string;
  original_exercise: string;
  adapted_exercise: string;
  adaptation_type: 'load_reduction' | 'exercise_swap' | 'set_adjustment' | 'rest_increase' | 'form_modification';
  adaptation_reason: string;
  confidence_score: number;
  user_satisfaction?: number;
  effectiveness_score?: number;
}

interface RealTimeSession {
  current_exercise: string;
  set_number: number;
  target_reps: number;
  target_weight: number;
  target_rpe: number;
  actual_rpe?: number;
  pain_level?: number;
  motivation_level?: number;
  form_quality?: number;
}

export function RealTimeAdaptationEngine() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentSession, setCurrentSession] = useState<RealTimeSession>({
    current_exercise: 'Back Squat',
    set_number: 2,
    target_reps: 8,
    target_weight: 100,
    target_rpe: 8,
  });

  const [adaptationTriggers, setAdaptationTriggers] = useState<AdaptationTrigger[]>([]);
  const [recentAdaptations, setRecentAdaptations] = useState<ExerciseAdaptation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedbackRPE, setFeedbackRPE] = useState([8]);
  const [painLevel, setPainLevel] = useState([0]);
  const [motivationLevel, setMotivationLevel] = useState([7]);
  const [customFeedback, setCustomFeedback] = useState('');

  useEffect(() => {
    loadRecentAdaptations();
  }, [user]);

  const loadRecentAdaptations = async () => {
    // Mock recent adaptations data
    const mockAdaptations: ExerciseAdaptation[] = [
      {
        id: '1',
        original_exercise: 'Barbell Bench Press',
        adapted_exercise: 'Dumbbell Bench Press',
        adaptation_type: 'exercise_swap',
        adaptation_reason: 'Shoulder discomfort detected (RPE pain > 6)',
        confidence_score: 0.92,
        user_satisfaction: 4,
        effectiveness_score: 0.85
      },
      {
        id: '2',
        original_exercise: 'Deadlift',
        adapted_exercise: 'Romanian Deadlift',
        adaptation_type: 'load_reduction',
        adaptation_reason: 'Form breakdown observed, reduced load by 15%',
        confidence_score: 0.88,
        user_satisfaction: 5,
        effectiveness_score: 0.90
      },
      {
        id: '3',
        original_exercise: 'Pull-ups',
        adapted_exercise: 'Assisted Pull-ups',
        adaptation_type: 'form_modification',
        adaptation_reason: 'Fatigue pattern indicates early failure',
        confidence_score: 0.95,
        user_satisfaction: 4,
        effectiveness_score: 0.92
      }
    ];

    setRecentAdaptations(mockAdaptations);
  };

  const triggerAdaptation = async (trigger: AdaptationTrigger) => {
    setIsAnalyzing(true);
    setAdaptationTriggers(prev => [...prev, trigger]);

    try {
      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate adaptation based on trigger
      const adaptation = await generateAdaptation(trigger);
      
      if (adaptation) {
        setRecentAdaptations(prev => [adaptation, ...prev.slice(0, 4)]);
        
        toast({
          title: "Workout Adapted",
          description: `${adaptation.adapted_exercise} - ${adaptation.adaptation_reason}`,
        });
      }

    } catch (error) {
      console.error('Error generating adaptation:', error);
      toast({
        title: "Adaptation Failed",
        description: "Unable to generate workout adaptation",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateAdaptation = async (trigger: AdaptationTrigger): Promise<ExerciseAdaptation | null> => {
    const adaptationId = Date.now().toString();
    
    switch (trigger.type) {
      case 'rpe_feedback':
        if (trigger.value > currentSession.target_rpe + 1) {
          return {
            id: adaptationId,
            original_exercise: currentSession.current_exercise,
            adapted_exercise: currentSession.current_exercise,
            adaptation_type: 'load_reduction',
            adaptation_reason: `RPE too high (${trigger.value}/${currentSession.target_rpe}), reducing load by 10%`,
            confidence_score: 0.85
          };
        }
        break;

      case 'pain_signal':
        if (trigger.value > 3) {
          return {
            id: adaptationId,
            original_exercise: currentSession.current_exercise,
            adapted_exercise: 'Machine Leg Press', // Safe alternative
            adaptation_type: 'exercise_swap',
            adaptation_reason: `Pain detected (level ${trigger.value}), switching to safer alternative`,
            confidence_score: 0.95
          };
        }
        break;

      case 'fatigue':
        return {
          id: adaptationId,
          original_exercise: currentSession.current_exercise,
          adapted_exercise: currentSession.current_exercise,
          adaptation_type: 'rest_increase',
          adaptation_reason: 'Excessive fatigue detected, increasing rest period to 3 minutes',
          confidence_score: 0.78
        };

      case 'form_breakdown':
        return {
          id: adaptationId,
          original_exercise: currentSession.current_exercise,
          adapted_exercise: 'Goblet Squat',
          adaptation_type: 'form_modification',
          adaptation_reason: 'Form degradation observed, switching to movement pattern reset',
          confidence_score: 0.90
        };

      default:
        return null;
    }

    return null;
  };

  const handleRPEFeedback = () => {
    const trigger: AdaptationTrigger = {
      type: 'rpe_feedback',
      value: feedbackRPE[0],
      severity: feedbackRPE[0] > currentSession.target_rpe + 1 ? 'high' : 'medium',
      timestamp: new Date()
    };
    
    triggerAdaptation(trigger);
  };

  const handlePainFeedback = () => {
    const trigger: AdaptationTrigger = {
      type: 'pain_signal',
      value: painLevel[0],
      severity: painLevel[0] > 5 ? 'high' : painLevel[0] > 3 ? 'medium' : 'low',
      timestamp: new Date()
    };
    
    triggerAdaptation(trigger);
  };

  const handleFatigueAlert = () => {
    const trigger: AdaptationTrigger = {
      type: 'fatigue',
      value: { motivation: motivationLevel[0], fatigue_level: 10 - motivationLevel[0] },
      severity: motivationLevel[0] < 4 ? 'high' : 'medium',
      timestamp: new Date()
    };
    
    triggerAdaptation(trigger);
  };

  const handleFormBreakdown = () => {
    const trigger: AdaptationTrigger = {
      type: 'form_breakdown',
      value: { form_quality: 3 },
      severity: 'high',
      timestamp: new Date()
    };
    
    triggerAdaptation(trigger);
  };

  const getAdaptationIcon = (type: string) => {
    switch (type) {
      case 'load_reduction':
        return <TrendingDown className="h-4 w-4 text-yellow-500" />;
      case 'exercise_swap':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'set_adjustment':
        return <Target className="h-4 w-4 text-purple-500" />;
      case 'rest_increase':
        return <Clock className="h-4 w-4 text-green-500" />;
      case 'form_modification':
        return <Activity className="h-4 w-4 text-orange-500" />;
      default:
        return <Zap className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSatisfactionIcon = (satisfaction?: number) => {
    if (!satisfaction) return null;
    return satisfaction >= 4 ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Real-Time Adaptation Engine</h1>
        <p className="text-muted-foreground">
          AI-powered workout modifications based on live feedback and performance indicators
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Current Session Status */}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Current Exercise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{currentSession.current_exercise}</h3>
                  <p className="text-sm text-muted-foreground">Set {currentSession.set_number} of 3</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Target:</span>
                    <div>{currentSession.target_reps} reps @ {currentSession.target_weight}kg</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">RPE Target:</span>
                    <div>{currentSession.target_rpe}/10</div>
                  </div>
                </div>

                {currentSession.actual_rpe && (
                  <div className="p-3 bg-secondary/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Last Set:</div>
                    <div>RPE {currentSession.actual_rpe}/10</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Feedback Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Live Feedback
              </CardTitle>
              <CardDescription>
                Provide real-time feedback for intelligent adaptations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* RPE Feedback */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Current RPE</span>
                  <span className="text-sm">{feedbackRPE[0]}/10</span>
                </div>
                <Slider
                  value={feedbackRPE}
                  onValueChange={setFeedbackRPE}
                  max={10}
                  step={0.5}
                  className="mb-2"
                />
                <Button 
                  size="sm" 
                  onClick={handleRPEFeedback}
                  disabled={isAnalyzing}
                  className="w-full"
                >
                  Submit RPE Feedback
                </Button>
              </div>

              {/* Pain Level */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Pain Level</span>
                  <span className="text-sm">{painLevel[0]}/10</span>
                </div>
                <Slider
                  value={painLevel}
                  onValueChange={setPainLevel}
                  max={10}
                  step={1}
                  className="mb-2"
                />
                <Button 
                  size="sm" 
                  onClick={handlePainFeedback}
                  disabled={isAnalyzing}
                  variant={painLevel[0] > 3 ? "destructive" : "outline"}
                  className="w-full"
                >
                  Report Pain Level
                </Button>
              </div>

              {/* Motivation/Energy */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Energy Level</span>
                  <span className="text-sm">{motivationLevel[0]}/10</span>
                </div>
                <Slider
                  value={motivationLevel}
                  onValueChange={setMotivationLevel}
                  max={10}
                  step={1}
                  className="mb-2"
                />
                <Button 
                  size="sm" 
                  onClick={handleFatigueAlert}
                  disabled={isAnalyzing}
                  variant={motivationLevel[0] < 4 ? "secondary" : "outline"}
                  className="w-full"
                >
                  Update Energy Status
                </Button>
              </div>

              {/* Quick Action Buttons */}
              <div className="space-y-2">
                <Button 
                  size="sm" 
                  onClick={handleFormBreakdown}
                  disabled={isAnalyzing}
                  variant="destructive"
                  className="w-full"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Form Breakdown Alert
                </Button>
              </div>

              {/* Custom Feedback */}
              <div>
                <span className="text-sm font-medium">Additional Notes</span>
                <Textarea
                  placeholder="Any other feedback or concerns..."
                  value={customFeedback}
                  onChange={(e) => setCustomFeedback(e.target.value)}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Adaptation Results */}
        <div className="lg:col-span-2">
          {/* Analysis Status */}
          {isAnalyzing && (
            <Card className="mb-6 border-primary">
              <CardContent className="py-6">
                <div className="flex items-center justify-center space-x-4">
                  <div className="animate-spin">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Analysis in Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      Analyzing your feedback and generating optimal adaptations...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Adaptations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Recent Adaptations
              </CardTitle>
              <CardDescription>
                AI-generated workout modifications based on your feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentAdaptations.length === 0 ? (
                <div className="text-center py-12">
                  <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Adaptations Yet</h3>
                  <p className="text-muted-foreground">
                    Provide feedback during your workout to see AI adaptations
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAdaptations.map((adaptation, index) => (
                    <Card key={adaptation.id} className="border-l-4 border-l-primary">
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getAdaptationIcon(adaptation.adaptation_type)}
                            <span className="font-medium capitalize">
                              {adaptation.adaptation_type.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {Math.round(adaptation.confidence_score * 100)}% confidence
                            </Badge>
                            {getSatisfactionIcon(adaptation.user_satisfaction)}
                          </div>
                        </div>
                        
                        <div className="text-sm mb-2">
                          <span className="text-muted-foreground">From:</span> {adaptation.original_exercise}
                        </div>
                        <div className="text-sm mb-2">
                          <span className="text-muted-foreground">To:</span> {adaptation.adapted_exercise}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {adaptation.adaptation_reason}
                        </p>

                        {adaptation.effectiveness_score && (
                          <div className="flex items-center space-x-4 text-xs">
                            <div>
                              <span className="text-muted-foreground">Effectiveness:</span>
                              <span className="ml-1">{Math.round(adaptation.effectiveness_score * 100)}%</span>
                            </div>
                            {adaptation.user_satisfaction && (
                              <div>
                                <span className="text-muted-foreground">Satisfaction:</span>
                                <span className="ml-1">{adaptation.user_satisfaction}/5</span>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}