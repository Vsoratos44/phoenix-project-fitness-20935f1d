import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Flame, 
  Heart, 
  Moon, 
  Zap, 
  Brain, 
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Calendar,
  Save
} from "lucide-react";

interface PhoenixScoreFactors {
  sleep_quality: number;
  stress_level: number;
  energy_level: number;
  muscle_soreness: number;
  motivation: number;
  resting_heart_rate?: number;
  hrv_score?: number;
  training_load: number;
}

interface PhoenixScoreData {
  overall_score: number;
  sleep_score: number;
  recovery_score: number;
  stress_score: number;
  nutrition_score: number;
  training_load_score: number;
  hrv_score?: number;
  factors: PhoenixScoreFactors;
  suggested_intensity: string;
  recommendation: string;
  date: string;
}

export default function AdvancedPhoenixScore() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [phoenixScore, setPhoenixScore] = useState<PhoenixScoreData | null>(null);
  const [factors, setFactors] = useState<PhoenixScoreFactors>({
    sleep_quality: 7,
    stress_level: 3,
    energy_level: 7,
    muscle_soreness: 3,
    motivation: 8,
    resting_heart_rate: 65,
    training_load: 5
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [historicalScores, setHistoricalScores] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadTodaysScore();
      loadHistoricalScores();
    }
  }, [user]);

  const loadTodaysScore = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('phoenix_scores')
        .select('*')
        .eq('user_id', user?.id)
        .eq('date', today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPhoenixScore(data);
        if (data.factors) {
          setFactors(data.factors);
        }
      }
    } catch (error) {
      console.error('Error loading Phoenix Score:', error);
    }
  };

  const loadHistoricalScores = async () => {
    try {
      const { data, error } = await supabase
        .from('phoenix_scores')
        .select('date, overall_score, suggested_intensity')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;
      setHistoricalScores(data || []);
    } catch (error) {
      console.error('Error loading historical scores:', error);
    }
  };

  const calculatePhoenixScore = async () => {
    if (!user) return;

    setIsCalculating(true);
    try {
      // Advanced Phoenix Score Algorithm
      const sleepScore = Math.min(100, factors.sleep_quality * 12);
      const recoveryScore = Math.max(0, 100 - (factors.muscle_soreness * 15));
      const stressScore = Math.max(0, 100 - (factors.stress_level * 12));
      const energyScore = factors.energy_level * 12;
      const motivationScore = factors.motivation * 10;
      
      // Training load impact (recent sessions)
      const { data: recentSessions } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('start_time', { ascending: false });

      let trainingLoadScore = 75; // Base score
      if (recentSessions) {
        const sessionCount = recentSessions.length;
        const avgDuration = recentSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / sessionCount;
        
        if (sessionCount > 5) trainingLoadScore -= 15; // Overtraining risk
        else if (sessionCount < 2) trainingLoadScore -= 10; // Detraining risk
        else trainingLoadScore += 5; // Optimal frequency
        
        if (avgDuration > 90) trainingLoadScore -= 10; // Long sessions
      }

      // HRV Score calculation (if available)
      let hrvScore = factors.hrv_score;
      if (factors.resting_heart_rate) {
        // Estimate HRV based on RHR (simplified)
        const normalRHR = 60;
        const hrvEstimate = Math.max(20, Math.min(80, 50 + (normalRHR - factors.resting_heart_rate) * 2));
        hrvScore = hrvEstimate;
      }

      // Weighted overall score
      const overallScore = Math.round(
        (sleepScore * 0.25) +
        (recoveryScore * 0.20) +
        (stressScore * 0.15) +
        (energyScore * 0.15) +
        (motivationScore * 0.10) +
        (trainingLoadScore * 0.15)
      );

      // Generate recommendations
      let suggestedIntensity = 'moderate';
      let recommendation = '';

      if (overallScore >= 85) {
        suggestedIntensity = 'high';
        recommendation = '🔥 Peak performance day! Push your limits with high-intensity training.';
      } else if (overallScore >= 70) {
        suggestedIntensity = 'moderate-high';
        recommendation = '💪 Solid energy levels. Perfect for strength training or challenging workouts.';
      } else if (overallScore >= 55) {
        suggestedIntensity = 'moderate';
        recommendation = '⚖️ Balanced energy. Stick to moderate intensity and focus on technique.';
      } else if (overallScore >= 40) {
        suggestedIntensity = 'low-moderate';
        recommendation = '🧘 Lower energy today. Consider lighter training or skill work.';
      } else {
        suggestedIntensity = 'recovery';
        recommendation = '🌱 Recovery mode activated. Prioritize rest, mobility, and gentle movement.';
      }

      const scoreData: PhoenixScoreData = {
        overall_score: overallScore,
        sleep_score: Math.round(sleepScore),
        recovery_score: Math.round(recoveryScore),
        stress_score: Math.round(stressScore),
        nutrition_score: 75, // Would be calculated from nutrition logs
        training_load_score: Math.round(trainingLoadScore),
        hrv_score: hrvScore,
        factors,
        suggested_intensity: suggestedIntensity,
        recommendation,
        date: new Date().toISOString().split('T')[0]
      };

      // Save to database
      const { error } = await supabase
        .from('phoenix_scores')
        .upsert({
          user_id: user.id,
          date: scoreData.date,
          overall_score: scoreData.overall_score,
          sleep_score: scoreData.sleep_score,
          recovery_score: scoreData.recovery_score,
          stress_score: scoreData.stress_score,
          nutrition_score: scoreData.nutrition_score,
          training_load_score: scoreData.training_load_score,
          hrv_score: scoreData.hrv_score,
          factors: scoreData.factors,
          suggested_intensity: scoreData.suggested_intensity,
          recommendation: scoreData.recommendation
        });

      if (error) throw error;

      setPhoenixScore(scoreData);
      
      toast({
        title: "🔥 Phoenix Score Calculated!",
        description: `Your readiness score is ${overallScore}. ${recommendation.split('.')[0]}.`
      });

      await loadHistoricalScores();

    } catch (error) {
      console.error('Error calculating Phoenix Score:', error);
      toast({
        title: "Calculation Failed",
        description: "There was an error calculating your Phoenix Score.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 55) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 85) return "from-green-500 to-emerald-600";
    if (score >= 70) return "from-blue-500 to-cyan-600";
    if (score >= 55) return "from-yellow-500 to-amber-600";
    if (score >= 40) return "from-orange-500 to-red-500";
    return "from-red-500 to-rose-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Phoenix Readiness Score
        </h1>
        <p className="text-muted-foreground">
          Advanced biometric assessment for optimal training prescription
        </p>
      </div>

      {/* Current Score Display */}
      {phoenixScore && (
        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Flame className="h-6 w-6 text-orange-600" />
              Today's Phoenix Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Score */}
            <div className="text-center space-y-4">
              <div className={`text-6xl font-bold bg-gradient-to-r ${getScoreGradient(phoenixScore.overall_score)} bg-clip-text text-transparent`}>
                {phoenixScore.overall_score}
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {phoenixScore.suggested_intensity.toUpperCase()}
              </Badge>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {phoenixScore.recommendation}
              </p>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center space-y-2">
                <Moon className="h-6 w-6 mx-auto text-blue-600" />
                <div className="font-bold text-lg">{phoenixScore.sleep_score}</div>
                <div className="text-sm text-muted-foreground">Sleep</div>
              </div>
              <div className="text-center space-y-2">
                <Heart className="h-6 w-6 mx-auto text-green-600" />
                <div className="font-bold text-lg">{phoenixScore.recovery_score}</div>
                <div className="text-sm text-muted-foreground">Recovery</div>
              </div>
              <div className="text-center space-y-2">
                <Brain className="h-6 w-6 mx-auto text-purple-600" />
                <div className="font-bold text-lg">{phoenixScore.stress_score}</div>
                <div className="text-sm text-muted-foreground">Stress</div>
              </div>
              <div className="text-center space-y-2">
                <Zap className="h-6 w-6 mx-auto text-yellow-600" />
                <div className="font-bold text-lg">{phoenixScore.training_load_score}</div>
                <div className="text-sm text-muted-foreground">Training Load</div>
              </div>
              <div className="text-center space-y-2">
                <Activity className="h-6 w-6 mx-auto text-red-600" />
                <div className="font-bold text-lg">{phoenixScore.hrv_score || 'N/A'}</div>
                <div className="text-sm text-muted-foreground">HRV</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Daily Assessment
          </CardTitle>
          <CardDescription>
            Rate how you're feeling today to calculate your Phoenix Score
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sleep Quality */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-blue-600" />
                Sleep Quality
              </Label>
              <Badge variant="outline">{factors.sleep_quality}/10</Badge>
            </div>
            <Slider
              value={[factors.sleep_quality]}
              onValueChange={(value) => setFactors(prev => ({ ...prev, sleep_quality: value[0] }))}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Poor</span>
              <span>Average</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Stress Level */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600" />
                Stress Level
              </Label>
              <Badge variant="outline">{factors.stress_level}/10</Badge>
            </div>
            <Slider
              value={[factors.stress_level]}
              onValueChange={(value) => setFactors(prev => ({ ...prev, stress_level: value[0] }))}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Very Relaxed</span>
              <span>Moderate</span>
              <span>Very Stressed</span>
            </div>
          </div>

          {/* Energy Level */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                Energy Level
              </Label>
              <Badge variant="outline">{factors.energy_level}/10</Badge>
            </div>
            <Slider
              value={[factors.energy_level]}
              onValueChange={(value) => setFactors(prev => ({ ...prev, energy_level: value[0] }))}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Exhausted</span>
              <span>Moderate</span>
              <span>Energized</span>
            </div>
          </div>

          {/* Muscle Soreness */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-600" />
                Muscle Soreness
              </Label>
              <Badge variant="outline">{factors.muscle_soreness}/10</Badge>
            </div>
            <Slider
              value={[factors.muscle_soreness]}
              onValueChange={(value) => setFactors(prev => ({ ...prev, muscle_soreness: value[0] }))}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>No Soreness</span>
              <span>Moderate</span>
              <span>Very Sore</span>
            </div>
          </div>

          {/* Motivation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Motivation to Train
              </Label>
              <Badge variant="outline">{factors.motivation}/10</Badge>
            </div>
            <Slider
              value={[factors.motivation]}
              onValueChange={(value) => setFactors(prev => ({ ...prev, motivation: value[0] }))}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>No Motivation</span>
              <span>Moderate</span>
              <span>Highly Motivated</span>
            </div>
          </div>

          {/* Optional Biometrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rhr">Resting Heart Rate (optional)</Label>
              <Input
                id="rhr"
                type="number"
                placeholder="65"
                value={factors.resting_heart_rate || ''}
                onChange={(e) => setFactors(prev => ({ 
                  ...prev, 
                  resting_heart_rate: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hrv">HRV Score (optional)</Label>
              <Input
                id="hrv"
                type="number"
                placeholder="45"
                value={factors.hrv_score || ''}
                onChange={(e) => setFactors(prev => ({ 
                  ...prev, 
                  hrv_score: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
              />
            </div>
          </div>

          <Button 
            onClick={calculatePhoenixScore}
            disabled={isCalculating || !user}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            size="lg"
          >
            {isCalculating ? (
              <>
                <Activity className="mr-2 h-4 w-4 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Calculate Phoenix Score
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Historical Trends */}
      {historicalScores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Score History
            </CardTitle>
            <CardDescription>
              Track your readiness trends over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {historicalScores.slice(0, 7).map((score, index) => (
                <div key={score.date} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {new Date(score.date).toLocaleDateString()}
                      {index === 0 && ' (Today)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={getScoreColor(score.overall_score)}>
                      {score.suggested_intensity}
                    </Badge>
                    <span className={`text-lg font-bold ${getScoreColor(score.overall_score)}`}>
                      {score.overall_score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}