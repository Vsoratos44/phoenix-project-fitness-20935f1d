/**
 * AI Workout Generator Component
 * 
 * Provides an interface for users to generate personalized workouts using AI.
 * Integrates with OpenAI to create customized workout routines based on user preferences.
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Brain, 
  Clock, 
  Target, 
  Dumbbell, 
  Zap,
  Star,
  Timer,
  Users,
  CheckCircle,
  Loader2
} from "lucide-react";

interface GeneratedWorkout {
  name: string;
  description: string;
  estimated_duration: number;
  difficulty_level: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: string;
    rest_seconds: number;
    notes: string;
    order_index: number;
    is_superset: boolean;
    superset_group: number | null;
  }>;
  warmup: string[];
  cooldown: string[];
  coaching_notes: string;
}

interface WorkoutPreferences {
  goal: string;
  duration_minutes: number;
  equipment_available: string[];
  fitness_level: string;
  muscle_groups_focus: string[];
  workout_type: string;
  custom_prompt: string;
}

export function AIWorkoutGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);
  const [preferences, setPreferences] = useState<WorkoutPreferences>({
    goal: '',
    duration_minutes: 45,
    equipment_available: [],
    fitness_level: '',
    muscle_groups_focus: [],
    workout_type: 'strength',
    custom_prompt: ''
  });
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);

  const { toast } = useToast();
  const { user } = useAuth();

  const equipmentOptions = [
    'barbell', 'dumbbell', 'kettlebell', 'resistance_band', 'pull_up_bar',
    'bench', 'cable_machine', 'treadmill', 'rowing_machine', 'bodyweight_only'
  ];

  const muscleGroupOptions = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'glutes', 'abs', 'calves'
  ];

  const handleGenerateWorkout = async () => {
    // Remove authentication requirement for demo purposes - add sample data instead
    if (!preferences.goal || !preferences.fitness_level) {
      toast({
        title: "Missing Information",
        description: "Please select your goal and fitness level.",
        variant: "destructive",
      });
      return;
    }


    setIsGenerating(true);
    setGenerationId(Date.now().toString());

    try {
      // Simulate API call with sample workout data based on preferences
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      const sampleWorkouts = {
        lose_weight: {
          name: "Fat Burning HIIT Circuit",
          description: "High-intensity workout designed to maximize calorie burn and boost metabolism",
          estimated_duration: 35,
          difficulty_level: preferences.fitness_level,
          exercises: [
            { name: "Burpees", sets: 4, reps: "12", rest_seconds: 45, notes: "Explosive movement, maintain form", order_index: 1, is_superset: false, superset_group: null },
            { name: "Mountain Climbers", sets: 4, reps: "20", rest_seconds: 30, notes: "Keep core tight", order_index: 2, is_superset: false, superset_group: null },
            { name: "Jump Squats", sets: 3, reps: "15", rest_seconds: 60, notes: "Land softly", order_index: 3, is_superset: false, superset_group: null },
            { name: "High Knees", sets: 3, reps: "30 sec", rest_seconds: 30, notes: "Quick feet", order_index: 4, is_superset: false, superset_group: null },
            { name: "Plank Jacks", sets: 3, reps: "15", rest_seconds: 45, notes: "Maintain plank position", order_index: 5, is_superset: false, superset_group: null }
          ],
          warmup: ["Arm Circles", "Leg Swings", "Light Jogging"],
          cooldown: ["Walking", "Deep Breathing", "Stretching"],
          coaching_notes: "Focus on intensity over perfection. Keep heart rate elevated between exercises for maximum fat burning effect."
        },
        gain_muscle: {
          name: "Hypertrophy Upper Body",
          description: "Muscle-building workout targeting upper body growth with progressive overload",
          estimated_duration: 55,
          difficulty_level: preferences.fitness_level,
          exercises: [
            { name: "Bench Press", sets: 4, reps: "8-10", rest_seconds: 90, notes: "Control the eccentric phase", order_index: 1, is_superset: false, superset_group: null },
            { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest_seconds: 75, notes: "Focus on chest squeeze", order_index: 2, is_superset: false, superset_group: null },
            { name: "Bent-Over Rows", sets: 4, reps: "8-10", rest_seconds: 90, notes: "Squeeze shoulder blades", order_index: 3, is_superset: false, superset_group: null },
            { name: "Overhead Press", sets: 3, reps: "8-10", rest_seconds: 90, notes: "Keep core engaged", order_index: 4, is_superset: false, superset_group: null },
            { name: "Bicep Curls", sets: 3, reps: "12-15", rest_seconds: 60, notes: "Slow and controlled", order_index: 5, is_superset: false, superset_group: null },
            { name: "Tricep Dips", sets: 3, reps: "10-12", rest_seconds: 60, notes: "Full range of motion", order_index: 6, is_superset: false, superset_group: null }
          ],
          warmup: ["Arm Circles", "Band Pull-Aparts", "Light Shoulder Press"],
          cooldown: ["Chest Stretch", "Shoulder Stretch", "Deep Breathing"],
          coaching_notes: "Focus on progressive overload. Add weight when you can complete all sets with perfect form. Time under tension is key for hypertrophy."
        },
        get_stronger: {
          name: "Strength Building Session",
          description: "Powerlifting-focused workout for maximum strength development",
          estimated_duration: 65,
          difficulty_level: preferences.fitness_level,
          exercises: [
            { name: "Deadlift", sets: 5, reps: "3-5", rest_seconds: 180, notes: "Focus on hip hinge pattern", order_index: 1, is_superset: false, superset_group: null },
            { name: "Back Squat", sets: 4, reps: "5", rest_seconds: 180, notes: "Depth and drive through heels", order_index: 2, is_superset: false, superset_group: null },
            { name: "Bench Press", sets: 4, reps: "5", rest_seconds: 150, notes: "Pause at chest, explosive up", order_index: 3, is_superset: false, superset_group: null },
            { name: "Overhead Press", sets: 3, reps: "5", rest_seconds: 120, notes: "Full body tension", order_index: 4, is_superset: false, superset_group: null },
            { name: "Barbell Rows", sets: 3, reps: "6-8", rest_seconds: 120, notes: "Pull to sternum", order_index: 5, is_superset: false, superset_group: null }
          ],
          warmup: ["Dynamic Warm-up", "Empty Bar Practice", "Mobility Work"],
          cooldown: ["Light Walking", "Hip Flexor Stretch", "Thoracic Spine Mobility"],
          coaching_notes: "Work at 80-85% 1RM. Focus on perfect technique. Rest is crucial for strength gains. Track your lifts for progressive overload."
        },
        improve_endurance: {
          name: "Cardiovascular Endurance Circuit",
          description: "Endurance-focused workout to improve aerobic capacity and stamina",
          estimated_duration: 40,
          difficulty_level: preferences.fitness_level,
          exercises: [
            { name: "Jumping Jacks", sets: 5, reps: "45 sec", rest_seconds: 15, notes: "Maintain steady rhythm", order_index: 1, is_superset: false, superset_group: null },
            { name: "Running in Place", sets: 4, reps: "60 sec", rest_seconds: 30, notes: "Keep knees high", order_index: 2, is_superset: false, superset_group: null },
            { name: "Step-Ups", sets: 4, reps: "20 each leg", rest_seconds: 45, notes: "Control the descent", order_index: 3, is_superset: false, superset_group: null },
            { name: "Bicycle Crunches", sets: 3, reps: "30 each side", rest_seconds: 30, notes: "Slow and controlled", order_index: 4, is_superset: false, superset_group: null }
          ],
          warmup: ["Light Cardio", "Dynamic Stretching", "Joint Mobility"],
          cooldown: ["Slow Walk", "Static Stretching", "Deep Breathing"],
          coaching_notes: "Focus on maintaining consistent effort throughout. Build endurance gradually - it's about time under tension."
        },
        general_fitness: {
          name: "Full Body Functional Workout",
          description: "Balanced workout combining strength, cardio, and mobility for overall fitness",
          estimated_duration: 45,
          difficulty_level: preferences.fitness_level,
          exercises: [
            { name: "Bodyweight Squats", sets: 3, reps: "15", rest_seconds: 60, notes: "Full range of motion", order_index: 1, is_superset: false, superset_group: null },
            { name: "Push-Ups", sets: 3, reps: "10-12", rest_seconds: 60, notes: "Modify on knees if needed", order_index: 2, is_superset: false, superset_group: null },
            { name: "Lunges", sets: 3, reps: "12 each leg", rest_seconds: 60, notes: "Step back to starting position", order_index: 3, is_superset: false, superset_group: null },
            { name: "Plank", sets: 3, reps: "30-45 sec", rest_seconds: 60, notes: "Keep body straight", order_index: 4, is_superset: false, superset_group: null },
            { name: "Jumping Jacks", sets: 3, reps: "20", rest_seconds: 45, notes: "Coordinate arms and legs", order_index: 5, is_superset: false, superset_group: null }
          ],
          warmup: ["Light Movement", "Joint Circles", "Gentle Stretching"],
          cooldown: ["Walking", "Full Body Stretch", "Relaxation"],
          coaching_notes: "Perfect for building a foundation. Focus on form over speed. Progress gradually as you get stronger."
        }
      };

      const selectedWorkout = sampleWorkouts[preferences.goal as keyof typeof sampleWorkouts] || sampleWorkouts.general_fitness;
      setGeneratedWorkout(selectedWorkout);

      toast({
        title: "Workout Generated!",
        description: `Created a ${selectedWorkout.estimated_duration}-minute ${selectedWorkout.name} for you.`,
      });

    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate workout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      equipment_available: checked 
        ? [...prev.equipment_available, equipment]
        : prev.equipment_available.filter(e => e !== equipment)
    }));
  };

  const handleMuscleGroupChange = (muscleGroup: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      muscle_groups_focus: checked 
        ? [...prev.muscle_groups_focus, muscleGroup]
        : prev.muscle_groups_focus.filter(m => m !== muscleGroup)
    }));
  };

  const handleFeedback = async (rating: number) => {
    if (!generationId) return;

    try {
      const { error } = await supabase
        .from('ai_workout_generations')
        .update({ feedback_rating: rating })
        .eq('id', generationId);

      if (error) throw error;

      setFeedbackRating(rating);
      toast({
        title: "Feedback Submitted",
        description: "Thanks for rating this workout!",
      });

    } catch (error: any) {
      toast({
        title: "Feedback Failed",
        description: "Failed to submit feedback.",
        variant: "destructive",
      });
    }
  };

  const handleSaveWorkout = async () => {
    if (!generatedWorkout || !user) return;

    try {
      // Create a workout template from the AI generated workout
      const { data: template, error: templateError } = await supabase
        .from('workout_templates')
        .insert({
          name: generatedWorkout.name,
          description: generatedWorkout.description,
          estimated_duration: generatedWorkout.estimated_duration,
          total_exercises: generatedWorkout.exercises.length
        })
        .select()
        .single();

      if (templateError) throw templateError;

      // Add exercises to the template
      const workoutExercises = await Promise.all(
        generatedWorkout.exercises.map(async (exercise, index) => {
          // Try to find matching exercise in database
          const { data: dbExercise } = await supabase
            .from('exercises')
            .select('id')
            .ilike('name', `%${exercise.name}%`)
            .limit(1)
            .single();

          return {
            workout_template_id: template.id,
            exercise_id: dbExercise?.id || null,
            order_index: index + 1,
            sets: exercise.sets,
            reps: parseInt(exercise.reps) || null,
            rest_seconds: exercise.rest_seconds,
            notes: exercise.notes,
            is_superset: exercise.is_superset,
            superset_group: exercise.superset_group
          };
        })
      );

      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(workoutExercises);

      if (exercisesError) throw exercisesError;

      toast({
        title: "Workout Saved!",
        description: "Your AI-generated workout has been saved to your library.",
      });

    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: "Failed to save workout to your library.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <Brain className="h-8 w-8" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">AI Workout Generator</h1>
        <p className="text-xl text-muted-foreground">
          Create personalized workouts powered by advanced AI coaching
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Preferences Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Workout Preferences
            </CardTitle>
            <CardDescription>
              Tell us about your goals and we'll create the perfect workout
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Goal Selection */}
            <div className="space-y-2">
              <Label htmlFor="goal">Primary Goal</Label>
              <Select 
                value={preferences.goal} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, goal: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your fitness goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose_weight">Lose Weight</SelectItem>
                  <SelectItem value="gain_muscle">Gain Muscle</SelectItem>
                  <SelectItem value="get_stronger">Get Stronger</SelectItem>
                  <SelectItem value="improve_endurance">Improve Endurance</SelectItem>
                  <SelectItem value="general_fitness">General Fitness</SelectItem>
                  <SelectItem value="sport_specific">Sport Specific</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fitness Level */}
            <div className="space-y-2">
              <Label htmlFor="fitness_level">Fitness Level</Label>
              <Select 
                value={preferences.fitness_level} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, fitness_level: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your fitness level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration and Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  max="120"
                  value={preferences.duration_minutes}
                  onChange={(e) => setPreferences(prev => ({ 
                    ...prev, 
                    duration_minutes: parseInt(e.target.value) || 45 
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workout_type">Workout Type</Label>
                <Select 
                  value={preferences.workout_type} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, workout_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">Strength Training</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="hiit">HIIT</SelectItem>
                    <SelectItem value="yoga">Yoga</SelectItem>
                    <SelectItem value="mixed">Mixed Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Equipment Available */}
            <div className="space-y-3">
              <Label>Available Equipment</Label>
              <div className="grid grid-cols-2 gap-2">
                {equipmentOptions.map((equipment) => (
                  <div key={equipment} className="flex items-center space-x-2">
                    <Checkbox
                      id={equipment}
                      checked={preferences.equipment_available.includes(equipment)}
                      onCheckedChange={(checked) => handleEquipmentChange(equipment, checked as boolean)}
                    />
                    <Label htmlFor={equipment} className="text-sm capitalize">
                      {equipment.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Muscle Groups Focus */}
            <div className="space-y-3">
              <Label>Focus Areas (Optional)</Label>
              <div className="grid grid-cols-3 gap-2">
                {muscleGroupOptions.map((muscleGroup) => (
                  <div key={muscleGroup} className="flex items-center space-x-2">
                    <Checkbox
                      id={muscleGroup}
                      checked={preferences.muscle_groups_focus.includes(muscleGroup)}
                      onCheckedChange={(checked) => handleMuscleGroupChange(muscleGroup, checked as boolean)}
                    />
                    <Label htmlFor={muscleGroup} className="text-sm capitalize">
                      {muscleGroup}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Prompt */}
            <div className="space-y-2">
              <Label htmlFor="custom_prompt">Custom Instructions (Optional)</Label>
              <Textarea
                id="custom_prompt"
                placeholder="Any specific requests or modifications you'd like..."
                value={preferences.custom_prompt}
                onChange={(e) => setPreferences(prev => ({ ...prev, custom_prompt: e.target.value }))}
              />
            </div>

            <Button 
              onClick={handleGenerateWorkout} 
              disabled={isGenerating || !preferences.goal || !preferences.fitness_level}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Workout...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate AI Workout
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Workout Display */}
        <div className="space-y-6">
          {generatedWorkout ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Dumbbell className="h-5 w-5" />
                      {generatedWorkout.name}
                    </CardTitle>
                    <CardDescription>{generatedWorkout.description}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {generatedWorkout.estimated_duration}min
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Workout Overview */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    {generatedWorkout.difficulty_level}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {generatedWorkout.exercises.length} exercises
                  </div>
                </div>

                {/* Warm-up */}
                <div>
                  <h4 className="font-semibold mb-2">Warm-up</h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedWorkout.warmup.map((exercise, index) => (
                      <Badge key={index} variant="outline">{exercise}</Badge>
                    ))}
                  </div>
                </div>

                {/* Main Exercises */}
                <div>
                  <h4 className="font-semibold mb-3">Main Workout</h4>
                  <div className="space-y-3">
                    {generatedWorkout.exercises.map((exercise, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{exercise.name}</h5>
                          <Badge variant="outline" className="text-xs">
                            {exercise.sets} × {exercise.reps}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Rest: {exercise.rest_seconds}s
                        </p>
                        {exercise.notes && (
                          <p className="text-sm text-blue-600">{exercise.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cool-down */}
                <div>
                  <h4 className="font-semibold mb-2">Cool-down</h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedWorkout.cooldown.map((exercise, index) => (
                      <Badge key={index} variant="outline">{exercise}</Badge>
                    ))}
                  </div>
                </div>

                {/* Coaching Notes */}
                {generatedWorkout.coaching_notes && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2 text-blue-900">Coach's Notes</h4>
                    <p className="text-sm text-blue-800">{generatedWorkout.coaching_notes}</p>
                  </div>
                )}

                <Separator />

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rate this workout:</span>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFeedback(rating)}
                        className={`p-1 ${feedbackRating === rating ? 'text-yellow-500' : 'text-gray-300'}`}
                      >
                        <Star className="h-4 w-4" fill="currentColor" />
                      </Button>
                    ))}
                  </div>
                  <Button onClick={handleSaveWorkout} variant="outline">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Workout
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Ready to Generate</h3>
                <p className="text-muted-foreground">
                  Fill in your preferences and click "Generate AI Workout" to create your personalized routine
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}