import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  Dumbbell,
  Award,
  Flame,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertCircle
} from "lucide-react";

interface ExerciseProgression {
  exercise_id: string;
  exercise_name: string;
  muscle_group: string;
  latest_weight: number;
  latest_reps: number;
  latest_rpe: number;
  progression_trend: 'increasing' | 'decreasing' | 'plateau';
  sessions_trained: number;
  total_volume: number;
  estimated_1rm: number;
  progression_percentage: number;
  next_target: {
    weight?: number;
    reps?: number;
    reasoning: string;
  };
  performance_history: any[];
}

interface ProgressionAnalytics {
  total_exercises_tracked: number;
  exercises_progressing: number;
  exercises_plateaued: number;
  exercises_regressing: number;
  total_volume_increase: number;
  strength_gains_percentage: number;
  consistency_score: number;
}

export default function ProgressiveOverloadTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [progressions, setProgressions] = useState<ExerciseProgression[]>([]);
  const [analytics, setAnalytics] = useState<ProgressionAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("4_weeks");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("progression");

  useEffect(() => {
    if (user) {
      loadProgressionData();
    }
  }, [user, selectedTimeframe, selectedMuscleGroup]);

  const loadProgressionData = async () => {
    try {
      setIsLoading(true);

      // Calculate date range
      const now = new Date();
      const daysBack = selectedTimeframe === "2_weeks" ? 14 : 
                      selectedTimeframe === "4_weeks" ? 28 :
                      selectedTimeframe === "3_months" ? 90 : 28;
      
      const startDate = new Date();
      startDate.setDate(now.getDate() - daysBack);

      // Load exercise performance history
      let query = supabase
        .from('exercise_performance_history')
        .select(`
          *,
          exercises (
            id,
            name,
            muscle_group_primary,
            category
          )
        `)
        .eq('user_id', user?.id)
        .gte('performance_date', startDate.toISOString().split('T')[0])
        .order('performance_date', { ascending: false });

      const { data: performanceData, error } = await query;
      if (error) throw error;

      // Process data for progression analysis
      const exerciseGroups = groupByExercise(performanceData || []);
      const progressionData = await analyzeProgressions(exerciseGroups);
      
      // Filter by muscle group if selected
      let filteredProgressions = progressionData;
      if (selectedMuscleGroup !== "all") {
        filteredProgressions = progressionData.filter(p => 
          p.muscle_group === selectedMuscleGroup
        );
      }

      // Sort progressions
      filteredProgressions.sort((a, b) => {
        switch (sortBy) {
          case "progression":
            return b.progression_percentage - a.progression_percentage;
          case "volume":
            return b.total_volume - a.total_volume;
          case "sessions":
            return b.sessions_trained - a.sessions_trained;
          case "name":
            return a.exercise_name.localeCompare(b.exercise_name);
          default:
            return b.progression_percentage - a.progression_percentage;
        }
      });

      setProgressions(filteredProgressions);
      
      // Calculate overall analytics
      const analyticsData = calculateAnalytics(progressionData);
      setAnalytics(analyticsData);

    } catch (error) {
      console.error('Error loading progression data:', error);
      toast({
        title: "Error",
        description: "Failed to load progression data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const groupByExercise = (data: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    data.forEach(entry => {
      const exerciseId = entry.exercise_id;
      if (!groups[exerciseId]) {
        groups[exerciseId] = [];
      }
      groups[exerciseId].push(entry);
    });

    return groups;
  };

  const analyzeProgressions = async (exerciseGroups: { [key: string]: any[] }): Promise<ExerciseProgression[]> => {
    const progressions: ExerciseProgression[] = [];

    for (const [exerciseId, sessions] of Object.entries(exerciseGroups)) {
      if (sessions.length < 2) continue; // Need at least 2 sessions for progression

      // Sort sessions by date
      sessions.sort((a, b) => new Date(a.performance_date).getTime() - new Date(b.performance_date).getTime());

      const firstSession = sessions[0];
      const latestSession = sessions[sessions.length - 1];
      const exercise = latestSession.exercises;

      // Calculate volume progression
      const firstVolume = (firstSession.weight_used_kg || 0) * (firstSession.reps_completed || 0) * (firstSession.sets_completed || 1);
      const latestVolume = (latestSession.weight_used_kg || 0) * (latestSession.reps_completed || 0) * (latestSession.sets_completed || 1);
      const totalVolume = sessions.reduce((sum, session) => 
        sum + ((session.weight_used_kg || 0) * (session.reps_completed || 0) * (session.sets_completed || 1)), 0
      );

      // Calculate progression percentage
      const progressionPercentage = firstVolume > 0 ? 
        ((latestVolume - firstVolume) / firstVolume) * 100 : 0;

      // Determine trend
      let trend: 'increasing' | 'decreasing' | 'plateau' = 'plateau';
      if (progressionPercentage > 5) trend = 'increasing';
      else if (progressionPercentage < -5) trend = 'decreasing';

      // Estimate 1RM using Epley formula: 1RM = weight * (1 + reps/30)
      const estimated1rm = latestSession.weight_used_kg ? 
        latestSession.weight_used_kg * (1 + (latestSession.reps_completed || 1) / 30) : 0;

      // Calculate next target based on progression pattern
      const nextTarget = calculateNextTarget(sessions, trend);

      progressions.push({
        exercise_id: exerciseId,
        exercise_name: exercise?.name || 'Unknown Exercise',
        muscle_group: exercise?.muscle_group_primary || 'Unknown',
        latest_weight: latestSession.weight_used_kg || 0,
        latest_reps: latestSession.reps_completed || 0,
        latest_rpe: latestSession.rpe_rating || 7,
        progression_trend: trend,
        sessions_trained: sessions.length,
        total_volume: totalVolume,
        estimated_1rm: estimated1rm,
        progression_percentage: progressionPercentage,
        next_target: nextTarget,
        performance_history: sessions.map(session => ({
          date: session.performance_date,
          weight: session.weight_used_kg || 0,
          reps: session.reps_completed || 0,
          volume: (session.weight_used_kg || 0) * (session.reps_completed || 0) * (session.sets_completed || 1),
          rpe: session.rpe_rating || 7
        }))
      });
    }

    return progressions;
  };

  const calculateNextTarget = (sessions: any[], trend: string) => {
    const latestSession = sessions[sessions.length - 1];
    const currentWeight = latestSession.weight_used_kg || 0;
    const currentReps = latestSession.reps_completed || 0;
    const currentRPE = latestSession.rpe_rating || 7;

    // Phoenix AI progressive overload logic
    if (trend === 'increasing' && currentRPE <= 7) {
      // Can handle more load
      if (currentReps >= 12) {
        return {
          weight: currentWeight + 2.5,
          reps: 8,
          reasoning: "Increase weight and reduce reps for strength focus"
        };
      } else {
        return {
          reps: currentReps + 1,
          reasoning: "Add one more rep to build volume"
        };
      }
    } else if (trend === 'decreasing' || currentRPE >= 9) {
      // Need to deload
      return {
        weight: Math.max(currentWeight * 0.9, currentWeight - 5),
        reasoning: "Deload to focus on form and recovery"
      };
    } else {
      // Maintain current load
      return {
        weight: currentWeight,
        reps: currentReps,
        reasoning: "Maintain current load to build consistency"
      };
    }
  };

  const calculateAnalytics = (progressions: ExerciseProgression[]): ProgressionAnalytics => {
    const total = progressions.length;
    const progressing = progressions.filter(p => p.progression_trend === 'increasing').length;
    const plateaued = progressions.filter(p => p.progression_trend === 'plateau').length;
    const regressing = progressions.filter(p => p.progression_trend === 'decreasing').length;
    
    const avgProgressionPercentage = progressions.reduce((sum, p) => sum + p.progression_percentage, 0) / total;
    const totalVolumeIncrease = progressions.reduce((sum, p) => sum + Math.max(0, p.progression_percentage), 0);
    
    // Consistency score based on training frequency
    const avgSessions = progressions.reduce((sum, p) => sum + p.sessions_trained, 0) / total;
    const consistencyScore = Math.min(100, (avgSessions / 8) * 100); // 8 sessions as ideal for 4 weeks

    return {
      total_exercises_tracked: total,
      exercises_progressing: progressing,
      exercises_plateaued: plateaued,
      exercises_regressing: regressing,
      total_volume_increase: totalVolumeIncrease,
      strength_gains_percentage: avgProgressionPercentage,
      consistency_score: consistencyScore
    };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'plateau': return <Minus className="h-4 w-4 text-yellow-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'bg-green-100 text-green-800 border-green-200';
      case 'decreasing': return 'bg-red-100 text-red-800 border-red-200';
      case 'plateau': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Analyzing Your Progress...</h3>
            <p className="text-muted-foreground">Calculating progressive overload patterns</p>
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
          <div className="p-4 rounded-full bg-gradient-to-br from-green-100 to-blue-100">
            <TrendingUp className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Progressive Overload Tracker
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Monitor your strength gains and receive Phoenix-powered progression recommendations
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Timeframe</label>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2_weeks">Last 2 Weeks</SelectItem>
                  <SelectItem value="4_weeks">Last 4 Weeks</SelectItem>
                  <SelectItem value="3_months">Last 3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Muscle Group</label>
              <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Muscle Groups</SelectItem>
                  <SelectItem value="chest">Chest</SelectItem>
                  <SelectItem value="back">Back</SelectItem>
                  <SelectItem value="shoulders">Shoulders</SelectItem>
                  <SelectItem value="arms">Arms</SelectItem>
                  <SelectItem value="legs">Legs</SelectItem>
                  <SelectItem value="core">Core</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="progression">Progression %</SelectItem>
                  <SelectItem value="volume">Total Volume</SelectItem>
                  <SelectItem value="sessions">Sessions Trained</SelectItem>
                  <SelectItem value="name">Exercise Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{analytics.exercises_progressing}</p>
                  <p className="text-sm text-muted-foreground">Exercises Progressing</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Minus className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{analytics.exercises_plateaued}</p>
                  <p className="text-sm text-muted-foreground">Exercises Plateaued</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{analytics.consistency_score.toFixed(0)}%</p>
                  <p className="text-sm text-muted-foreground">Consistency Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Flame className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {analytics.strength_gains_percentage > 0 ? '+' : ''}{analytics.strength_gains_percentage.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Strength Gain</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Exercise Progressions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Exercise Progressions</h2>
        
        {progressions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Progression Data</h3>
              <p className="text-muted-foreground">
                Complete at least 2 workout sessions with the same exercises to see progression analysis.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {progressions.map((progression) => (
              <Card key={progression.exercise_id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Dumbbell className="h-5 w-5" />
                        {progression.exercise_name}
                        <Badge className={getTrendColor(progression.progression_trend)}>
                          {getTrendIcon(progression.progression_trend)}
                          <span className="ml-1">{progression.progression_trend}</span>
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {progression.muscle_group} • {progression.sessions_trained} sessions trained
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {progression.progression_percentage > 0 ? '+' : ''}{progression.progression_percentage.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Volume Change</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">Latest Weight</p>
                      <p className="text-lg font-bold">{progression.latest_weight}kg</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">Latest Reps</p>
                      <p className="text-lg font-bold">{progression.latest_reps}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">Est. 1RM</p>
                      <p className="text-lg font-bold">{progression.estimated_1rm.toFixed(1)}kg</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">Latest RPE</p>
                      <p className="text-lg font-bold">{progression.latest_rpe}/10</p>
                    </div>
                  </div>

                  {/* Performance Chart */}
                  {progression.performance_history.length > 1 && (
                    <div>
                      <h4 className="font-semibold mb-3">Volume Progression</h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={progression.performance_history}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={(value) => new Date(value).toLocaleDateString()}
                            />
                            <YAxis />
                            <Tooltip 
                              labelFormatter={(value) => new Date(value).toLocaleDateString()}
                              formatter={(value, name) => [
                                name === 'volume' ? `${value}kg` : value,
                                name === 'volume' ? 'Volume' : name
                              ]}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="volume" 
                              stroke="#3b82f6" 
                              strokeWidth={2}
                              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Phoenix Recommendation */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-orange-600" />
                      <h4 className="font-semibold text-orange-800">Phoenix Recommendation</h4>
                    </div>
                    <p className="text-orange-700 mb-2">{progression.next_target.reasoning}</p>
                    <div className="flex gap-4 text-sm">
                      {progression.next_target.weight && (
                        <span className="font-medium">
                          Target Weight: <span className="text-orange-800">{progression.next_target.weight}kg</span>
                        </span>
                      )}
                      {progression.next_target.reps && (
                        <span className="font-medium">
                          Target Reps: <span className="text-orange-800">{progression.next_target.reps}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}