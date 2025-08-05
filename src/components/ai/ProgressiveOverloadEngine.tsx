import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Activity, 
  Zap,
  Brain,
  BarChart3,
  Settings,
  CheckCircle,
  AlertTriangle,
  Clock
} from "lucide-react";

interface ProgressiveOverloadPlan {
  id: string;
  exercise_id: string;
  exercise_name: string;
  progression_method: string;
  current_phase: string;
  base_weight: number;
  target_weight: number;
  progression_increment: number;
  current_sets: number;
  target_sets: number;
  current_reps: number;
  target_reps: number;
  target_rpe_range: { min: number; max: number };
  success_rate: number;
  weeks_since_progression: number;
  next_progression_date: string;
  deload_recommended: boolean;
}

interface PerformanceMetrics {
  exercise_id: string;
  estimated_1rm: number;
  volume_trend: 'increasing' | 'stable' | 'decreasing';
  intensity_trend: 'increasing' | 'stable' | 'decreasing';
  fatigue_pattern: 'early' | 'late' | 'consistent';
  form_degradation: boolean;
  plateau_detected: boolean;
}

export function ProgressiveOverloadEngine() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [overloadPlans, setOverloadPlans] = useState<ProgressiveOverloadPlan[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadProgressiveOverloadData();
    }
  }, [user]);

  const loadProgressiveOverloadData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Mock data for progressive overload plans
      const mockPlans: ProgressiveOverloadPlan[] = [
        {
          id: '1',
          exercise_id: 'squat',
          exercise_name: 'Back Squat',
          progression_method: 'linear',
          current_phase: 'build',
          base_weight: 100,
          target_weight: 120,
          progression_increment: 2.5,
          current_sets: 3,
          target_sets: 4,
          current_reps: 8,
          target_reps: 10,
          target_rpe_range: { min: 7, max: 9 },
          success_rate: 85,
          weeks_since_progression: 2,
          next_progression_date: '2024-08-12',
          deload_recommended: false
        },
        {
          id: '2',
          exercise_id: 'bench',
          exercise_name: 'Bench Press',
          progression_method: 'double_progression',
          current_phase: 'peak',
          base_weight: 80,
          target_weight: 90,
          progression_increment: 2.5,
          current_sets: 3,
          target_sets: 3,
          current_reps: 5,
          target_reps: 8,
          target_rpe_range: { min: 8, max: 9 },
          success_rate: 75,
          weeks_since_progression: 4,
          next_progression_date: '2024-08-10',
          deload_recommended: true
        },
        {
          id: '3',
          exercise_id: 'deadlift',
          exercise_name: 'Deadlift',
          progression_method: 'percentage_based',
          current_phase: 'base',
          base_weight: 120,
          target_weight: 140,
          progression_increment: 5,
          current_sets: 1,
          target_sets: 3,
          current_reps: 5,
          target_reps: 5,
          target_rpe_range: { min: 7, max: 8 },
          success_rate: 92,
          weeks_since_progression: 1,
          next_progression_date: '2024-08-15',
          deload_recommended: false
        }
      ];

      // Mock performance metrics
      const mockMetrics: PerformanceMetrics[] = [
        {
          exercise_id: 'squat',
          estimated_1rm: 125,
          volume_trend: 'increasing',
          intensity_trend: 'stable',
          fatigue_pattern: 'late',
          form_degradation: false,
          plateau_detected: false
        },
        {
          exercise_id: 'bench',
          estimated_1rm: 95,
          volume_trend: 'stable',
          intensity_trend: 'decreasing',
          fatigue_pattern: 'early',
          form_degradation: true,
          plateau_detected: true
        },
        {
          exercise_id: 'deadlift',
          estimated_1rm: 150,
          volume_trend: 'increasing',
          intensity_trend: 'increasing',
          fatigue_pattern: 'consistent',
          form_degradation: false,
          plateau_detected: false
        }
      ];

      setOverloadPlans(mockPlans);
      setPerformanceMetrics(mockMetrics);

    } catch (error) {
      console.error('Error loading progressive overload data:', error);
      toast({
        title: "Error Loading Data",
        description: "Unable to load progressive overload plans",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateNextProgression = (plan: ProgressiveOverloadPlan, metrics: PerformanceMetrics) => {
    const { progression_method, success_rate, weeks_since_progression } = plan;
    const { plateau_detected, form_degradation, fatigue_pattern } = metrics;

    if (plateau_detected || form_degradation) {
      return {
        action: 'deload',
        recommendation: 'Reduce load by 10% and focus on form',
        confidence: 0.9
      };
    }

    if (success_rate < 70) {
      return {
        action: 'maintain',
        recommendation: 'Practice current loads until success rate improves',
        confidence: 0.8
      };
    }

    if (weeks_since_progression >= 3 && success_rate >= 85) {
      switch (progression_method) {
        case 'linear':
          return {
            action: 'increase_weight',
            recommendation: `Add ${plan.progression_increment}kg to working weight`,
            confidence: 0.85
          };
        case 'double_progression':
          return {
            action: 'increase_reps',
            recommendation: 'Add 1-2 reps per set before increasing weight',
            confidence: 0.8
          };
        case 'percentage_based':
          return {
            action: 'increase_intensity',
            recommendation: 'Move to next percentage bracket (5% increase)',
            confidence: 0.9
          };
        default:
          return {
            action: 'maintain',
            recommendation: 'Continue current protocol',
            confidence: 0.7
          };
      }
    }

    return {
      action: 'continue',
      recommendation: 'Continue current progression for another week',
      confidence: 0.75
    };
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'base':
        return 'bg-blue-500';
      case 'build':
        return 'bg-yellow-500';
      case 'peak':
        return 'bg-red-500';
      case 'deload':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <BarChart3 className="h-4 w-4 text-yellow-500" />;
    }
  };

  const renderOverloadPlan = (plan: ProgressiveOverloadPlan) => {
    const metrics = performanceMetrics.find(m => m.exercise_id === plan.exercise_id);
    const progression = metrics ? calculateNextProgression(plan, metrics) : null;

    return (
      <Card key={plan.id} className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg">{plan.exercise_name}</CardTitle>
              <Badge variant="outline" className="capitalize">
                {plan.progression_method.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getPhaseColor(plan.current_phase)}`} />
              <span className="text-sm capitalize">{plan.current_phase} Phase</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-sm text-muted-foreground">Current Load</div>
              <div className="text-lg font-semibold">{plan.base_weight}kg</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Target Load</div>
              <div className="text-lg font-semibold">{plan.target_weight}kg</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Sets × Reps</div>
              <div className="text-lg font-semibold">{plan.current_sets} × {plan.current_reps}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
              <div className="text-lg font-semibold">{plan.success_rate}%</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progression to Target</span>
              <span>{Math.round(((plan.base_weight / plan.target_weight) * 100))}%</span>
            </div>
            <Progress value={(plan.base_weight / plan.target_weight) * 100} />
          </div>

          {metrics && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  {getTrendIcon(metrics.volume_trend)}
                  <span className="text-sm ml-1">Volume</span>
                </div>
                <div className="text-xs text-muted-foreground capitalize">{metrics.volume_trend}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  {getTrendIcon(metrics.intensity_trend)}
                  <span className="text-sm ml-1">Intensity</span>
                </div>
                <div className="text-xs text-muted-foreground capitalize">{metrics.intensity_trend}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Target className="h-4 w-4" />
                  <span className="text-sm ml-1">1RM</span>
                </div>
                <div className="text-xs text-muted-foreground">{metrics.estimated_1rm}kg</div>
              </div>
            </div>
          )}

          {/* AI Progression Recommendation */}
          {progression && (
            <div className={`p-3 rounded-lg ${
              progression.action === 'deload' ? 'bg-destructive/10' :
              progression.action === 'increase_weight' || progression.action === 'increase_reps' ? 'bg-primary/10' :
              'bg-secondary/10'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium flex items-center">
                  <Brain className="h-4 w-4 mr-2" />
                  AI Recommendation
                </h5>
                <Badge variant="outline" className="text-xs">
                  {Math.round(progression.confidence * 100)}% confidence
                </Badge>
              </div>
              <p className="text-sm">{progression.recommendation}</p>
              <div className="flex items-center mt-2">
                {progression.action === 'deload' ? (
                  <AlertTriangle className="h-3 w-3 mr-1 text-destructive" />
                ) : progression.action.includes('increase') ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-primary" />
                ) : (
                  <CheckCircle className="h-3 w-3 mr-1 text-secondary" />
                )}
                <span className="text-xs capitalize font-medium">{progression.action.replace('_', ' ')}</span>
              </div>
            </div>
          )}

          {/* Warning Indicators */}
          {metrics && (metrics.plateau_detected || metrics.form_degradation) && (
            <div className="mt-3 p-3 bg-destructive/10 rounded-lg">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-4 w-4 mr-2 text-destructive" />
                <span className="font-medium text-sm">Performance Alerts</span>
              </div>
              <ul className="text-xs space-y-1">
                {metrics.plateau_detected && (
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                    Plateau detected - consider deload or exercise variation
                  </li>
                )}
                {metrics.form_degradation && (
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                    Form degradation observed - focus on technique
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <div className="text-xs text-muted-foreground">
              Next progression: {new Date(plan.next_progression_date).toLocaleDateString()}
            </div>
            <Button size="sm" variant="outline">
              <Settings className="h-3 w-3 mr-1" />
              Adjust Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center">Loading progressive overload data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Progressive Overload Engine</h1>
        <p className="text-muted-foreground">
          AI-powered progression planning with intelligent load management and plateau detection
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="h-5 w-5 mr-2" />
              Active Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overloadPlans.length}</div>
            <p className="text-sm text-muted-foreground">exercises being tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Target className="h-5 w-5 mr-2" />
              Avg Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(overloadPlans.reduce((sum, plan) => sum + plan.success_rate, 0) / overloadPlans.length)}%
            </div>
            <p className="text-sm text-muted-foreground">across all exercises</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Deloads Needed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {overloadPlans.filter(plan => plan.deload_recommended).length}
            </div>
            <p className="text-sm text-muted-foreground">exercises need deload</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Exercise Progression Plans</h2>
        {overloadPlans.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Progression Plans</h3>
              <p className="text-muted-foreground">
                Start tracking exercises to see AI-powered progression recommendations
              </p>
            </CardContent>
          </Card>
        ) : (
          <div>
            {overloadPlans.map(renderOverloadPlan)}
          </div>
        )}
      </div>
    </div>
  );
}