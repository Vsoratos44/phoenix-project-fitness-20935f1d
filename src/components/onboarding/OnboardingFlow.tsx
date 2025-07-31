/**
 * Phoenix Project Fitness - Onboarding Flow
 * 
 * Progressive disclosure approach for capturing user goals, fitness level, 
 * equipment availability, and dietary preferences during the intake interview.
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Target, 
  TrendingUp, 
  Heart, 
  Dumbbell, 
  Clock, 
  Home,
  Utensils,
  CheckCircle,
  ArrowLeft,
  ArrowRight 
} from "lucide-react";

// Define the onboarding steps
const ONBOARDING_STEPS = [
  { id: 'goals', title: 'Your Goals', icon: Target },
  { id: 'fitness_level', title: 'Fitness Level', icon: TrendingUp },
  { id: 'preferences', title: 'Preferences', icon: Heart },
  { id: 'equipment', title: 'Equipment', icon: Dumbbell },
  { id: 'schedule', title: 'Schedule', icon: Clock },
  { id: 'nutrition', title: 'Nutrition', icon: Utensils },
  { id: 'profile', title: 'Profile', icon: Home },
];

// Predefined options for different steps
const FITNESS_GOALS = [
  { id: 'lose_weight', label: 'Lose Weight', icon: '🎯' },
  { id: 'get_fitter_toned', label: 'Get Fitter & Toned', icon: '💪' },
  { id: 'build_muscle', label: 'Build Muscle', icon: '🏋️' },
  { id: 'improve_endurance', label: 'Improve Endurance', icon: '🏃' },
  { id: 'general_fitness', label: 'General Fitness', icon: '✨' },
  { id: 'sport_specific', label: 'Sport-Specific Training', icon: '⚽' },
];

const FITNESS_LEVELS = [
  { id: 'beginner', label: 'Beginner', description: 'New to regular exercise' },
  { id: 'intermediate', label: 'Intermediate', description: 'Exercise 2-3 times per week' },
  { id: 'advanced', label: 'Advanced', description: 'Exercise 4+ times per week' },
];

const EQUIPMENT_OPTIONS = [
  { id: 'bodyweight', label: 'Bodyweight Only', icon: '🤸' },
  { id: 'dumbbells', label: 'Dumbbells', icon: '🏋️' },
  { id: 'resistance_bands', label: 'Resistance Bands', icon: '🎗️' },
  { id: 'kettlebells', label: 'Kettlebells', icon: '⚡' },
  { id: 'barbell', label: 'Barbell & Plates', icon: '🏋️‍♂️' },
  { id: 'gym_access', label: 'Full Gym Access', icon: '🏢' },
  { id: 'cardio_equipment', label: 'Cardio Equipment', icon: '🚴' },
  { id: 'pull_up_bar', label: 'Pull-up Bar', icon: '🎯' },
];

const DIETARY_PREFERENCES = [
  { id: 'none', label: 'No Restrictions', icon: '🍽️' },
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
  { id: 'vegan', label: 'Vegan', icon: '🌱' },
  { id: 'keto', label: 'Keto', icon: '🥑' },
  { id: 'paleo', label: 'Paleo', icon: '🥩' },
  { id: 'mediterranean', label: 'Mediterranean', icon: '🫒' },
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  // Save response and move to next step
  const handleNext = async () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      await completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const updateResponse = (key: string, value: any) => {
    setResponses(prev => ({ ...prev, [key]: value }));
  };

  const saveStepResponse = async (stepKey: string, responseData: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('onboarding_responses')
        .upsert({
          user_id: user.id,
          question_key: stepKey,
          response: responseData,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving onboarding step:', error);
      toast({
        title: "Error",
        description: "Failed to save your response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Update profile with onboarding completion
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_step: ONBOARDING_STEPS.length,
          primary_goal: responses.goals?.[0] || 'general_fitness',
          fitness_level: responses.fitness_level || 'beginner',
          available_equipment: responses.equipment || [],
          dietary_restrictions: responses.nutrition || [],
          preferred_workout_duration: responses.workout_duration || 30,
          workout_frequency_per_week: responses.workout_frequency || 3,
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Welcome to Phoenix Fitness! 🔥",
        description: "Your profile has been set up successfully.",
      });

      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    const StepIcon = currentStepData.icon;

    switch (currentStepData.id) {
      case 'goals':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <StepIcon className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold">What are your fitness goals?</h2>
              <p className="text-muted-foreground">Select all that apply to you</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {FITNESS_GOALS.map((goal) => (
                <Button
                  key={goal.id}
                  variant={responses.goals?.includes(goal.id) ? "default" : "outline"}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => {
                    const currentGoals = responses.goals || [];
                    const updatedGoals = currentGoals.includes(goal.id)
                      ? currentGoals.filter((g: string) => g !== goal.id)
                      : [...currentGoals, goal.id];
                    updateResponse('goals', updatedGoals);
                    saveStepResponse('goals', updatedGoals);
                  }}
                >
                  <span className="text-2xl">{goal.icon}</span>
                  <span className="text-sm text-center">{goal.label}</span>
                </Button>
              ))}
            </div>
          </div>
        );

      case 'fitness_level':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <StepIcon className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold">What's your fitness level?</h2>
              <p className="text-muted-foreground">This helps us create the right program for you</p>
            </div>
            <div className="space-y-3">
              {FITNESS_LEVELS.map((level) => (
                <Card
                  key={level.id}
                  className={`cursor-pointer transition-colors border-2 ${
                    responses.fitness_level === level.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => {
                    updateResponse('fitness_level', level.id);
                    saveStepResponse('fitness_level', level.id);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{level.label}</h3>
                        <p className="text-sm text-muted-foreground">{level.description}</p>
                      </div>
                      {responses.fitness_level === level.id && (
                        <CheckCircle className="h-6 w-6 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'equipment':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <StepIcon className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold">What equipment do you have access to?</h2>
              <p className="text-muted-foreground">We'll personalize your workouts based on your available equipment</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {EQUIPMENT_OPTIONS.map((equipment) => (
                <Button
                  key={equipment.id}
                  variant={responses.equipment?.includes(equipment.id) ? "default" : "outline"}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => {
                    const currentEquipment = responses.equipment || [];
                    const updatedEquipment = currentEquipment.includes(equipment.id)
                      ? currentEquipment.filter((e: string) => e !== equipment.id)
                      : [...currentEquipment, equipment.id];
                    updateResponse('equipment', updatedEquipment);
                    saveStepResponse('equipment', updatedEquipment);
                  }}
                >
                  <span className="text-2xl">{equipment.icon}</span>
                  <span className="text-sm text-center">{equipment.label}</span>
                </Button>
              ))}
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <StepIcon className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold">Let's plan your schedule</h2>
              <p className="text-muted-foreground">Tell us about your workout preferences</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">How many days per week do you want to work out?</Label>
                <div className="flex gap-2 mt-2">
                  {[2, 3, 4, 5, 6, 7].map((days) => (
                    <Button
                      key={days}
                      variant={responses.workout_frequency === days ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        updateResponse('workout_frequency', days);
                        saveStepResponse('schedule', { ...responses, workout_frequency: days });
                      }}
                    >
                      {days}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold">How long should each workout be?</Label>
                <div className="flex gap-2 mt-2">
                  {[15, 30, 45, 60, 90].map((duration) => (
                    <Button
                      key={duration}
                      variant={responses.workout_duration === duration ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        updateResponse('workout_duration', duration);
                        saveStepResponse('schedule', { ...responses, workout_duration: duration });
                      }}
                    >
                      {duration}min
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'nutrition':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <StepIcon className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold">Dietary preferences</h2>
              <p className="text-muted-foreground">Help us suggest the right nutrition plan</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {DIETARY_PREFERENCES.map((diet) => (
                <Button
                  key={diet.id}
                  variant={responses.nutrition?.includes(diet.id) ? "default" : "outline"}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => {
                    const currentNutrition = responses.nutrition || [];
                    const updatedNutrition = currentNutrition.includes(diet.id)
                      ? currentNutrition.filter((n: string) => n !== diet.id)
                      : [...currentNutrition, diet.id];
                    updateResponse('nutrition', updatedNutrition);
                    saveStepResponse('nutrition', updatedNutrition);
                  }}
                >
                  <span className="text-2xl">{diet.icon}</span>
                  <span className="text-sm text-center">{diet.label}</span>
                </Button>
              ))}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <StepIcon className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold">Complete your profile</h2>
              <p className="text-muted-foreground">Just a few more details to personalize your experience</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="175"
                    value={responses.height_cm || ''}
                    onChange={(e) => updateResponse('height_cm', parseInt(e.target.value) || null)}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={responses.weight_kg || ''}
                    onChange={(e) => updateResponse('weight_kg', parseFloat(e.target.value) || null)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="experience">Any injuries or medical conditions we should know about?</Label>
                <Textarea
                  id="experience"
                  placeholder="Optional: Tell us about any limitations or areas of concern..."
                  value={responses.medical_notes || ''}
                  onChange={(e) => updateResponse('medical_notes', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-fitness-orange flex items-center justify-center">
                <Dumbbell className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">Phoenix Fitness</span>
            </div>
            <Badge variant="secondary">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </Badge>
          </div>
          
          <Progress value={progress} className="w-full h-2 mb-4" />
          
          <CardTitle className="text-xl">
            {currentStepData.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {renderStepContent()}

          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <span>
                {currentStep === ONBOARDING_STEPS.length - 1 ? 'Complete Setup' : 'Next'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}