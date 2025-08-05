import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  TrendingDown,
  Target,
  BarChart3,
  Calendar,
  Dumbbell,
  Zap,
  Award,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw
} from "lucide-react";

interface ProgressiveOverloadLog {
  id: string;
  exercise_id: string;
  exercise_name: string;
  previous_weight_kg: number;
  new_weight_kg: number;
  previous_reps: number;
  new_reps: number;
  progression_type: 'weight_increase' | 'rep_increase' | 'set_increase' | 'deload';
  progression_percentage: number;
  success_rate: number;
  applied_at: string;
}

interface ExerciseProgress {
  exercise_id: string;
  exercise_name: string;
  current_weight: number;
  current_reps: number;
  total_progressions: number;
  success_rate: number;
  last_progression: string;
  progression_trend: 'increasing' | 'plateauing' | 'decreasing';
  next_recommendation: string;
}

interface PerformanceMetrics {
  total_volume_increase: number;
  successful_progressions: number;
  plateau_exercises: number;
  average_progression_rate: number;
}

export default function ProgressiveOverloadTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [exerciseProgresses, setExerciseProgresses] = useState<ExerciseProgress[]>([]);
  const [recentLogs, setRecentLogs] = useState<ProgressiveOverloadLog[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgressData();
    }
  }, [user, selectedTimeframe]);

  const loadProgressData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadExerciseProgresses(),
        loadRecentLogs(),
        calculatePerformanceMetrics()
      ]);
    } catch (error) {
      console.error('Error loading progress data:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load progress data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExerciseProgresses = async () => {
    try {
      const daysAgo = parseInt(selectedTimeframe);
      const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

      // Get recent performance data with exercise details
      const { data: performanceData, error } = await supabase
        .from('exercise_performance_history')
        .select(`
          *,
          exercises!inner(name, exercise_type)
        `)
        .eq('user_id', user?.id)
        .gte('performance_date', startDate.split('T')[0])
        .order('performance_date', { ascending: false });

      if (error) throw error;

      // Group by exercise and analyze progress
      const exerciseMap = new Map<string, any[]>();
      performanceData?.forEach(performance => {
        const exerciseId = performance.exercise_id;
        if (!exerciseMap.has(exerciseId)) {
          exerciseMap.set(exerciseId, []);
        }
        exerciseMap.get(exerciseId)!.push(performance);
      });

      const progresses: ExerciseProgress[] = [];
      for (const [exerciseId, performances] of exerciseMap) {
        if (performances.length < 2) continue;

        const latest = performances[0];
        const earliest = performances[performances.length - 1];
        
        // Calculate progression trend
        const weightProgress = latest.weight_used_kg - earliest.weight_used_kg;
        const repProgress = latest.reps_completed - earliest.reps_completed;
        
        let trend: 'increasing' | 'plateauing' | 'decreasing' = 'plateauing';
        if (weightProgress > 0 || repProgress > 0) trend = 'increasing';
        else if (weightProgress < 0 || repProgress < 0) trend = 'decreasing';

        // Get progression logs for this exercise
        const { data: progressionLogs } = await supabase
          .from('progressive_overload_logs')
          .select('*')
          .eq('user_id', user?.id)
          .eq('exercise_id', exerciseId)
          .gte('applied_at', startDate);

        const successfulProgressions = progressionLogs?.filter(log => 
          log.progression_type !== 'deload'
        ).length || 0;

        const totalProgressions = progressionLogs?.length || 0;
        const successRate = totalProgressions > 0 ? (successfulProgressions / totalProgressions) * 100 : 0;

        // Generate next recommendation
        let nextRecommendation = '';
        if (trend === 'increasing' && successRate > 80) {
          nextRecommendation = 'Continue progressive overload';
        } else if (trend === 'plateauing') {
          nextRecommendation = 'Consider deload or technique focus';
        } else if (successRate < 60) {
          nextRecommendation = 'Reduce intensity, focus on form';
        } else {
          nextRecommendation = 'Maintain current progression';
        }

        progresses.push({
          exercise_id: exerciseId,
          exercise_name: latest.exercises.name,
          current_weight: latest.weight_used_kg || 0,
          current_reps: latest.reps_completed || 0,
          total_progressions: totalProgressions,
          success_rate: successRate,
          last_progression: latest.performance_date,
          progression_trend: trend,
          next_recommendation: nextRecommendation
        });
      }

      setExerciseProgresses(progresses);

    } catch (error) {
      console.error('Error loading exercise progresses:', error);
    }
  };

  const loadRecentLogs = async () => {
    try {
      const daysAgo = parseInt(selectedTimeframe);
      const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

      const { data: logs, error } = await supabase
        .from('progressive_overload_logs')
        .select(`
          *,
          exercises!inner(name)
        `)
        .eq('user_id', user?.id)
        .gte('applied_at', startDate)
        .order('applied_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedLogs: ProgressiveOverloadLog[] = logs?.map(log => ({
        id: log.id,
        exercise_id: log.exercise_id,
        exercise_name: log.exercises.name,
        previous_weight_kg: log.previous_weight_kg || 0,
        new_weight_kg: log.new_weight_kg || 0,
        previous_reps: log.previous_reps || 0,
        new_reps: log.new_reps || 0,
        progression_type: log.progression_type,
        progression_percentage: log.progression_percentage || 0,
        success_rate: log.success_rate || 0,
        applied_at: log.applied_at
      })) || [];

      setRecentLogs(formattedLogs);

    } catch (error) {
      console.error('Error loading recent logs:', error);
    }
  };

  const calculatePerformanceMetrics = async () => {
    try {
      const daysAgo = parseInt(selectedTimeframe);
      const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

      const { data: logs, error } = await supabase
        .from('progressive_overload_logs')
        .select('*')
        .eq('user_id', user?.id)
        .gte('applied_at', startDate);

      if (error) throw error;

      if (!logs || logs.length === 0) {
        setPerformanceMetrics({
          total_volume_increase: 0,
          successful_progressions: 0,
          plateau_exercises: 0,
          average_progression_rate: 0
        });
        return;
      }

      const successfulProgressions = logs.filter(log => 
        log.progression_type !== 'deload'
      ).length;

      const plateauExercises = exerciseProgresses.filter(ep => 
        ep.progression_trend === 'plateauing'
      ).length;

      const totalVolumeIncrease = logs.reduce((sum, log) => {
        if (log.progression_type === 'weight_increase') {
          return sum + (log.progression_percentage || 0);
        }
        return sum;
      }, 0);

      const averageProgressionRate = logs.length > 0 
        ? logs.reduce((sum, log) => sum + (log.progression_percentage || 0), 0) / logs.length
        : 0;

      setPerformanceMetrics({
        total_volume_increase: totalVolumeIncrease,
        successful_progressions: successfulProgressions,
        plateau_exercises: plateauExercises,
        average_progression_rate: averageProgressionRate
      });

    } catch (error) {
      console.error('Error calculating performance metrics:', error);
    }
  };

  const getProgressionIcon = (type: string) => {
    switch (type) {
      case 'weight_increase':
        return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'rep_increase':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'set_increase':
        return <BarChart3 className="h-4 w-4 text-purple-600" />;
      case 'deload':
        return <ArrowDown className="h-4 w-4 text-orange-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'decreasing':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading progressive overload data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Progressive Overload Tracker</h1>
          <p className="text-muted-foreground">
            Automated progression tracking and intelligent load management
          </p>
        </div>
        
        <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Performance Metrics */}
      {performanceMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-muted-foreground">Volume Increase</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                +{performanceMetrics.total_volume_increase.toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-muted-foreground">Successful Progressions</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {performanceMetrics.successful_progressions}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-muted-foreground">Plateau Exercises</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {performanceMetrics.plateau_exercises}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-muted-foreground">Avg Progress Rate</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {performanceMetrics.average_progression_rate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Exercise Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Exercise Progress Overview
          </CardTitle>
          <CardDescription>
            Track progression trends and get automated recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {exerciseProgresses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No exercise progress data available for the selected timeframe.</p>
              <p className="text-sm">Complete some workouts to start tracking progressive overload!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exerciseProgresses.map((progress) => (
                <div key={progress.exercise_id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{progress.exercise_name}</h3>
                      <Badge variant="outline" className={getTrendColor(progress.progression_trend)}>
                        {getTrendIcon(progress.progression_trend)}
                        <span className="ml-1 capitalize">{progress.progression_trend}</span>
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Current</div>
                      <div className="font-medium">
                        {progress.current_weight}kg × {progress.current_reps} reps
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                      <div className="flex items-center gap-2">
                        <Progress value={progress.success_rate} className="flex-1" />
                        <span className="text-sm font-medium">{progress.success_rate.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Total Progressions</div>
                      <div className="font-medium">{progress.total_progressions}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Last Progression</div>
                      <div className="font-medium">
                        {new Date(progress.last_progression).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Phoenix Recommendation</div>
                    <div className="text-sm">{progress.next_recommendation}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Progression Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Progression History
          </CardTitle>
          <CardDescription>
            Detailed log of all progressive overload applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No progression logs found for the selected timeframe.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getProgressionIcon(log.progression_type)}
                    <div>
                      <div className="font-medium">{log.exercise_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(log.applied_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium">
                      {log.progression_type === 'weight_increase' && (
                        <span>{log.previous_weight_kg}kg → {log.new_weight_kg}kg</span>
                      )}
                      {log.progression_type === 'rep_increase' && (
                        <span>{log.previous_reps} → {log.new_reps} reps</span>
                      )}
                      {log.progression_type === 'deload' && (
                        <span className="text-orange-600">Deload Applied</span>
                      )}
                    </div>
                    {log.progression_percentage > 0 && (
                      <div className="text-sm text-green-600">
                        +{log.progression_percentage.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}