import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Zap, 
  Clock, 
  Target, 
  Dumbbell, 
  Users, 
  Star,
  Play,
  Save,
  RefreshCw,
  Heart,
  Flame,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Brain,
  Activity,
  Timer,
  Gauge,
  TrendingUp,
  Shield,
  Settings
} from "lucide-react";

interface WorkoutBlock {
  name: string;
  order: number;
  exercises: ExerciseWithParams[];
  rounds?: number;
  rest_between_rounds_seconds?: number;
}

interface ExerciseWithParams {
  id: string;
  name: string;
  description?: string;
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
  muscle_group_primary?: string;
  equipment_required?: string[];
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

interface WorkoutPreferences {
  goal: string;
  fitnessLevel: string;
  duration: number;
  workoutType: string;
  equipment: string[];
  muscleGroups: string[];
  customInstructions: string;
}

export function AIWorkoutGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [phoenixScore, setPhoenixScore] = useState<number>(75);
  const [isAdapting, setIsAdapting] = useState(false);
  const [currentExerciseRPE, setCurrentExerciseRPE] = useState<{[key: string]: number}>({});
  const [workoutArchetypes, setWorkoutArchetypes] = useState<any[]>([]);
  
  const [preferences, setPreferences] = useState<WorkoutPreferences>({
    goal: 'build_muscle',
    fitnessLevel: 'intermediate',
    duration: 45,
    workoutType: 'full_body',
    equipment: [],
    muscleGroups: [],
    customInstructions: ''
  });

  const equipmentOptions = [
    { id: 'barbell', label: 'Barbell', icon: '🏋️' },
    { id: 'dumbbell', label: 'Dumbbells', icon: '💪' },
    { id: 'kettlebell', label: 'Kettlebells', icon: '⚡' },
    { id: 'resistance_bands', label: 'Resistance Bands', icon: '🔗' },
    { id: 'pull_up_bar', label: 'Pull-up Bar', icon: '🏃' },
    { id: 'bench', label: 'Bench', icon: '🪑' },
    { id: 'cable_machine', label: 'Cable Machine', icon: '🎭' },
    { id: 'treadmill', label: 'Treadmill', icon: '🏃‍♂️' },
    { id: 'rowing_machine', label: 'Rowing Machine', icon: '🚣' },
    { id: 'bodyweight', label: 'Bodyweight Only', icon: '🧘' }
  ];

  const muscleGroupOptions = [
    { id: 'chest', label: 'Chest', icon: '💪' },
    { id: 'back', label: 'Back', icon: '🦵' },
    { id: 'shoulders', label: 'Shoulders', icon: '👐' },
    { id: 'arms', label: 'Arms', icon: '💪' },
    { id: 'legs', label: 'Legs', icon: '🦵' },
    { id: 'glutes', label: 'Glutes', icon: '🍑' },
    { id: 'core', label: 'Core', icon: '🔥' },
    { id: 'full_body', label: 'Full Body', icon: '🏃‍♂️' }
  ];

