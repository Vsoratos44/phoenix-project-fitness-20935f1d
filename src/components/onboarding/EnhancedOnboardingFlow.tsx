/**
 * Enhanced Phoenix Project Fitness - Comprehensive Onboarding Flow
 * 
 * Premium onboarding experience inspired by Peloton and cutting-edge fitness apps
 * Includes health intake, biometrics, injury assessment, and goal setting
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnhancedProgress } from "@/components/ui/enhanced-progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
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
  ArrowRight,
  User,
  Activity,
  Shield,
  Scale,
  Zap,
  Calendar,
  MapPin
} from "lucide-react";

// Enhanced onboarding steps with health intake
const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome to Phoenix', icon: Target, description: 'Let\'s get you started on your fitness journey' },
  { id: 'goals', title: 'Your Goals', icon: Target, description: 'What do you want to achieve?' },
  { id: 'profile', title: 'Basic Profile', icon: User, description: 'Tell us about yourself' },
  { id: 'health_history', title: 'Health History', icon: Heart, description: 'Medical background and conditions' },
  { id: 'injury_assessment', title: 'Injury Assessment', icon: Shield, description: 'Current or past injuries' },
  { id: 'fitness_level', title: 'Fitness Level', icon: TrendingUp, description: 'Your current activity level' },
  { id: 'biometrics', title: 'Body Metrics', icon: Scale, description: 'Height, weight, and measurements' },
  { id: 'equipment', title: 'Available Equipment', icon: Dumbbell, description: 'What equipment do you have?' },
  { id: 'schedule', title: 'Workout Schedule', icon: Clock, description: 'When do you prefer to work out?' },
  { id: 'preferences', title: 'Training Preferences', icon: Zap, description: 'Workout style and intensity' },
  { id: 'nutrition', title: 'Nutrition & Diet', icon: Utensils, description: 'Dietary preferences and goals' },
  { id: 'location', title: 'Training Location', icon: MapPin, description: 'Where will you be working out?' },
  { id: 'timeline', title: 'Timeline & Commitment', icon: Calendar, description: 'Your fitness timeline' },
];

// Comprehensive options
const FITNESS_GOALS = [
  { id: 'lose_weight', label: 'Lose Weight', icon: '🎯', description: 'Burn fat and reduce body weight' },
  { id: 'build_muscle', label: 'Build Muscle', icon: '💪', description: 'Increase muscle mass and strength' },
  { id: 'improve_endurance', label: 'Improve Endurance', icon: '🏃', description: 'Boost cardiovascular fitness' },
  { id: 'get_toned', label: 'Get Toned', icon: '✨', description: 'Lean muscle definition' },
  { id: 'increase_strength', label: 'Increase Strength', icon: '🏋️', description: 'Build power and lift heavier' },
  { id: 'improve_flexibility', label: 'Improve Flexibility', icon: '🧘', description: 'Enhance mobility and range of motion' },
  { id: 'sport_performance', label: 'Sport Performance', icon: '⚽', description: 'Train for specific sports' },
  { id: 'general_fitness', label: 'General Fitness', icon: '🌟', description: 'Overall health and wellness' },
];

const ACTIVITY_LEVELS = [
  { 
    id: 'sedentary', 
    label: 'Sedentary', 
    description: 'Little to no exercise, desk job',
    multiplier: 1.2 
  },
  { 
    id: 'lightly_active', 
    label: 'Lightly Active', 
    description: 'Light exercise 1-3 days/week',
    multiplier: 1.375 
  },
  { 
    id: 'moderately_active', 
    label: 'Moderately Active', 
    description: 'Moderate exercise 3-5 days/week',
    multiplier: 1.55 
  },
  { 
    id: 'very_active', 
    label: 'Very Active', 
    description: 'Hard exercise 6-7 days/week',
    multiplier: 1.725 
  },
  { 
    id: 'extremely_active', 
    label: 'Extremely Active', 
    description: 'Very hard exercise, physical job',
    multiplier: 1.9 
  },
];

const MEDICAL_CONDITIONS = [
  'Heart Disease', 'High Blood Pressure', 'Diabetes (Type 1)', 'Diabetes (Type 2)', 
  'Asthma', 'Arthritis', 'Osteoporosis', 'Back Problems', 'Knee Problems',
  'Shoulder Problems', 'Pregnancy', 'Recent Surgery', 'Other'
];

const INJURY_TYPES = [
  'Lower Back', 'Knee', 'Shoulder', 'Ankle', 'Wrist', 'Hip', 'Neck', 'Elbow', 'Other'
];

const EQUIPMENT_OPTIONS = [
  { id: 'bodyweight', label: 'Bodyweight Only', icon: '🤸', category: 'basic' },
  { id: 'dumbbells', label: 'Dumbbells', icon: '🏋️', category: 'weights' },
  { id: 'resistance_bands', label: 'Resistance Bands', icon: '🎗️', category: 'basic' },
  { id: 'kettlebells', label: 'Kettlebells', icon: '⚡', category: 'weights' },
  { id: 'barbell', label: 'Barbell & Plates', icon: '🏋️‍♂️', category: 'weights' },
  { id: 'pull_up_bar', label: 'Pull-up Bar', icon: '🎯', category: 'basic' },
  { id: 'bench', label: 'Weight Bench', icon: '🪑', category: 'weights' },
  { id: 'gym_membership', label: 'Gym Membership', icon: '🏢', category: 'gym' },
  { id: 'cardio_equipment', label: 'Cardio Equipment', icon: '🚴', category: 'cardio' },
  { id: 'yoga_mat', label: 'Yoga Mat', icon: '🧘‍♀️', category: 'basic' },
];

interface EnhancedOnboardingFlowProps {
  onComplete: () => void;
}

export function EnhancedOnboardingFlow({ onComplete }: EnhancedOnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

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

  const completeOnboarding = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Save comprehensive profile
      const { error: profileError } = await supabase
        .from('enhanced_profiles')
        .upsert({
          user_id: user.id,
          onboarding_completed: true,
          onboarding_step: ONBOARDING_STEPS.length,
          
          // Goals and preferences
          primary_goal: responses.goals?.[0] || 'general_fitness',
          specific_focus: responses.goals || [],
          
          // Basic profile
          age: responses.age,
          gender: responses.gender,
          height_cm: responses.height_cm,
          weight_kg: responses.weight_kg,
          target_weight_kg: responses.target_weight_kg,
          
          // Health and medical
          medical_conditions: responses.medical_conditions || [],
          medications: responses.medications || [],
          pain_areas: responses.injuries || [],
          
          // Fitness level
          training_level: responses.fitness_level,
          
          // Equipment and location
          home_equipment: responses.equipment || [],
          gym_access: responses.gym_access || false,
          preferred_location: responses.training_location,
          
          // Schedule and preferences
          training_frequency: responses.workout_frequency,
          session_duration_preference: responses.workout_duration,
          workout_days: responses.preferred_days || [],
          time_constraints: responses.time_constraints || [],
          
          // Goals and timeline
          timeline_weeks: responses.timeline_weeks,
          
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // Save biometric data if provided
      if (responses.weight_kg || responses.body_fat_percentage || responses.resting_heart_rate) {
        const { error: biometricError } = await supabase
          .from('biometric_logs')
          .insert({
            user_id: user.id,
            weight_kg: responses.weight_kg,
            body_fat_percentage: responses.body_fat_percentage,
            resting_heart_rate: responses.resting_heart_rate,
            recorded_at: new Date().toISOString(),
            source: 'onboarding',
          });

        if (biometricError) console.error('Biometric save error:', biometricError);
      }

      // Save injury history if provided
      if (responses.injuries && responses.injuries.length > 0) {
        const injuryPromises = responses.injuries.map((injury: string) => 
          supabase.from('injury_history').insert({
            user_id: user.id,
            injury_type: 'chronic',
            affected_body_part: injury,
            severity_level: responses.injury_severity || 3,
            affects_training: true,
            current_pain_level: responses.pain_level || 0,
          })
        );

        await Promise.all(injuryPromises);
      }

      toast({
        title: "🎉 Welcome to Phoenix Fitness!",
        description: "Your personalized fitness journey starts now.",
      });

      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    const StepIcon = currentStepData.icon;

    switch (currentStepData.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="h-24 w-24 mx-auto bg-gradient-to-br from-primary to-fitness-orange rounded-full flex items-center justify-center mb-6 animate-pulse-glow">
                <Target className="h-12 w-12 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-fitness-orange bg-clip-text text-transparent mb-4">
                Welcome to Phoenix Fitness
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Your personalized fitness transformation starts here
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <CheckCircle className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="font-medium">AI-Powered Workouts</p>
                </div>
                <div className="p-4 bg-fitness-green/5 rounded-lg border border-fitness-green/20">
                  <Heart className="h-6 w-6 text-fitness-green mx-auto mb-2" />
                  <p className="font-medium">Health Monitoring</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <StepIcon className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold">What are your fitness goals?</h2>
              <p className="text-muted-foreground">Select all that apply - we'll personalize everything for you</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FITNESS_GOALS.map((goal) => (
                <Card
                  key={goal.id}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                    responses.goals?.includes(goal.id) 
                      ? 'border-primary bg-primary/5 shadow-lg' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => {
                    const currentGoals = responses.goals || [];
                    const updatedGoals = currentGoals.includes(goal.id)
                      ? currentGoals.filter((g: string) => g !== goal.id)
                      : [...currentGoals, goal.id];
                    updateResponse('goals', updatedGoals);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{goal.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold">{goal.label}</h3>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      </div>
                      {responses.goals?.includes(goal.id) && (
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <StepIcon className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold">Tell us about yourself</h2>
              <p className="text-muted-foreground">Basic information to personalize your experience</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={responses.age || ''}
                  onChange={(e) => updateResponse('age', parseInt(e.target.value) || null)}
                />
              </div>
              
              <div>
                <Label>Gender</Label>
                <RadioGroup 
                  value={responses.gender || ''} 
                  onValueChange={(value) => updateResponse('gender', value)}
                  className="flex space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 'health_history':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <StepIcon className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold">Health History</h2>
              <p className="text-muted-foreground">Help us keep you safe during workouts</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Do you have any medical conditions? (Select all that apply)
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {MEDICAL_CONDITIONS.map((condition) => (
                    <div key={condition} className="flex items-center space-x-2">
                      <Checkbox
                        id={condition}
                        checked={responses.medical_conditions?.includes(condition) || false}
                        onCheckedChange={(checked) => {
                          const current = responses.medical_conditions || [];
                          const updated = checked
                            ? [...current, condition]
                            : current.filter((c: string) => c !== condition);
                          updateResponse('medical_conditions', updated);
                        }}
                      />
                      <Label htmlFor={condition} className="text-sm">{condition}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="medications">Current Medications</Label>
                <Textarea
                  id="medications"
                  placeholder="List any medications you're currently taking..."
                  value={responses.medications_text || ''}
                  onChange={(e) => updateResponse('medications_text', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 'injury_assessment':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <StepIcon className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold">Injury Assessment</h2>
              <p className="text-muted-foreground">Let us know about any current or past injuries</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Any current or recurring pain/injuries?
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {INJURY_TYPES.map((injury) => (
                    <div key={injury} className="flex items-center space-x-2">
                      <Checkbox
                        id={injury}
                        checked={responses.injuries?.includes(injury) || false}
                        onCheckedChange={(checked) => {
                          const current = responses.injuries || [];
                          const updated = checked
                            ? [...current, injury]
                            : current.filter((i: string) => i !== injury);
                          updateResponse('injuries', updated);
                        }}
                      />
                      <Label htmlFor={injury} className="text-sm">{injury}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {responses.injuries?.length > 0 && (
                <div>
                  <Label>Current Pain Level (0 = No pain, 10 = Severe pain)</Label>
                  <div className="px-4 py-2">
                    <Slider
                      value={[responses.pain_level || 0]}
                      onValueChange={(value) => updateResponse('pain_level', value[0])}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>No pain</span>
                      <span>Severe pain</span>
                    </div>
                    <p className="text-center mt-2 font-medium">
                      Current level: {responses.pain_level || 0}/10
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'fitness_level':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <StepIcon className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold">What's your activity level?</h2>
              <p className="text-muted-foreground">This helps us create the perfect program intensity</p>
            </div>
            <div className="space-y-3">
              {ACTIVITY_LEVELS.map((level) => (
                <Card
                  key={level.id}
                  className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                    responses.fitness_level === level.id 
                      ? 'border-primary bg-primary/5 shadow-lg' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => updateResponse('fitness_level', level.id)}
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

      // Add more cases for other steps...
      case 'biometrics':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <StepIcon className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold">Body Metrics</h2>
              <p className="text-muted-foreground">Help us track your progress and calculate your needs</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="weight">Current Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  value={responses.weight_kg || ''}
                  onChange={(e) => updateResponse('weight_kg', parseFloat(e.target.value) || null)}
                />
              </div>
              <div>
                <Label htmlFor="target_weight">Target Weight (kg) - Optional</Label>
                <Input
                  id="target_weight"
                  type="number"
                  placeholder="65"
                  value={responses.target_weight_kg || ''}
                  onChange={(e) => updateResponse('target_weight_kg', parseFloat(e.target.value) || null)}
                />
              </div>
              <div>
                <Label htmlFor="body_fat">Body Fat % (if known)</Label>
                <Input
                  id="body_fat"
                  type="number"
                  placeholder="20"
                  value={responses.body_fat_percentage || ''}
                  onChange={(e) => updateResponse('body_fat_percentage', parseFloat(e.target.value) || null)}
                />
              </div>
            </div>
          </div>
        );

      // Continue with equipment, schedule, preferences, etc.
      case 'equipment':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <StepIcon className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold">Available Equipment</h2>
              <p className="text-muted-foreground">We'll customize workouts based on what you have</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {EQUIPMENT_OPTIONS.map((equipment) => (
                <Button
                  key={equipment.id}
                  variant={responses.equipment?.includes(equipment.id) ? "default" : "outline"}
                  className="h-20 flex flex-col items-center justify-center space-y-2 transition-all duration-300 hover:scale-105"
                  onClick={() => {
                    const currentEquipment = responses.equipment || [];
                    const updatedEquipment = currentEquipment.includes(equipment.id)
                      ? currentEquipment.filter((e: string) => e !== equipment.id)
                      : [...currentEquipment, equipment.id];
                    updateResponse('equipment', updatedEquipment);
                  }}
                >
                  <span className="text-2xl">{equipment.icon}</span>
                  <span className="text-xs text-center">{equipment.label}</span>
                </Button>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <StepIcon className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
            <p className="text-muted-foreground">{currentStepData.description}</p>
            <p className="text-sm text-muted-foreground mt-4">This step is under construction.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-fitness-orange flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <span className="font-bold text-lg">Phoenix Fitness</span>
                <p className="text-xs text-muted-foreground">Personal Setup</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {currentStep + 1} / {ONBOARDING_STEPS.length}
            </Badge>
          </div>
          
          <EnhancedProgress 
            value={progress} 
            className="w-full h-2 mb-6" 
            showGlow={true}
            variant="default"
          />
          
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              {currentStepData.title}
            </CardTitle>
            <CardDescription className="text-base">
              {currentStepData.description}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pb-8">
          <div className="animate-fade-in-up">
            {renderStepContent()}
          </div>

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
              className="flex items-center space-x-2 bg-gradient-to-r from-primary to-fitness-orange hover:from-primary/90 hover:to-fitness-orange/90"
            >
              <span>{currentStep === ONBOARDING_STEPS.length - 1 ? 'Complete Setup' : 'Next'}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}