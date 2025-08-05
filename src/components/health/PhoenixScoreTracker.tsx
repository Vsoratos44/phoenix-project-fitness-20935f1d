import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Flame, 
  Brain, 
  Heart, 
  Moon, 
  Zap, 
  Activity, 
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Target
} from "lucide-react";

interface PhoenixScore {
  id: string;
  date: string;
  overall_score: number;
  sleep_score?: number;
  recovery_score?: number;
  training_load_score?: number;
  nutrition_score?: number;
  stress_score?: number;
  hrv_score?: number;
  recommendation?: string;
  suggested_intensity?: string;
  factors?: any;
}

interface BiometricData {
  sleep_hours?: number;
  sleep_quality?: number;
  resting_heart_rate?: number;
  stress_level?: number;
  energy_level?: number;
  mood?: number;
}

export default function PhoenixScoreTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [phoenixScores, setPhoenixScores] = useState<PhoenixScore[]>([]);
  const [currentScore, setCurrentScore] = useState<PhoenixScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricData, setBiometricData] = useState<BiometricData>({});
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (user) {
      loadPhoenixScores();
      loadTodaysBiometrics();
    }
  }, [user]);

  const loadPhoenixScores = async () => {
    try {
      const { data, error } = await supabase
        .from('phoenix_scores')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;
      
      setPhoenixScores(data || []);
      setCurrentScore(data?.[0] || null);
    } catch (error) {
      console.error('Error loading Phoenix scores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTodaysBiometrics = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('biometric_logs')
        .select('*')
        .eq('user_id', user?.id)
        .eq('recorded_at', today)
        .single();

      if (data) {
        setBiometricData({
          sleep_hours: data.sleep_hours,
          sleep_quality: data.sleep_quality,
          resting_heart_rate: data.resting_heart_rate,
          stress_level: data.stress_level,
          energy_level: data.energy_level,
          mood: data.mood
        });
      }
    } catch (error) {
      // No biometric data for today is normal
      console.log('No biometric data for today');
    }
  };

  const calculatePhoenixScore = async () => {
    if (!user) return;

    setIsCalculating(true);
    try {
      // Get recent workout data for training load
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const { data: recentWorkouts } = await supabase
        .from('workout_sessions')
        .select('duration_minutes, total_volume_kg, perceived_exertion')
        .eq('user_id', user.id)
        .gte('start_time', lastWeek.toISOString());

      // Calculate component scores
      const sleepScore = calculateSleepScore(biometricData);
      const recoveryScore = calculateRecoveryScore(biometricData);
      const trainingLoadScore = calculateTrainingLoadScore(recentWorkouts || []);
      const nutritionScore = 75; // Default - would integrate with nutrition data
      const stressScore = calculateStressScore(biometricData);
      const hrvScore = calculateHRVScore(biometricData);

      // Calculate overall score (weighted average)
      const overallScore = Math.round(
        (sleepScore * 0.25) +
        (recoveryScore * 0.20) +
        (trainingLoadScore * 0.15) +
        (nutritionScore * 0.15) +
        (stressScore * 0.15) +
        (hrvScore * 0.10)
      );

      // Generate recommendation and suggested intensity
      const { recommendation, suggestedIntensity } = generateRecommendation(
        overallScore, sleepScore, recoveryScore, trainingLoadScore, stressScore
      );

      // Save Phoenix Score
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('phoenix_scores')
        .upsert({
          user_id: user.id,
          date: today,
          overall_score: overallScore,
          sleep_score: sleepScore,
          recovery_score: recoveryScore,
          training_load_score: trainingLoadScore,
          nutrition_score: nutritionScore,
          stress_score: stressScore,
          hrv_score: hrvScore,
          recommendation,
          suggested_intensity: suggestedIntensity,
          factors: {
            biometric_data: biometricData as any,
            recent_workouts_count: recentWorkouts?.length || 0
          } as any
        });

      if (error) throw error;

      await loadPhoenixScores();
      
      toast({
        title: "🔥 Phoenix Score Updated!",
        description: `Your readiness score is ${overallScore}/100. ${recommendation}`
      });

    } catch (error) {
      console.error('Error calculating Phoenix score:', error);
      toast({
        title: "Calculation Failed",
        description: "Failed to calculate Phoenix score",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const calculateSleepScore = (data: BiometricData): number => {
    if (!data.sleep_hours && !data.sleep_quality) return 50;
    
    let score = 0;
    let factors = 0;

    if (data.sleep_hours) {
      // Optimal sleep is 7-9 hours
      if (data.sleep_hours >= 7 && data.sleep_hours <= 9) {
        score += 85;
      } else if (data.sleep_hours >= 6 && data.sleep_hours <= 10) {
        score += 70;
      } else {
        score += 40;
      }
      factors++;
    }

    if (data.sleep_quality) {
      // Sleep quality scale 1-10
      score += (data.sleep_quality * 10);
      factors++;
    }

    return factors > 0 ? Math.round(score / factors) : 50;
  };

  const calculateRecoveryScore = (data: BiometricData): number => {
    if (!data.resting_heart_rate && !data.energy_level) return 50;
    
    let score = 0;
    let factors = 0;

    if (data.resting_heart_rate) {
      // Lower RHR generally indicates better recovery
      if (data.resting_heart_rate <= 60) {
        score += 90;
      } else if (data.resting_heart_rate <= 70) {
        score += 75;
      } else if (data.resting_heart_rate <= 80) {
        score += 60;
      } else {
        score += 40;
      }
      factors++;
    }

    if (data.energy_level) {
      score += (data.energy_level * 10);
      factors++;
    }

    return factors > 0 ? Math.round(score / factors) : 50;
  };

  const calculateTrainingLoadScore = (workouts: any[]): number => {
    if (workouts.length === 0) return 80; // Well-rested if no recent training

    const totalVolume = workouts.reduce((sum, workout) => sum + (workout.total_volume_kg || 0), 0);
    const avgExertion = workouts.reduce((sum, workout) => sum + (workout.perceived_exertion || 5), 0) / workouts.length;
    const workoutCount = workouts.length;

    // Calculate training load based on frequency, volume, and intensity
    let score = 100;
    
    // Frequency factor
    if (workoutCount > 5) score -= 20;
    else if (workoutCount > 3) score -= 10;

    // Volume factor
    if (totalVolume > 10000) score -= 15;
    else if (totalVolume > 5000) score -= 8;

    // Intensity factor
    if (avgExertion > 8) score -= 15;
    else if (avgExertion > 6) score -= 5;

    return Math.max(20, Math.min(100, score));
  };

  const calculateStressScore = (data: BiometricData): number => {
    if (!data.stress_level && !data.mood) return 50;
    
    let score = 0;
    let factors = 0;

    if (data.stress_level) {
      // Inverse stress score (lower stress = higher score)
      score += (100 - (data.stress_level * 10));
      factors++;
    }

    if (data.mood) {
      score += (data.mood * 10);
      factors++;
    }

    return factors > 0 ? Math.round(score / factors) : 50;
  };

  const calculateHRVScore = (data: BiometricData): number => {
    // HRV would typically come from wearable devices
    // For now, estimate based on other factors
    const avgScore = (calculateSleepScore(data) + calculateRecoveryScore(data) + calculateStressScore(data)) / 3;
    return Math.round(avgScore);
  };

  const generateRecommendation = (overall: number, sleep: number, recovery: number, trainingLoad: number, stress: number) => {
    let recommendation = "";
    let suggestedIntensity = "";

    if (overall >= 80) {
      recommendation = "Excellent readiness! This is a perfect day for high-intensity training and pushing your limits.";
      suggestedIntensity = "high";
    } else if (overall >= 65) {
      recommendation = "Good readiness for moderate to high intensity training. Listen to your body during the session.";
      suggestedIntensity = "moderate-high";
    } else if (overall >= 50) {
      recommendation = "Moderate readiness. Consider lighter training or focus on technique and mobility work.";
      suggestedIntensity = "moderate";
    } else if (overall >= 35) {
      recommendation = "Low readiness detected. Prioritize active recovery, stretching, and restorative activities.";
      suggestedIntensity = "low";
    } else {
      recommendation = "Very low readiness. Consider a complete rest day or gentle movement like walking or meditation.";
      suggestedIntensity = "rest";
    }

    // Add specific recommendations based on limiting factors
    if (sleep < 50) {
      recommendation += " Prioritize sleep quality tonight.";
    }
    if (stress < 50) {
      recommendation += " Consider stress management techniques.";
    }
    if (recovery < 50) {
      recommendation += " Focus on recovery modalities today.";
    }

    return { recommendation, suggestedIntensity };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 65) return "text-blue-600";
    if (score >= 50) return "text-yellow-600";
    if (score >= 35) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-green-500 to-green-600";
    if (score >= 65) return "from-blue-500 to-blue-600";
    if (score >= 50) return "from-yellow-500 to-yellow-600";
    if (score >= 35) return "from-orange-500 to-orange-600";
    return "from-red-500 to-red-600";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <Flame className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Loading Phoenix Score...</h3>
            <p className="text-muted-foreground">Analyzing your readiness</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className={`p-4 rounded-full bg-gradient-to-br ${currentScore ? getScoreGradient(currentScore.overall_score) : 'from-gray-400 to-gray-500'}`}>
            <Flame className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Phoenix Readiness Score</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your AI-powered daily readiness assessment that adapts your training for optimal performance and recovery.
        </p>
      </div>

      {/* Current Score Card */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-orange-600" />
              Today's Phoenix Score
            </span>
            <Badge variant="secondary">
              {new Date().toLocaleDateString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentScore ? (
            <div className="space-y-6">
              {/* Overall Score Display */}
              <div className="text-center">
                <div className={`text-6xl font-bold mb-2 ${getScoreColor(currentScore.overall_score)}`}>
                  {currentScore.overall_score}
                  <span className="text-2xl text-muted-foreground">/100</span>
                </div>
                <div className="flex justify-center mb-4">
                  <Progress 
                    value={currentScore.overall_score} 
                    className="w-64 h-3"
                  />
                </div>
                <p className="text-lg text-orange-700 max-w-md mx-auto">
                  {currentScore.recommendation}
                </p>
              </div>

              {/* Component Scores */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {currentScore.sleep_score && (
                  <div className="text-center p-3 bg-white rounded-lg border border-orange-200">
                    <Moon className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                    <div className="font-bold text-lg">{currentScore.sleep_score}</div>
                    <div className="text-xs text-muted-foreground">Sleep</div>
                  </div>
                )}
                
                {currentScore.recovery_score && (
                  <div className="text-center p-3 bg-white rounded-lg border border-orange-200">
                    <Heart className="h-6 w-6 mx-auto mb-1 text-red-600" />
                    <div className="font-bold text-lg">{currentScore.recovery_score}</div>
                    <div className="text-xs text-muted-foreground">Recovery</div>
                  </div>
                )}
                
                {currentScore.training_load_score && (
                  <div className="text-center p-3 bg-white rounded-lg border border-orange-200">
                    <Zap className="h-6 w-6 mx-auto mb-1 text-yellow-600" />
                    <div className="font-bold text-lg">{currentScore.training_load_score}</div>
                    <div className="text-xs text-muted-foreground">Training Load</div>
                  </div>
                )}
                
                {currentScore.stress_score && (
                  <div className="text-center p-3 bg-white rounded-lg border border-orange-200">
                    <Activity className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                    <div className="font-bold text-lg">{currentScore.stress_score}</div>
                    <div className="text-xs text-muted-foreground">Stress</div>
                  </div>
                )}
                
                {currentScore.nutrition_score && (
                  <div className="text-center p-3 bg-white rounded-lg border border-orange-200">
                    <Target className="h-6 w-6 mx-auto mb-1 text-green-600" />
                    <div className="font-bold text-lg">{currentScore.nutrition_score}</div>
                    <div className="text-xs text-muted-foreground">Nutrition</div>
                  </div>
                )}
                
                {currentScore.hrv_score && (
                  <div className="text-center p-3 bg-white rounded-lg border border-orange-200">
                    <TrendingUp className="h-6 w-6 mx-auto mb-1 text-indigo-600" />
                    <div className="font-bold text-lg">{currentScore.hrv_score}</div>
                    <div className="text-xs text-muted-foreground">HRV</div>
                  </div>
                )}
              </div>

              {/* Training Recommendation */}
              {currentScore.suggested_intensity && (
                <div className="p-4 bg-white rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">
                    Recommended Training Intensity
                  </h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {currentScore.suggested_intensity.replace('_', ' ')}
                    </Badge>
                    {currentScore.suggested_intensity === 'high' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    {currentScore.suggested_intensity === 'rest' && <AlertCircle className="h-4 w-4 text-red-600" />}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Flame className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Score Available</h3>
              <p className="text-muted-foreground mb-4">
                Complete your biometric check-in to generate today's Phoenix Score
              </p>
              <Button 
                onClick={calculatePhoenixScore}
                disabled={isCalculating}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isCalculating ? (
                  <>
                    <Brain className="mr-2 h-4 w-4 animate-pulse" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Flame className="mr-2 h-4 w-4" />
                    Calculate Phoenix Score
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed View */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="factors">Factors</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>7-Day Phoenix Score Trend</CardTitle>
              <CardDescription>
                Track your readiness patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {phoenixScores.length > 0 ? (
                <div className="space-y-4">
                  {phoenixScores.slice(0, 7).map((score, index) => (
                    <div key={score.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {new Date(score.date).toLocaleDateString()}
                        </span>
                        {index === 0 && <Badge variant="secondary">Today</Badge>}
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={score.overall_score} className="w-24" />
                        <span className={`font-bold ${getScoreColor(score.overall_score)}`}>
                          {score.overall_score}
                        </span>
                        {index < phoenixScores.length - 1 && (
                          <div className="flex items-center">
                            {score.overall_score > phoenixScores[index + 1].overall_score ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : score.overall_score < phoenixScores[index + 1].overall_score ? (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Start tracking your Phoenix Score to see trends over time
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
              <CardDescription>
                Understand what influences your Phoenix Score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Sleep Quality (25%)</h4>
                  <p className="text-blue-700 text-sm">
                    Sleep duration and quality significantly impact recovery and performance readiness.
                  </p>
                </div>
                
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">Recovery Status (20%)</h4>
                  <p className="text-red-700 text-sm">
                    Heart rate variability, resting heart rate, and subjective energy levels.
                  </p>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">Training Load (15%)</h4>
                  <p className="text-yellow-700 text-sm">
                    Recent workout frequency, volume, and intensity affect your readiness.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Nutrition & Hydration (15%)</h4>
                  <p className="text-green-700 text-sm">
                    Nutritional status and hydration levels impact energy availability.
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">Stress Levels (15%)</h4>
                  <p className="text-purple-700 text-sm">
                    Psychological stress and mood affect training capacity and recovery.
                  </p>
                </div>
                
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-indigo-800 mb-2">Heart Rate Variability (10%)</h4>
                  <p className="text-indigo-700 text-sm">
                    Autonomic nervous system status indicates recovery and adaptation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phoenix AI Insights</CardTitle>
              <CardDescription>
                Personalized recommendations based on your patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Pattern Recognition
                  </h4>
                  <p className="text-orange-700 text-sm">
                    Phoenix AI analyzes your score patterns to predict optimal training windows and identify factors that most influence your readiness.
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Adaptive Programming
                  </h4>
                  <p className="text-blue-700 text-sm">
                    Your workouts automatically adjust based on your Phoenix Score, ensuring optimal training stimulus while preventing overreaching.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Recovery Optimization
                  </h4>
                  <p className="text-green-700 text-sm">
                    Low scores trigger recovery-focused sessions and lifestyle recommendations to accelerate your return to peak readiness.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}