  // Load user profile and Phoenix Score on mount
  useEffect(() => {
    if (user) {
      loadUserData();
      loadWorkoutArchetypes();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Load user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profile) {
        setUserProfile(profile);
        setPreferences(prev => ({
          ...prev,
          goal: profile.primary_goal || 'build_muscle',
          fitnessLevel: profile.fitness_level || 'intermediate',
          duration: profile.preferred_workout_duration || 45,
          equipment: Array.isArray(profile.available_equipment) ? profile.available_equipment.map(item => String(item)) : []
        }));
      }

      // Load latest Phoenix Score
      const { data: score } = await supabase
        .from('phoenix_scores')
        .select('overall_score')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (score) {
        setPhoenixScore(score.overall_score);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadWorkoutArchetypes = async () => {
    try {
      const { data: archetypes } = await supabase
        .from('workout_archetypes')
        .select('*')
        .order('name');

      if (archetypes) {
        setWorkoutArchetypes(archetypes);
      }
    } catch (error) {
      console.error('Error loading workout archetypes:', error);
    }
  };

  const handleGenerateWorkout = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate workouts.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Call the Phoenix Workout Engine
      const { data, error } = await supabase.functions.invoke('phoenix-workout-engine', {
        body: {
          action: 'generate',
          userProfile: userProfile ? {
            ...userProfile,
            primary_goal: preferences.goal,
            fitness_level: preferences.fitnessLevel,
            preferred_workout_duration: preferences.duration,
            available_equipment: preferences.equipment,
            phoenix_score: phoenixScore
          } : null
        }
      });

      if (error) throw error;

      setGeneratedWorkout(data);
      setGenerationId(data.id);

      toast({
        title: "🔥 Phoenix Workout Generated!",
        description: "Your AI-powered workout is ready. Let's unlock your potential!"
      });

    } catch (error) {
      console.error('Error generating workout:', error);
      toast({
        title: "Generation Failed",
        description: "Sorry, there was an error generating your workout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAdaptWorkout = async (exerciseId: string, feedback: any) => {
    if (!generatedWorkout) return;

    setIsAdapting(true);
    try {
      const { data, error } = await supabase.functions.invoke('phoenix-workout-engine', {
        body: {
          action: 'adapt',
          currentWorkout: generatedWorkout,
          feedback: {
            exerciseId,
            ...feedback
          }
        }
      });

      if (error) throw error;

      setGeneratedWorkout(data);
      
      toast({
        title: "🎯 Workout Adapted!",
        description: "Your workout has been personalized based on your feedback."
      });

    } catch (error) {
      console.error('Error adapting workout:', error);
      toast({
        title: "Adaptation Failed",
        description: "There was an error adapting your workout.",
        variant: "destructive"
      });
    } finally {
      setIsAdapting(false);
    }
  };

  const handleRPEFeedback = (exerciseId: string, rpe: number) => {
    setCurrentExerciseRPE(prev => ({ ...prev, [exerciseId]: rpe }));
    
    if (rpe >= 9) {
      handleAdaptWorkout(exerciseId, { rpe });
    }
  };

  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      equipment: checked 
        ? [...prev.equipment, equipment]
        : prev.equipment.filter(e => e !== equipment)
    }));
  };

