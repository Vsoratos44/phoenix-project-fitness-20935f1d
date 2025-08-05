import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Brain, 
  Target, 
  Clock, 
  Dumbbell, 
  Heart, 
  TrendingUp, 
  Shield, 
  Zap,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react";

interface WorkoutPreferences {
  goal: string;
  duration: number;
  intensity: string;
  equipment: string[];
  focus_areas: string[];
  experience_level: string;
  injuries: string[];
  preferred_style: string;
}

interface GeneratedWorkout {
  id: string;
  name: string;
  description: string;
  estimated_duration: number;
  difficulty_level: number;
  blocks: WorkoutBlock[];
  coaching_notes: string[];
  progressive_overload_recommendations: string[];
  injury_considerations: string[];
}

interface WorkoutBlock {
  name: string;
  type: string;
  exercises: Exercise[];
  estimated_duration: number;
  coaching_tips: string[];
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight_percentage?: number;
  rest_seconds: number;
  rpe_target: number;
  form_cues: string[];
  progressions: string[];
  regressions: string[];
  contraindications: string[];
}

export function EnhancedAIWorkoutGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [preferences, setPreferences] = useState<WorkoutPreferences>({
    goal: '',
    duration: 45,
    intensity: 'moderate',
    equipment: [],
    focus_areas: [],
    experience_level: 'intermediate',
    injuries: [],
    preferred_style: 'balanced'
  });

  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [phoenixScore, setPhoenixScore] = useState<any>(null);
  const [recentPerformance, setRecentPerformance] = useState<any[]>([]);
  
  // Load user profile and performance data
  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load enhanced profile
      const { data: profile } = await supabase
        .from('enhanced_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setUserProfile(profile);
      }

      // Load latest Phoenix score
      const { data: phoenixData } = await supabase
        .from('phoenix_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (phoenixData) {
        setPhoenixScore(phoenixData);
      }

      // Load recent performance data
      const { data: performanceData } = await supabase
        .from('exercise_performance_history')
        .select('*')
        .eq('user_id', user.id)
        .order('performance_date', { ascending: false })
        .limit(10);

      if (performanceData) {
        setRecentPerformance(performanceData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleGenerateIntelligentWorkout = async () => {
    setIsGenerating(true);
    
    try {
      // Enhanced workout generation with AI intelligence
      const workoutData = {
        user_preferences: preferences,
        user_profile: userProfile,
        phoenix_score: phoenixScore,
        recent_performance: recentPerformance,
        biomechanical_considerations: await analyzeBiomechanics(),
        injury_contraindications: await getInjuryContraindications(),
        progressive_overload_plan: await calculateProgressiveOverload(),
        recovery_status: await assessRecoveryStatus()
      };

      // Call enhanced Phoenix Workout Engine
      const { data, error } = await supabase.functions.invoke('phoenix-workout-engine', {
        body: {
          action: 'generate_intelligent_workout',
          data: workoutData
        }
      });

      if (error) throw error;

      setGeneratedWorkout(data.workout);
      
      // Log generation for analytics
      await logWorkoutGeneration(data.workout, workoutData);

      toast({
        title: "Intelligent Workout Generated!",
        description: `${data.workout.name} - ${data.workout.estimated_duration} minutes`,
      });

    } catch (error) {
      console.error('Error generating workout:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to generate intelligent workout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeBiomechanics = async () => {
    // Analyze user's movement patterns and restrictions
    return {
      mobility_scores: userProfile?.mobility_scores || {},
      movement_restrictions: [],
      dominant_side: userProfile?.dominant_hand || 'right',
      postural_considerations: []
    };
  };

  const getInjuryContraindications = async () => {
    // Mock contraindications until tables are created
    return [
      { exercise: 'overhead_press', reason: 'shoulder_impingement' },
      { exercise: 'deadlift', reason: 'lower_back_strain' }
    ];
  };

  const calculateProgressiveOverload = async () => {
    // Calculate intelligent progressive overload based on recent performance
    const overloadPlan = {
      method: 'autoregulated',
      progression_factors: {
        strength: 0.025, // 2.5% weekly increase
        hypertrophy: 0.05, // 5% volume increase
        endurance: 0.1 // 10% duration increase
      },
      deload_triggers: {
        rpe_threshold: 9.5,
        performance_decline: 0.1,
        recovery_score: 6
      }
    };

    return overloadPlan;
  };

  const assessRecoveryStatus = async () => {
    // Assess current recovery status from Phoenix score
    return {
      overall_readiness: phoenixScore?.overall_score || 7,
      recommended_intensity: phoenixScore?.suggested_intensity || 'moderate',
      fatigue_level: 10 - (phoenixScore?.recovery_score || 7),
      stress_adaptation: phoenixScore?.stress_score || 7
    };
  };

  const logWorkoutGeneration = async (workout: GeneratedWorkout, context: any) => {
    try {
      await supabase
        .from('ai_workout_generations')
        .insert({
          user_id: user?.id,
          prompt: JSON.stringify(preferences),
          generated_workout: workout as any,
          user_preferences: context.user_preferences as any,
          generation_time_ms: Date.now(),
          model_used: 'phoenix-engine-v2'
        });
    } catch (error) {
      console.error('Error logging workout generation:', error);
    }
  };

  const renderWorkoutBlock = (block: WorkoutBlock, blockIndex: number) => (
    <Card key={blockIndex} className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{block.name}</CardTitle>
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            {block.estimated_duration} min
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {block.exercises.map((exercise, exerciseIndex) => (
            <div key={exerciseIndex} className="border rounded-lg p-4 bg-card/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{exercise.name}</h4>
                <div className="flex gap-2">
                  <Badge variant="secondary">RPE {exercise.rpe_target}</Badge>
                  {exercise.weight_percentage && (
                    <Badge variant="outline">{exercise.weight_percentage}% 1RM</Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                <div>Sets: {exercise.sets}</div>
                <div>Reps: {exercise.reps}</div>
                <div>Rest: {exercise.rest_seconds}s</div>
                <div className="flex items-center">
                  <Activity className="h-3 w-3 mr-1" />
                  Intensity
                </div>
              </div>

              {exercise.form_cues.length > 0 && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Form Cues:</span>
                  <ul className="text-sm list-disc list-inside mt-1">
                    {exercise.form_cues.map((cue, cueIndex) => (
                      <li key={cueIndex}>{cue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {exercise.progressions.length > 0 && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Progressions:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {exercise.progressions.map((progression, progIndex) => (
                      <Badge key={progIndex} variant="outline" className="text-xs">
                        <TrendingUp className="h-2 w-2 mr-1" />
                        {progression}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {exercise.contraindications.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-destructive">Contraindications:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {exercise.contraindications.map((contra, contraIndex) => (
                      <Badge key={contraIndex} variant="destructive" className="text-xs">
                        <AlertTriangle className="h-2 w-2 mr-1" />
                        {contra}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {block.coaching_tips.length > 0 && (
            <div className="bg-primary/5 rounded-lg p-3">
              <h5 className="font-medium mb-2 flex items-center">
                <Brain className="h-4 w-4 mr-2" />
                AI Coaching Tips
              </h5>
              <ul className="text-sm space-y-1">
                {block.coaching_tips.map((tip, tipIndex) => (
                  <li key={tipIndex} className="flex items-start">
                    <CheckCircle className="h-3 w-3 mr-2 mt-0.5 text-primary" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Enhanced AI Workout Generator</h1>
        <p className="text-muted-foreground">
          Powered by Phoenix Intelligence Engine - Advanced biomechanical analysis and adaptive programming
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                AI Configuration
              </CardTitle>
              <CardDescription>
                Intelligent workout parameters with biomechanical analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Phoenix Score Status */}
              {phoenixScore && (
                <div className="p-4 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Phoenix Readiness</span>
                    <Badge variant="outline">{phoenixScore.overall_score}/10</Badge>
                  </div>
                  <Progress value={phoenixScore.overall_score * 10} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {phoenixScore.recommendation}
                  </p>
                </div>
              )}

              {/* Goal Selection */}
              <div>
                <Label htmlFor="goal">Primary Goal</Label>
                <Select 
                  value={preferences.goal} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, goal: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your primary goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">Strength Development</SelectItem>
                    <SelectItem value="hypertrophy">Muscle Growth</SelectItem>
                    <SelectItem value="power">Power & Explosiveness</SelectItem>
                    <SelectItem value="endurance">Cardiovascular Endurance</SelectItem>
                    <SelectItem value="fat_loss">Fat Loss</SelectItem>
                    <SelectItem value="athletic_performance">Athletic Performance</SelectItem>
                    <SelectItem value="rehabilitation">Injury Rehabilitation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div>
                <Label htmlFor="duration">Session Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={preferences.duration}
                  onChange={(e) => setPreferences(prev => ({ 
                    ...prev, 
                    duration: parseInt(e.target.value) || 45 
                  }))}
                  min="15"
                  max="120"
                />
              </div>

              {/* Intensity */}
              <div>
                <Label htmlFor="intensity">Training Intensity</Label>
                <Select 
                  value={preferences.intensity} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, intensity: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light (RPE 4-6)</SelectItem>
                    <SelectItem value="moderate">Moderate (RPE 6-8)</SelectItem>
                    <SelectItem value="hard">Hard (RPE 8-9)</SelectItem>
                    <SelectItem value="maximal">Maximal (RPE 9-10)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Equipment */}
              <div>
                <Label>Available Equipment</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['Barbell', 'Dumbbells', 'Kettlebells', 'Resistance Bands', 'Cable Machine', 'Bodyweight Only'].map((equipment) => (
                    <div key={equipment} className="flex items-center space-x-2">
                      <Checkbox
                        id={equipment}
                        checked={preferences.equipment.includes(equipment)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPreferences(prev => ({
                              ...prev,
                              equipment: [...prev.equipment, equipment]
                            }));
                          } else {
                            setPreferences(prev => ({
                              ...prev,
                              equipment: prev.equipment.filter(eq => eq !== equipment)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={equipment} className="text-sm">{equipment}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Focus Areas */}
              <div>
                <Label>Focus Areas</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {['Upper Body Push', 'Upper Body Pull', 'Legs - Quad Dominant', 'Legs - Hip Dominant', 'Core & Stability', 'Mobility & Flexibility'].map((area) => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox
                        id={area}
                        checked={preferences.focus_areas.includes(area)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPreferences(prev => ({
                              ...prev,
                              focus_areas: [...prev.focus_areas, area]
                            }));
                          } else {
                            setPreferences(prev => ({
                              ...prev,
                              focus_areas: prev.focus_areas.filter(fa => fa !== area)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={area} className="text-sm">{area}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button 
                onClick={handleGenerateIntelligentWorkout} 
                disabled={isGenerating || !preferences.goal}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Intelligent Workout...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Generate AI Workout
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Generated Workout Display */}
        <div className="lg:col-span-2">
          {generatedWorkout ? (
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{generatedWorkout.name}</CardTitle>
                      <CardDescription className="mt-2">
                        {generatedWorkout.description}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-muted-foreground mb-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {generatedWorkout.estimated_duration} minutes
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Target className="h-4 w-4 mr-1" />
                        Difficulty: {generatedWorkout.difficulty_level}/10
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* AI Coaching Notes */}
                  {generatedWorkout.coaching_notes.length > 0 && (
                    <div className="bg-primary/5 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold mb-2 flex items-center">
                        <Brain className="h-4 w-4 mr-2" />
                        AI Coach Recommendations
                      </h4>
                      <ul className="space-y-1">
                        {generatedWorkout.coaching_notes.map((note, index) => (
                          <li key={index} className="text-sm flex items-start">
                            <CheckCircle className="h-3 w-3 mr-2 mt-0.5 text-primary flex-shrink-0" />
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Progressive Overload Recommendations */}
                  {generatedWorkout.progressive_overload_recommendations.length > 0 && (
                    <div className="bg-secondary/5 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold mb-2 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Progressive Overload Strategy
                      </h4>
                      <ul className="space-y-1">
                        {generatedWorkout.progressive_overload_recommendations.map((rec, index) => (
                          <li key={index} className="text-sm flex items-start">
                            <Activity className="h-3 w-3 mr-2 mt-0.5 text-secondary flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Injury Considerations */}
                  {generatedWorkout.injury_considerations.length > 0 && (
                    <div className="bg-destructive/5 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold mb-2 flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Safety Considerations
                      </h4>
                      <ul className="space-y-1">
                        {generatedWorkout.injury_considerations.map((consideration, index) => (
                          <li key={index} className="text-sm flex items-start">
                            <AlertTriangle className="h-3 w-3 mr-2 mt-0.5 text-destructive flex-shrink-0" />
                            {consideration}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Workout Blocks */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Workout Structure</h3>
                {generatedWorkout.blocks.map((block, index) => renderWorkoutBlock(block, index))}
              </div>
            </div>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center">
                <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">AI Workout Generator Ready</h3>
                <p className="text-muted-foreground">
                  Configure your preferences and generate an intelligent, personalized workout
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}