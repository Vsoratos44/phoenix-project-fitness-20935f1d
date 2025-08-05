import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Brain, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  Clock,
  Zap,
  Users,
  Trophy,
  Heart
} from "lucide-react";

interface PerformanceAnalytics {
  user_id: string;
  exercise_id: string;
  exercise_name: string;
  performance_trend: 'improving' | 'stable' | 'declining';
  volume_progression: number; // percentage change
  strength_progression: number; // percentage change
  consistency_score: number; // 0-100
  plateau_risk: 'low' | 'medium' | 'high';
  recommended_actions: string[];
  last_analysis_date: string;
}

interface WorkoutEffectiveness {
  workout_id: string;
  workout_name: string;
  effectiveness_score: number; // 0-100
  energy_cost: number; // 1-10
  recovery_impact: number; // 1-10
  adaptation_stimulus: number; // 1-10
  user_satisfaction: number; // 1-5
  completion_rate: number; // 0-100
  rpe_accuracy: number; // how close actual vs predicted RPE
}

interface RecoveryPatterns {
  user_id: string;
  typical_recovery_time: number; // hours
  recovery_variability: number; // coefficient of variation
  optimal_training_frequency: number; // days per week
  fatigue_accumulation_rate: number; // 1-10
  recovery_accelerators: string[]; // what helps recovery
  recovery_inhibitors: string[]; // what hurts recovery
}

interface PlateuDetection {
  exercise_id: string;
  exercise_name: string;
  plateau_detected: boolean;
  plateau_duration_weeks: number;
  plateau_confidence: number; // 0-1
  likely_causes: string[];
  breakthrough_strategies: string[];
  alternative_exercises: string[];
}

