import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target,
  TrendingUp,
  Brain,
  Heart,
  Moon,
  Utensils,
  Activity,
  ChevronRight,
  Lightbulb
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface PhoenixScore {
  id: string;
  date: string;
  overall_score: number;
  recovery_score: number;
  sleep_score: number;
  nutrition_score: number;
  training_load_score: number;
  stress_score: number;
  hrv_score: number;
  recommendation: string;
  suggested_intensity: string;
  factors: any;
}

export default function PhoenixScorePage() {
  const { user } = useAuth();
  const [currentScore, setCurrentScore] = useState<PhoenixScore | null>(null);
  const [historicalScores, setHistoricalScores] = useState<PhoenixScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPhoenixScores();
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

      if (data && data.length > 0) {
        setCurrentScore(data[0]);
        setHistoricalScores(data);
      }
    } catch (error) {
      console.error('Error loading Phoenix scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-green-100 border-green-200";
    if (score >= 60) return "bg-yellow-100 border-yellow-200";
    return "bg-red-100 border-red-200";
  };

  if (loading) {
    return <div className="p-6">Loading Phoenix Score analysis...</div>;
  }

  if (!currentScore) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Phoenix Score Yet</h3>
              <p className="text-muted-foreground mb-4">
                Your Phoenix Score will be calculated after your first few workouts and health data inputs.
              </p>
              <Button>Complete Your First Workout</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Phoenix Score Analysis</h1>
        <p className="text-muted-foreground">
          Your comprehensive fitness and wellness assessment for {new Date(currentScore.date).toLocaleDateString()}
        </p>
      </div>

      {/* Current Score Overview */}
      <Card className={`relative overflow-hidden border-2 ${getScoreBackground(currentScore.overall_score)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6" />
                Current Phoenix Score
              </CardTitle>
              <CardDescription>
                Based on your recent activity, recovery, and health metrics
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              Today
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 mb-4">
            <div className={`text-6xl font-bold ${getScoreColor(currentScore.overall_score)}`}>
              {currentScore.overall_score}
            </div>
            <div className="text-muted-foreground mb-2">
              <div className="text-sm">Suggested Intensity</div>
              <div className="font-semibold text-lg">{currentScore.suggested_intensity}</div>
            </div>
          </div>
          <Progress value={currentScore.overall_score} className="h-3 mb-4" />
          <div className="bg-white/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              AI Recommendation
            </h4>
            <p className="text-sm">{currentScore.recommendation}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="breakdown" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="breakdown">Score Breakdown</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Moon className="h-4 w-4 text-blue-600" />
                  Recovery Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(currentScore.recovery_score || 0)}`}>
                  {currentScore.recovery_score || 0}
                </div>
                <Progress value={currentScore.recovery_score || 0} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Based on sleep quality and HRV
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-red-500" />
                  Sleep Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(currentScore.sleep_score || 0)}`}>
                  {currentScore.sleep_score || 0}
                </div>
                <Progress value={currentScore.sleep_score || 0} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Duration and quality assessment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Utensils className="h-4 w-4 text-green-600" />
                  Nutrition Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(currentScore.nutrition_score || 0)}`}>
                  {currentScore.nutrition_score || 0}
                </div>
                <Progress value={currentScore.nutrition_score || 0} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Macro and micro nutrient balance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4 text-orange-600" />
                  Training Load
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(currentScore.training_load_score || 0)}`}>
                  {currentScore.training_load_score || 0}
                </div>
                <Progress value={currentScore.training_load_score || 0} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Exercise intensity and volume
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Brain className="h-4 w-4 text-purple-600" />
                  Stress Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(currentScore.stress_score || 0)}`}>
                  {currentScore.stress_score || 0}
                </div>
                <Progress value={currentScore.stress_score || 0} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Mental and physical stress levels
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-pink-600" />
                  HRV Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(currentScore.hrv_score || 0)}`}>
                  {currentScore.hrv_score || 0}
                </div>
                <Progress value={currentScore.hrv_score || 0} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Heart rate variability trends
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                30-Day Phoenix Score Trend
              </CardTitle>
              <CardDescription>
                Track your overall wellness trajectory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {historicalScores.slice(0, 7).map((score, index) => (
                  <div key={score.id} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium">
                        {new Date(score.date).toLocaleDateString()}
                      </div>
                  <Badge variant="outline">
                    {score.suggested_intensity}
                  </Badge>
                    </div>
                    <div className={`text-lg font-bold ${getScoreColor(score.overall_score)}`}>
                      {score.overall_score}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Improvement Opportunities</CardTitle>
              <CardDescription>
                AI-powered suggestions to boost your Phoenix Score
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Sleep Optimization</h4>
                <p className="text-sm text-blue-800">
                  Your sleep score could be improved by maintaining a consistent bedtime. 
                  Try going to bed 30 minutes earlier for better recovery.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">Nutrition Balance</h4>
                <p className="text-sm text-green-800">
                  Consider increasing your protein intake by 20g to support your training load 
                  and improve recovery scores.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                <h4 className="font-semibold text-orange-900 mb-2">Active Recovery</h4>
                <p className="text-sm text-orange-800">
                  Adding 1-2 light activity days (yoga, walking) could help optimize your 
                  training load balance.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}