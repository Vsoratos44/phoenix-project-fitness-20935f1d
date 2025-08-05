import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PhoenixWorkoutEngine, GeneratedWorkout } from "@/services/PhoenixWorkoutEngine";
import { 
  Brain, 
  Flame, 
  Target, 
  Clock, 
  Dumbbell,
  Heart,
  Zap,
  Shield,
  Play,
  Save,
  Sparkles,
  Activity,
  TrendingUp,
  Star,
  CheckCircle2
} from "lucide-react";

export default function EnhancedAIWorkoutGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [workoutEngine] = useState(() => new PhoenixWorkoutEngine());
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [phoenixScore, setPhoenixScore] = useState<number>(75);
  const [adaptationHistory, setAdaptationHistory] = useState<any[]>([]);
  const [progressMetrics, setProgressMetrics] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadPhoenixScore();
      loadAdaptationHistory();
      loadProgressMetrics();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      // Load comprehensive user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      const { data: enhancedProfile } = await supabase
        .from('enhanced_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      // Load injury history
      const { data: injuries } = await supabase
        .from('injury_history')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active');

      const combinedProfile = {
        user_id: user?.id,
        primary_goal: profile?.primary_goal || 'general_fitness',
        fitness_level: profile?.fitness_level || 'intermediate',
        available_equipment: profile?.available_equipment || ['bodyweight'],
        injury_history_summary: injuries || [],
        one_rep_max_estimates: profile?.one_rep_max_estimates || {},
        height_cm: enhancedProfile?.height_cm,
        weight_kg: enhancedProfile?.weight_kg,
        preferred_workout_duration: profile?.preferred_workout_duration || 45,
        training_frequency_goal: profile?.training_frequency_goal || 3,
        training_age_years: enhancedProfile?.training_age_years,
        body_fat_percentage: enhancedProfile?.body_fat_percentage
      };

      setUserProfile(combinedProfile);

    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadPhoenixScore = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: score } = await supabase
        .from('phoenix_scores')
        .select('overall_score, suggested_intensity, recommendation, factors')
        .eq('user_id', user?.id)
        .eq('date', today)
        .maybeSingle();

      if (score) {
        setPhoenixScore(score.overall_score);
      }
    } catch (error) {
      console.error('Error loading Phoenix Score:', error);
    }
  };

  const loadAdaptationHistory = async () => {
    try {
      const { data: adaptations } = await supabase
        .from('workout_adaptations')
        .select(`
          *,
          exercises!inner(name)
        `)
        .eq('user_id', user?.id)
        .order('timestamp', { ascending: false })
        .limit(10);

      setAdaptationHistory(adaptations || []);
    } catch (error) {
      console.error('Error loading adaptation history:', error);
    }
  };

  const loadProgressMetrics = async () => {
    try {
      // Calculate progress metrics
      const { data: recentSessions } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .gte('start_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('start_time', { ascending: false });

      const { data: progressionLogs } = await supabase
        .from('progressive_overload_logs')
        .select('*')
        .eq('user_id', user?.id)
        .gte('applied_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const metrics = {
        workouts_completed: recentSessions?.length || 0,
        total_progressions: progressionLogs?.length || 0,
        success_rate: progressionLogs?.length ? 
          (progressionLogs.filter(log => log.progression_type !== 'deload').length / progressionLogs.length) * 100 : 0,
        average_session_duration: recentSessions?.length ? 
          recentSessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0) / recentSessions.length : 0
      };

      setProgressMetrics(metrics);
    } catch (error) {
      console.error('Error loading progress metrics:', error);
    }
  };

  const handleGenerateWorkout = async () => {
    if (!userProfile) {
      toast({
        title: "Profile Required",
        description: "Please complete your profile setup first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Add Phoenix Score to profile
      const profileWithScore = {
        ...userProfile,
        phoenix_score: phoenixScore
      };

      // Generate intelligent workout
      const workout = await workoutEngine.generateWorkout(profileWithScore);
      setGeneratedWorkout(workout);

      toast({
        title: "🔥 Phoenix Workout Generated!",
        description: `Your AI-powered ${workout.name} is ready! Tailored for your ${phoenixScore} readiness score.`
      });

    } catch (error) {
      console.error('Error generating workout:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate workout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveWorkout = async () => {
    if (!generatedWorkout || !user) return;

    try {
      // Save workout as a program
      const { data: program, error } = await supabase
        .from('workout_programs')
        .insert({
          name: generatedWorkout.name,
          description: generatedWorkout.description,
          duration_weeks: 1,
          workouts_per_week: 1,
          difficulty_level: userProfile?.fitness_level || 'intermediate',
          goal: userProfile?.primary_goal || 'general_fitness',
          created_by: user.id,
          equipment_required: userProfile?.available_equipment || []
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "🎉 Workout Saved!",
        description: "Your Phoenix workout has been saved to your programs."
      });

    } catch (error) {
      console.error('Error saving workout:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save workout to your programs.",
        variant: "destructive"
      });
    }
  };

  const getPhoenixScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 55) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getPhoenixScoreGradient = (score: number) => {
    if (score >= 85) return "from-green-500 to-emerald-600";
    if (score >= 70) return "from-blue-500 to-cyan-600";
    if (score >= 55) return "from-yellow-500 to-amber-600";
    if (score >= 40) return "from-orange-500 to-red-500";
    return "from-red-500 to-rose-600";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-gradient-to-br from-orange-100 to-red-100">
            <Brain className="h-12 w-12 text-orange-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Phoenix AI Workout Engine
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Enterprise-grade AI that learns from your performance, adapts to your readiness, and creates intelligent workouts that evolve with you
        </p>
      </div>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Phoenix Score */}
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-6 text-center">
            <Flame className="h-8 w-8 mx-auto mb-3 text-orange-600" />
            <div className={`text-3xl font-bold bg-gradient-to-r ${getPhoenixScoreGradient(phoenixScore)} bg-clip-text text-transparent`}>
              {phoenixScore}
            </div>
            <div className="text-sm text-muted-foreground">Readiness Score</div>
          </CardContent>
        </Card>

        {/* Progress Metrics */}
        {progressMetrics && (
          <>
            <Card>
              <CardContent className="p-6 text-center">
                <Activity className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                <div className="text-3xl font-bold text-blue-600">
                  {progressMetrics.workouts_completed}
                </div>
                <div className="text-sm text-muted-foreground">Workouts (30d)</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-3 text-green-600" />
                <div className="text-3xl font-bold text-green-600">
                  {progressMetrics.total_progressions}
                </div>
                <div className="text-sm text-muted-foreground">Progressions</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                <div className="text-3xl font-bold text-purple-600">
                  {progressMetrics.success_rate.toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* AI Generation Interface */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Generate Your Phoenix Workout
          </CardTitle>
          <CardDescription className="text-lg">
            AI-powered workout generation with real-time adaptation and progressive overload
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Summary */}
          {userProfile && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Goal</div>
                <div className="font-medium capitalize">
                  {userProfile.primary_goal.replace('_', ' ')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Fitness Level</div>
                <div className="font-medium capitalize">{userProfile.fitness_level}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Duration</div>
                <div className="font-medium">{userProfile.preferred_workout_duration} min</div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="text-center">
            <Button
              onClick={handleGenerateWorkout}
              disabled={isGenerating || !userProfile}
              size="lg"
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-6 text-lg"
            >
              {isGenerating ? (
                <>
                  <Activity className="mr-3 h-5 w-5 animate-spin" />
                  Phoenix is crafting your workout...
                </>
              ) : (
                <>
                  <Zap className="mr-3 h-5 w-5" />
                  Generate Intelligent Workout
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Workout Display */}
      {generatedWorkout && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              {generatedWorkout.name}
            </CardTitle>
            <CardDescription>{generatedWorkout.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="workout" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="workout">Workout</TabsTrigger>
                <TabsTrigger value="coaching">AI Coach</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="workout" className="space-y-6">
                {/* Workout Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="font-bold text-lg">{generatedWorkout.estimated_duration_minutes} min</div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <Dumbbell className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="font-bold text-lg">{generatedWorkout.difficulty_rating}/10</div>
                    <div className="text-sm text-muted-foreground">Difficulty</div>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <Heart className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="font-bold text-lg">{generatedWorkout.superset_count || 0}</div>
                    <div className="text-sm text-muted-foreground">Supersets</div>
                  </div>
                </div>

                {/* Workout Blocks */}
                <div className="space-y-4">
                  {generatedWorkout.blocks.map((block, blockIndex) => (
                    <Card key={blockIndex} className="border-l-4 border-l-primary">
                      <CardHeader>
                        <CardTitle className="text-lg">{block.name}</CardTitle>
                        {block.coaching_notes && (
                          <CardDescription>{block.coaching_notes}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {block.exercises.map((exercise, exerciseIndex) => (
                            <div key={exerciseIndex} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div>
                                <div className="font-medium">{exercise.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {exercise.muscle_group_primary} • {exercise.exercise_type}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">
                                  {exercise.sets && `${exercise.sets} sets`}
                                  {exercise.reps && ` × ${exercise.reps} reps`}
                                  {exercise.duration_seconds && ` × ${exercise.duration_seconds}s`}
                                  {exercise.weight_kg && ` @ ${exercise.weight_kg}kg`}
                                </div>
                                {exercise.rest_seconds && (
                                  <div className="text-sm text-muted-foreground">
                                    Rest: {exercise.rest_seconds}s
                                  </div>
                                )}
                                {exercise.rpe_target && (
                                  <Badge variant="outline" className="mt-1">
                                    RPE {exercise.rpe_target}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="coaching" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      Your AI Coach Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg leading-relaxed">{generatedWorkout.coachNotes}</p>
                  </CardContent>
                </Card>

                {/* Adaptation History */}
                {adaptationHistory.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        Recent Adaptations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {adaptationHistory.slice(0, 5).map((adaptation, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <div className="flex-1">
                              <div className="font-medium">{adaptation.exercises.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {adaptation.coaching_message || adaptation.reasoning}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(adaptation.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium">Metabolic Score</span>
                        <Badge variant="outline">{generatedWorkout.metabolic_score}/10</Badge>
                      </div>
                      <Progress value={generatedWorkout.metabolic_score * 10} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium">Strength Score</span>
                        <Badge variant="outline">{generatedWorkout.strength_score}/10</Badge>
                      </div>
                      <Progress value={generatedWorkout.strength_score * 10} />
                    </CardContent>
                  </Card>
                </div>

                {generatedWorkout.timing_breakdown && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Timing Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            {generatedWorkout.timing_breakdown.total_exercises}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Exercises</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            {generatedWorkout.timing_breakdown.total_supersets}
                          </div>
                          <div className="text-sm text-muted-foreground">Supersets</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            {generatedWorkout.timing_breakdown.estimated_minutes}
                          </div>
                          <div className="text-sm text-muted-foreground">Estimated Minutes</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    size="lg"
                    className="h-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    onClick={() => {
                      toast({
                        title: "🚀 Starting Workout Session!",
                        description: "Good luck! Remember to listen to your body."
                      });
                    }}
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Start Phoenix Session
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="h-16"
                    onClick={handleSaveWorkout}
                  >
                    <Save className="mr-2 h-5 w-5" />
                    Save to Programs
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Real-Time Features</CardTitle>
                    <CardDescription>
                      Phoenix will automatically adapt your workout based on your feedback
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <Shield className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <div className="font-medium">Injury Protection</div>
                        <div className="text-sm text-muted-foreground">
                          Automatic exercise substitution for active injuries
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <div className="font-medium">RPE Monitoring</div>
                        <div className="text-sm text-muted-foreground">
                          Real-time intensity adjustments based on perceived exertion
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <div className="font-medium">Progressive Overload</div>
                        <div className="text-sm text-muted-foreground">
                          Automatic weight and rep progression based on performance
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}