export function AdvancedAnalyticsEngine() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [performanceAnalytics, setPerformanceAnalytics] = useState<PerformanceAnalytics[]>([]);
  const [workoutEffectiveness, setWorkoutEffectiveness] = useState<WorkoutEffectiveness[]>([]);
  const [recoveryPatterns, setRecoveryPatterns] = useState<RecoveryPatterns | null>(null);
  const [plateauDetection, setPlateauDetection] = useState<PlateuDetection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnalytics, setSelectedAnalytics] = useState<'performance' | 'effectiveness' | 'recovery' | 'plateau'>('performance');

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user]);

  const loadAnalyticsData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Mock data for advanced analytics
      const mockPerformance: PerformanceAnalytics[] = [
        {
          user_id: user.id,
          exercise_id: 'squat',
          exercise_name: 'Back Squat',
          performance_trend: 'improving',
          volume_progression: 12.5,
          strength_progression: 8.3,
          consistency_score: 87,
          plateau_risk: 'low',
          recommended_actions: [
            'Continue current progression',
            'Focus on technique refinement',
            'Add pause squats for strength'
          ],
          last_analysis_date: '2024-08-05'
        },
        {
          user_id: user.id,
          exercise_id: 'bench',
          exercise_name: 'Bench Press',
          performance_trend: 'stable',
          volume_progression: 2.1,
          strength_progression: 1.8,
          consistency_score: 92,
          plateau_risk: 'medium',
          recommended_actions: [
            'Implement pause bench press',
            'Add accessory chest work',
            'Consider deload week'
          ],
          last_analysis_date: '2024-08-05'
        },
        {
          user_id: user.id,
          exercise_id: 'deadlift',
          exercise_name: 'Deadlift',
          performance_trend: 'declining',
          volume_progression: -3.2,
          strength_progression: -1.5,
          consistency_score: 76,
          plateau_risk: 'high',
          recommended_actions: [
            'Reduce training frequency',
            'Focus on technique',
            'Add deficit deadlifts',
            'Improve hip mobility'
          ],
          last_analysis_date: '2024-08-05'
        }
      ];

      const mockEffectiveness: WorkoutEffectiveness[] = [
        {
          workout_id: 'push_1',
          workout_name: 'Push Workout A',
          effectiveness_score: 85,
          energy_cost: 7,
          recovery_impact: 6,
          adaptation_stimulus: 8,
          user_satisfaction: 4,
          completion_rate: 95,
          rpe_accuracy: 0.92
        },
        {
          workout_id: 'pull_1',
          workout_name: 'Pull Workout A',
          effectiveness_score: 78,
          energy_cost: 8,
          recovery_impact: 7,
          adaptation_stimulus: 7,
          user_satisfaction: 4,
          completion_rate: 88,
          rpe_accuracy: 0.86
        },
        {
          workout_id: 'legs_1',
          workout_name: 'Leg Workout A',
          effectiveness_score: 92,
          energy_cost: 9,
          recovery_impact: 8,
          adaptation_stimulus: 9,
          user_satisfaction: 5,
          completion_rate: 97,
          rpe_accuracy: 0.94
        }
      ];

      const mockRecovery: RecoveryPatterns = {
        user_id: user.id,
        typical_recovery_time: 36,
        recovery_variability: 0.15,
        optimal_training_frequency: 4,
        fatigue_accumulation_rate: 6,
        recovery_accelerators: [
          'adequate_sleep',
          'proper_nutrition',
          'active_recovery',
          'stress_management'
        ],
        recovery_inhibitors: [
          'poor_sleep',
          'high_stress',
          'inadequate_nutrition',
          'excessive_volume'
        ]
      };

      const mockPlateau: PlateuDetection[] = [
        {
          exercise_id: 'bench',
          exercise_name: 'Bench Press',
          plateau_detected: true,
          plateau_duration_weeks: 3,
          plateau_confidence: 0.85,
          likely_causes: [
            'Insufficient stimulus variation',
            'Technique inefficiencies',
            'Weak triceps relative to chest'
          ],
          breakthrough_strategies: [
            'Implement pause bench press',
            'Add close-grip bench press',
            'Increase training frequency',
            'Focus on tricep development'
          ],
          alternative_exercises: [
            'dumbbell_bench_press',
            'incline_barbell_press',
            'weighted_dips'
          ]
        }
      ];

      setPerformanceAnalytics(mockPerformance);
      setWorkoutEffectiveness(mockEffectiveness);
      setRecoveryPatterns(mockRecovery);
      setPlateauDetection(mockPlateau);

    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast({
        title: "Error Loading Analytics",
        description: "Unable to load performance analytics",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <BarChart3 className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderPerformanceAnalytics = () => (
    <div className="space-y-4">
      {performanceAnalytics.map((analytics, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getTrendIcon(analytics.performance_trend)}
                <CardTitle className="text-lg">{analytics.exercise_name}</CardTitle>
                <Badge variant="outline" className="capitalize">
                  {analytics.performance_trend}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getRiskColor(analytics.plateau_risk)}`} />
                <span className="text-sm capitalize">{analytics.plateau_risk} plateau risk</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-sm text-muted-foreground">Volume Progress</div>
                <div className="text-lg font-semibold">{analytics.volume_progression > 0 ? '+' : ''}{analytics.volume_progression}%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Strength Progress</div>
                <div className="text-lg font-semibold">{analytics.strength_progression > 0 ? '+' : ''}{analytics.strength_progression}%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Consistency</div>
                <div className="text-lg font-semibold">{analytics.consistency_score}%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Last Analysis</div>
                <div className="text-sm">{new Date(analytics.last_analysis_date).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Consistency Score</span>
                <span>{analytics.consistency_score}%</span>
              </div>
              <Progress value={analytics.consistency_score} />
            </div>

            <div className="bg-primary/5 rounded-lg p-3">
              <h5 className="font-medium mb-2 flex items-center">
                <Brain className="h-4 w-4 mr-2" />
                AI Recommendations
              </h5>
              <ul className="space-y-1">
                {analytics.recommended_actions.map((action, actionIndex) => (
                  <li key={actionIndex} className="text-sm flex items-start">
                    <CheckCircle className="h-3 w-3 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderWorkoutEffectiveness = () => (
    <div className="space-y-4">
      {workoutEffectiveness.map((workout, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{workout.workout_name}</CardTitle>
              <Badge variant={workout.effectiveness_score >= 80 ? 'default' : workout.effectiveness_score >= 60 ? 'secondary' : 'destructive'}>
                {workout.effectiveness_score}% Effective
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-sm text-muted-foreground">Energy Cost</div>
                <div className="text-lg font-semibold">{workout.energy_cost}/10</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Recovery Impact</div>
                <div className="text-lg font-semibold">{workout.recovery_impact}/10</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Adaptation Stimulus</div>
                <div className="text-lg font-semibold">{workout.adaptation_stimulus}/10</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Satisfaction</div>
                <div className="text-lg font-semibold">{workout.user_satisfaction}/5</div>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Completion Rate</span>
                  <span>{workout.completion_rate}%</span>
                </div>
                <Progress value={workout.completion_rate} />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>RPE Accuracy</span>
                  <span>{Math.round(workout.rpe_accuracy * 100)}%</span>
                </div>
                <Progress value={workout.rpe_accuracy * 100} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderRecoveryPatterns = () => (
    <div className="space-y-4">
      {recoveryPatterns && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Recovery Profile Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <div className="text-sm text-muted-foreground">Typical Recovery</div>
                  <div className="text-lg font-semibold">{recoveryPatterns.typical_recovery_time}h</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Optimal Frequency</div>
                  <div className="text-lg font-semibold">{recoveryPatterns.optimal_training_frequency}x/week</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Fatigue Rate</div>
                  <div className="text-lg font-semibold">{recoveryPatterns.fatigue_accumulation_rate}/10</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Variability</div>
                  <div className="text-lg font-semibold">{Math.round(recoveryPatterns.recovery_variability * 100)}%</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <h5 className="font-medium mb-2 flex items-center text-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Recovery Accelerators
                  </h5>
                  <ul className="space-y-1">
                    {recoveryPatterns.recovery_accelerators.map((accelerator, index) => (
                      <li key={index} className="text-sm text-green-600 capitalize">
                        {accelerator.replace('_', ' ')}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <h5 className="font-medium mb-2 flex items-center text-red-700">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Recovery Inhibitors
                  </h5>
                  <ul className="space-y-1">
                    {recoveryPatterns.recovery_inhibitors.map((inhibitor, index) => (
                      <li key={index} className="text-sm text-red-600 capitalize">
                        {inhibitor.replace('_', ' ')}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  const renderPlateauDetection = () => (
    <div className="space-y-4">
      {plateauDetection.map((plateau, index) => (
        <Card key={index} className={plateau.plateau_detected ? 'border-destructive' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CardTitle className="text-lg">{plateau.exercise_name}</CardTitle>
                {plateau.plateau_detected && (
                  <Badge variant="destructive">
                    Plateau Detected
                  </Badge>
                )}
              </div>
              <Badge variant="outline">
                {Math.round(plateau.plateau_confidence * 100)}% confidence
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {plateau.plateau_detected && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Plateau Duration</div>
                    <div className="text-lg font-semibold">{plateau.plateau_duration_weeks} weeks</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Detection Confidence</div>
                    <div className="text-lg font-semibold">{Math.round(plateau.plateau_confidence * 100)}%</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-destructive/5 rounded-lg p-3">
                    <h5 className="font-medium mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Likely Causes
                    </h5>
                    <ul className="space-y-1">
                      {plateau.likely_causes.map((cause, causeIndex) => (
                        <li key={causeIndex} className="text-sm flex items-start">
                          <div className="w-2 h-2 bg-destructive rounded-full mr-2 mt-1.5" />
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-primary/5 rounded-lg p-3">
                    <h5 className="font-medium mb-2 flex items-center">
                      <Zap className="h-4 w-4 mr-2" />
                      Breakthrough Strategies
                    </h5>
                    <ul className="space-y-1">
                      {plateau.breakthrough_strategies.map((strategy, strategyIndex) => (
                        <li key={strategyIndex} className="text-sm flex items-start">
                          <CheckCircle className="h-3 w-3 mr-2 mt-0.5 text-primary flex-shrink-0" />
                          {strategy}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-secondary/5 rounded-lg p-3">
                    <h5 className="font-medium mb-2 flex items-center">
                      <Activity className="h-4 w-4 mr-2" />
                      Alternative Exercises
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {plateau.alternative_exercises.map((exercise, exerciseIndex) => (
                        <Badge key={exerciseIndex} variant="outline" className="text-xs">
                          {exercise.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {!plateau.plateau_detected && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold mb-2">No Plateau Detected</h3>
                <p className="text-muted-foreground">
                  Performance is progressing normally
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="text-center">Loading advanced analytics...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Advanced Analytics Engine</h1>
        <p className="text-muted-foreground">
          AI-powered performance analysis with trend detection and optimization recommendations
        </p>
      </div>

      {/* Analytics Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={selectedAnalytics === 'performance' ? 'default' : 'outline'}
          onClick={() => setSelectedAnalytics('performance')}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Performance
        </Button>
        <Button
          variant={selectedAnalytics === 'effectiveness' ? 'default' : 'outline'}
          onClick={() => setSelectedAnalytics('effectiveness')}
        >
          <Target className="h-4 w-4 mr-2" />
          Effectiveness
        </Button>
        <Button
          variant={selectedAnalytics === 'recovery' ? 'default' : 'outline'}
          onClick={() => setSelectedAnalytics('recovery')}
        >
          <Heart className="h-4 w-4 mr-2" />
          Recovery
        </Button>
        <Button
          variant={selectedAnalytics === 'plateau' ? 'default' : 'outline'}
          onClick={() => setSelectedAnalytics('plateau')}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Plateau Detection
        </Button>
      </div>

      {/* Analytics Content */}
      <div>
        {selectedAnalytics === 'performance' && renderPerformanceAnalytics()}
        {selectedAnalytics === 'effectiveness' && renderWorkoutEffectiveness()}
        {selectedAnalytics === 'recovery' && renderRecoveryPatterns()}
        {selectedAnalytics === 'plateau' && renderPlateauDetection()}
      </div>
    </div>
  );
}