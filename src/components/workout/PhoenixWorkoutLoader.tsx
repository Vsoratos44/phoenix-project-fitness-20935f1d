import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AIWorkoutGenerator } from "@/components/ai/AIWorkoutGenerator";
import PhoenixSession from "./PhoenixSession";
import { Brain, Zap, Play, ArrowRight } from "lucide-react";

interface PhoenixWorkoutLoaderProps {
  onExit: () => void;
}

export default function PhoenixWorkoutLoader({ onExit }: PhoenixWorkoutLoaderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loadingState, setLoadingState] = useState<'checking' | 'no-workout' | 'generating' | 'ready'>('checking');
  const [generatedWorkout, setGeneratedWorkout] = useState<any>(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  useEffect(() => {
    checkForActiveWorkout();
  }, [user]);

  const checkForActiveWorkout = async () => {
    if (!user) return;

    try {
      // Check for any recent AI-generated workouts
      const { data: recentWorkouts, error } = await supabase
        .from('ai_workout_generations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recentWorkouts && recentWorkouts.generated_workout) {
        // Use the most recent AI-generated workout
        setGeneratedWorkout(recentWorkouts.generated_workout);
        setLoadingState('ready');
        
        toast({
          title: "Workout Found!",
          description: "Loading your AI-generated Phoenix session...",
        });
      } else {
        // No workout available, need to generate one
        setLoadingState('no-workout');
      }
    } catch (error) {
      console.error('Error checking for active workout:', error);
      setLoadingState('no-workout');
    }
  };

  const handleWorkoutGenerated = (workout: any) => {
    setGeneratedWorkout(workout);
    setShowAIGenerator(false);
    setLoadingState('ready');
    
    toast({
      title: "🔥 Phoenix Workout Ready!",
      description: "Your AI-optimized workout has been generated. Ready to start your session!",
    });
  };

  const startWorkoutGeneration = () => {
    setLoadingState('generating');
    setShowAIGenerator(true);
  };

  if (loadingState === 'checking') {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="text-center py-12">
            <Brain className="h-16 w-16 text-orange-600 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-semibold mb-2">Checking for Active Workouts...</h3>
            <p className="text-muted-foreground">Searching for your Phoenix session data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingState === 'no-workout' && !showAIGenerator) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Zap className="h-16 w-16 text-orange-600" />
            </div>
            <CardTitle className="text-2xl text-orange-800">
              No Workout Found
            </CardTitle>
            <CardDescription className="text-orange-600">
              You need an AI-generated workout to start your Phoenix session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-white/50 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Phoenix Session Requirements:</h4>
              <ul className="space-y-1 text-sm text-orange-700">
                <li>✓ AI-optimized exercise selection based on your profile</li>
                <li>✓ Personalized intensity and volume recommendations</li>
                <li>✓ Real-time coaching and form feedback</li>
                <li>✓ Adaptive modifications during your workout</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={startWorkoutGeneration}
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                size="lg"
              >
                <Brain className="h-5 w-5 mr-2" />
                Generate AI Workout
              </Button>
              
              <Button 
                variant="outline"
                onClick={onExit}
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                Exit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showAIGenerator) {
    return (
      <div className="container mx-auto p-6">
        <Card className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Brain className="h-6 w-6" />
              Generating Your Phoenix Workout
            </CardTitle>
            <CardDescription className="text-orange-600">
              Create your AI-optimized workout to begin your Phoenix session
            </CardDescription>
          </CardHeader>
        </Card>
        
        <AIWorkoutGenerator 
          onWorkoutGenerated={handleWorkoutGenerated}
          redirectToPhoenix={true}
        />
      </div>
    );
  }

  if (loadingState === 'ready' && generatedWorkout) {
    return (
      <PhoenixSession 
        onExit={onExit}
        initialWorkout={generatedWorkout}
      />
    );
  }

  return null;
}