  const handleMuscleGroupChange = (muscleGroup: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      muscleGroups: checked 
        ? [...prev.muscleGroups, muscleGroup]
        : prev.muscleGroups.filter(m => m !== muscleGroup)
    }));
  };

  const handleFeedback = async (rating: number) => {
    if (!generationId) return;

    try {
      const { error } = await supabase
        .from('workout_generations')
        .update({ 
          user_feedback: { rating, timestamp: new Date().toISOString() }
        })
        .eq('id', generationId);

      if (error) throw error;

      setFeedbackRating(rating);
      toast({
        title: "Feedback Received! 🙏",
        description: "Thank you! Phoenix learns from every rating to improve future workouts."
      });

    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Feedback Failed",
        description: "There was an error submitting your feedback.",
        variant: "destructive"
      });
    }
  };

  const handleSaveWorkout = async () => {
    if (!generatedWorkout || !user) return;

    try {
      // Create workout template from Phoenix generated workout
      const { data: template, error: templateError } = await supabase
        .from('workout_programs')
        .insert({
          name: generatedWorkout.name,
          description: generatedWorkout.description,
          duration_weeks: 1,
          workouts_per_week: 1,
          difficulty_level: preferences.fitnessLevel,
          goal: preferences.goal,
          created_by: user.id,
          equipment_required: preferences.equipment
        })
        .select()
        .single();

      if (templateError) throw templateError;

      toast({
        title: "🎉 Workout Saved!",
        description: "Your Phoenix workout has been saved to your programs."
      });

    } catch (error) {
      console.error('Error saving workout:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your workout.",
        variant: "destructive"
      });
    }
  };

  const startWorkoutSession = () => {
    // Navigate to workout session with generated workout data
    // This would typically use React Router to navigate
    toast({
      title: "🚀 Starting Workout Session!",
      description: "Ready to train? Let's make it count!"
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-gradient-to-br from-orange-100 to-red-100">
            <Brain className="h-12 w-12 text-orange-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Phoenix AI Workout Generator
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Advanced AI that adapts in real-time to create your perfect workout experience
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Preferences Panel */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-500" />
              Workout Configuration
            </CardTitle>
            <CardDescription>
              Configure your preferences for the Phoenix Engine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Phoenix Score Display */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <Flame className="h-5 w-5 text-orange-600" />
                  <span className="font-semibold text-orange-800">Phoenix Readiness Score</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={phoenixScore} className="flex-1" />
                  <span className="font-bold text-2xl text-orange-700">{phoenixScore}</span>
                </div>
                <p className="text-sm text-orange-600 mt-1">
                  {phoenixScore >= 80 ? "🔥 Peak performance day!" : 
                   phoenixScore >= 60 ? "💪 Good energy for training" : 
                   "🧘 Consider active recovery"}
                </p>
              </div>

              <div>
                <Label htmlFor="goal">Primary Goal</Label>
                <Select value={preferences.goal} onValueChange={(value) => setPreferences({...preferences, goal: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your primary goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose_weight">Lose Weight</SelectItem>
                    <SelectItem value="build_muscle">Build Muscle</SelectItem>
                    <SelectItem value="improve_endurance">Improve Endurance</SelectItem>
                    <SelectItem value="increase_strength">Increase Strength</SelectItem>
                    <SelectItem value="general_fitness">General Fitness</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fitnessLevel">Fitness Level</Label>
                <Select value={preferences.fitnessLevel} onValueChange={(value) => setPreferences({...preferences, fitnessLevel: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your fitness level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    max="120"
                    value={preferences.duration}
                    onChange={(e) => setPreferences({...preferences, duration: parseInt(e.target.value) || 45})}
                  />
                </div>
                <div>
                  <Label htmlFor="workoutType">Workout Style</Label>
                  <Select value={preferences.workoutType} onValueChange={(value) => setPreferences({...preferences, workoutType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_body">Full Body</SelectItem>
                      <SelectItem value="upper_lower">Upper/Lower Split</SelectItem>
                      <SelectItem value="push_pull_legs">Push/Pull/Legs</SelectItem>
                      <SelectItem value="circuit">Circuit Training</SelectItem>
                      <SelectItem value="hiit">HIIT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Equipment Selection */}
              <div>
                <Label className="text-base font-semibold">Available Equipment</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {equipmentOptions.map((equipment) => (
                    <div key={equipment.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={equipment.id}
                        checked={preferences.equipment.includes(equipment.id)}
                        onCheckedChange={(checked) => handleEquipmentChange(equipment.id, checked as boolean)}
                      />
                      <Label htmlFor={equipment.id} className="text-sm">
                        {equipment.icon} {equipment.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Muscle Group Focus */}
              <div>
                <Label className="text-base font-semibold">Focus Areas (Optional)</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {muscleGroupOptions.map((group) => (
                    <div key={group.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={group.id}
                        checked={preferences.muscleGroups.includes(group.id)}
                        onCheckedChange={(checked) => handleMuscleGroupChange(group.id, checked as boolean)}
                      />
                      <Label htmlFor={group.id} className="text-sm">
                        {group.icon} {group.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Instructions */}
              <div>
                <Label htmlFor="customInstructions">Special Instructions</Label>
                <Textarea
                  id="customInstructions"
                  placeholder="Any injuries, preferences, or special requests..."
                  value={preferences.customInstructions}
                  onChange={(e) => setPreferences({...preferences, customInstructions: e.target.value})}
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleGenerateWorkout} 
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Phoenix Engine Generating...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Generate Phoenix Workout
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated Workout Display */}
        <div className="space-y-6">
          {!generatedWorkout ? (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Zap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Ready to Generate Your Workout</h3>
                <p className="text-muted-foreground">
                  Configure your preferences and let Phoenix create your perfect workout
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-orange-500" />
                      {generatedWorkout.name}
                    </CardTitle>
                    <CardDescription>{generatedWorkout.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      <Clock className="mr-1 h-3 w-3" />
                      {generatedWorkout.estimated_duration_minutes} min
                    </Badge>
                    <Badge variant="outline">
                      <Gauge className="mr-1 h-3 w-3" />
                      {generatedWorkout.difficulty_rating}/10
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="workout" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="workout">Workout</TabsTrigger>
                    <TabsTrigger value="coaching">Coach AI</TabsTrigger>
                    <TabsTrigger value="metrics">Metrics</TabsTrigger>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="workout" className="space-y-6">
                    {generatedWorkout.blocks.map((block, blockIndex) => (
                      <div key={blockIndex}>
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-lg font-semibold text-orange-700">{block.name}</h3>
                          {block.rounds && block.rounds > 1 && (
                            <Badge variant="secondary">
                              {block.rounds} rounds
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          {block.exercises.map((exercise, exerciseIndex) => (
                            <div key={exercise.id} className="p-4 border rounded-lg bg-gray-50">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <h4 className="font-medium flex items-center gap-2">
                                    {exercise.name}
                                    {exercise.superset_group && (
                                      <Badge variant="outline" className="text-xs">
                                        Superset {exercise.superset_group}
                                      </Badge>
                                    )}
                                  </h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {exercise.description}
                                  </p>
                                  {exercise.muscle_group_primary && (
                                    <p className="text-xs text-blue-600 mt-1">
                                      Target: {exercise.muscle_group_primary}
                                    </p>
                                  )}
                                </div>
                                
                                <div className="text-right text-sm ml-4">
                                  {exercise.duration_seconds ? (
                                    <div>
                                      <span className="font-medium block">{Math.round(exercise.duration_seconds / 60)}:{(exercise.duration_seconds % 60).toString().padStart(2, '0')}</span>
                                      {exercise.rest_seconds && (
                                        <span className="text-muted-foreground text-xs">Rest: {exercise.rest_seconds}s</span>
                                      )}
                                    </div>
                                  ) : (
                                    <div>
                                      <span className="font-medium block">
                                        {exercise.sets} × {exercise.reps || `${exercise.reps_min}-${exercise.reps_max}`}
                                      </span>
                                      {exercise.weight_kg && (
                                        <span className="text-blue-600 text-xs block">{exercise.weight_kg}kg</span>
                                      )}
                                      {exercise.rest_seconds && (
                                        <span className="text-muted-foreground text-xs">Rest: {exercise.rest_seconds}s</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Real-time feedback controls */}
                              <div className="flex items-center gap-2 mt-3 pt-2 border-t">
                                <span className="text-xs text-muted-foreground">RPE (1-10):</span>
                                <div className="flex gap-1">
                                  {[6, 7, 8, 9, 10].map(rpe => (
                                    <Button
                                      key={rpe}
                                      size="sm"
                                      variant={currentExerciseRPE[exercise.id] === rpe ? "default" : "outline"}
                                      className="w-8 h-8 p-0 text-xs"
                                      onClick={() => handleRPEFeedback(exercise.id, rpe)}
                                    >
                                      {rpe}
                                    </Button>
                                  ))}
                                </div>
                                
                                {currentExerciseRPE[exercise.id] >= 9 && (
                                  <div className="flex gap-2 ml-auto">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs"
                                      onClick={() => handleAdaptWorkout(exercise.id, { pain_signal: "discomfort" })}
                                      disabled={isAdapting}
                                    >
                                      {isAdapting ? "Adapting..." : "Too Hard"}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {block.rest_between_rounds_seconds && block.rounds && block.rounds > 1 && (
                          <div className="text-center py-2 text-sm text-muted-foreground">
                            <Timer className="inline mr-1 h-3 w-3" />
                            Rest {block.rest_between_rounds_seconds}s between rounds
                          </div>
                        )}
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="coaching" className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                      <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Phoenix AI Coach:
                      </h3>
                      <p className="text-orange-700 leading-relaxed whitespace-pre-line">
                        {generatedWorkout.coachNotes}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-800 mb-1 flex items-center gap-1">
                          <Activity className="h-4 w-4" />
                          Metabolic Focus
                        </h4>
                        <div className="flex items-center gap-2">
                          <Progress value={generatedWorkout.metabolic_score} className="flex-1" />
                          <span className="text-sm font-medium">{generatedWorkout.metabolic_score}%</span>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <h4 className="font-medium text-purple-800 mb-1 flex items-center gap-1">
                          <Dumbbell className="h-4 w-4" />
                          Strength Focus
                        </h4>
                        <div className="flex items-center gap-2">
                          <Progress value={generatedWorkout.strength_score} className="flex-1" />
                          <span className="text-sm font-medium">{generatedWorkout.strength_score}%</span>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-800 mb-1 flex items-center gap-1">
                          <Gauge className="h-4 w-4" />
                          Difficulty
                        </h4>
                        <div className="flex items-center gap-2">
                          <Progress value={generatedWorkout.difficulty_rating * 10} className="flex-1" />
                          <span className="text-sm font-medium">{generatedWorkout.difficulty_rating}/10</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-medium text-yellow-800 mb-2">🎯 Real-Time Adaptation</h4>
                      <p className="text-sm text-yellow-700">
                        This workout adapts to your feedback in real-time. Use the RPE scales during exercises to automatically adjust intensity. Phoenix AI learns from every session to make your next workout even better.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="metrics" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <Clock className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                        <div className="text-2xl font-bold text-orange-700">{generatedWorkout.estimated_duration_minutes}</div>
                        <div className="text-sm text-orange-600">Minutes</div>
                      </div>
                      
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <Target className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl font-bold text-blue-700">{generatedWorkout.blocks.length}</div>
                        <div className="text-sm text-blue-600">Blocks</div>
                      </div>
                      
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Dumbbell className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                        <div className="text-2xl font-bold text-purple-700">
                          {generatedWorkout.blocks.reduce((sum, block) => sum + block.exercises.length, 0)}
                        </div>
                        <div className="text-sm text-purple-600">Exercises</div>
                      </div>
                      
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <Gauge className="h-6 w-6 mx-auto mb-2 text-red-600" />
                        <div className="text-2xl font-bold text-red-700">{generatedWorkout.difficulty_rating}</div>
                        <div className="text-sm text-red-600">Difficulty</div>
                      </div>
                    </div>

                    {/* Workout Archetype Info */}
                    {workoutArchetypes.find(a => a.id === generatedWorkout.archetype_id) && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Workout Archetype</h4>
                        <p className="text-sm text-muted-foreground">
                          {workoutArchetypes.find(a => a.id === generatedWorkout.archetype_id)?.description}
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="actions" className="space-y-4">
                    <div className="grid gap-4">
                      <Button 
                        onClick={startWorkoutSession} 
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="lg"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Start Workout Session
                      </Button>
                      
                      <Button 
                        onClick={handleSaveWorkout} 
                        variant="outline"
                        className="w-full"
                        size="lg"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save to My Programs
                      </Button>
                      
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3">Rate This Workout</h4>
                        <div className="flex gap-2 justify-center">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <Button
                              key={rating}
                              variant={feedbackRating === rating ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleFeedback(rating)}
                              className="w-12 h-12"
                            >
                              <Star className={`h-4 w-4 ${feedbackRating === rating ? 'fill-current' : ''}`} />
                            </Button>
                          ))}
                        </div>
                        {feedbackRating && (
                          <p className="text-center text-sm text-muted-foreground mt-2">
                            Thanks for rating! Phoenix learns from your feedback.
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}