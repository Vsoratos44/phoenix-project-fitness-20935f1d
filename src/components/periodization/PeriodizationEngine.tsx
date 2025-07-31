/**
 * Phoenix Protocol Periodization Engine
 * 
 * Automated progression system implementing all three periodization models:
 * - Linear: Volume → Strength progression 
 * - Undulating: Daily/weekly variation
 * - Block: Concentrated adaptation phases
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  BarChart3,
  Zap,
  Activity,
  Timer
} from "lucide-react";

interface PeriodizationPhase {
  id: string;
  name: string;
  duration: number; // weeks
  intensityRange: [number, number]; // % 1RM
  volumeMultiplier: number;
  repRange: [number, number];
  setsRange: [number, number];
  restPeriods: number; // seconds
  focus: string;
  description: string;
}

interface TrainingCycle {
  id: string;
  name: string;
  model: 'linear' | 'undulating' | 'block';
  totalWeeks: number;
  currentWeek: number;
  currentPhase: string;
  phases: PeriodizationPhase[];
  startDate: Date;
  athlete: {
    level: 'beginner' | 'intermediate' | 'advanced';
    oneRepMaxes: Record<string, number>;
    trainingAge: number; // years
  };
}

const PeriodizationEngine = () => {
  const [currentCycle, setCurrentCycle] = useState<TrainingCycle | null>(null);
  const [selectedModel, setSelectedModel] = useState<'linear' | 'undulating' | 'block'>('linear');
  
  // Sample training cycles with complete data
  const trainingCycles: Record<string, TrainingCycle> = {
    linear: {
      id: 'linear-cycle-1',
      name: 'Linear Periodization - Strength Development',
      model: 'linear',
      totalWeeks: 12,
      currentWeek: 3,
      currentPhase: 'hypertrophy',
      startDate: new Date('2024-01-15'),
      athlete: {
        level: 'intermediate',
        oneRepMaxes: { squat: 275, bench: 225, deadlift: 315, press: 135 },
        trainingAge: 2.5
      },
      phases: [
        {
          id: 'hypertrophy',
          name: 'Hypertrophy Phase',
          duration: 4,
          intensityRange: [67, 80],
          volumeMultiplier: 1.3,
          repRange: [8, 12],
          setsRange: [3, 5],
          restPeriods: 60,
          focus: 'Muscle growth and work capacity',
          description: 'High volume training to build muscle mass and work capacity foundation'
        },
        {
          id: 'strength',
          name: 'Strength Phase', 
          duration: 4,
          intensityRange: [80, 90],
          volumeMultiplier: 1.0,
          repRange: [4, 6],
          setsRange: [4, 6],
          restPeriods: 180,
          focus: 'Maximal strength development',
          description: 'Progressive overload with heavier weights and lower volume'
        },
        {
          id: 'peak',
          name: 'Peaking Phase',
          duration: 4, 
          intensityRange: [90, 100],
          volumeMultiplier: 0.7,
          repRange: [1, 3],
          setsRange: [2, 4],
          restPeriods: 300,
          focus: 'Peak strength expression',
          description: 'Competition preparation with maximal loads and reduced volume'
        }
      ]
    },
    undulating: {
      id: 'undulating-cycle-1',
      name: 'Daily Undulating Periodization',
      model: 'undulating',
      totalWeeks: 8,
      currentWeek: 2,
      currentPhase: 'strength',
      startDate: new Date('2024-01-08'),
      athlete: {
        level: 'advanced',
        oneRepMaxes: { squat: 365, bench: 285, deadlift: 425, press: 185 },
        trainingAge: 5
      },
      phases: [
        {
          id: 'strength',
          name: 'Strength Day',
          duration: 1, // daily rotation
          intensityRange: [85, 92],
          volumeMultiplier: 0.9,
          repRange: [3, 5],
          setsRange: [4, 6],
          restPeriods: 240,
          focus: 'Neural adaptation',
          description: 'Heavy loads for strength development'
        },
        {
          id: 'hypertrophy',
          name: 'Hypertrophy Day',
          duration: 1,
          intensityRange: [70, 80],
          volumeMultiplier: 1.2,
          repRange: [8, 12],
          setsRange: [3, 5],
          restPeriods: 90,
          focus: 'Muscle growth',
          description: 'Moderate loads with higher volume'
        },
        {
          id: 'power',
          name: 'Power Day',
          duration: 1,
          intensityRange: [45, 65],
          volumeMultiplier: 0.7,
          repRange: [3, 6],
          setsRange: [5, 8],
          restPeriods: 180,
          focus: 'Explosive movement',
          description: 'Light loads moved with maximal velocity'
        }
      ]
    },
    block: {
      id: 'block-cycle-1',
      name: 'Block Periodization - Competition Prep',
      model: 'block',
      totalWeeks: 12,
      currentWeek: 5,
      currentPhase: 'transmutation',
      startDate: new Date('2024-01-01'),
      athlete: {
        level: 'advanced',
        oneRepMaxes: { squat: 405, bench: 315, deadlift: 485, press: 205 },
        trainingAge: 7
      },
      phases: [
        {
          id: 'accumulation',
          name: 'Accumulation Block',
          duration: 4,
          intensityRange: [65, 75],
          volumeMultiplier: 1.5,
          repRange: [10, 15],
          setsRange: [4, 6],
          restPeriods: 90,
          focus: 'Volume accumulation',
          description: 'High volume training to build work capacity and technique'
        },
        {
          id: 'transmutation',
          name: 'Transmutation Block',
          duration: 4,
          intensityRange: [80, 90],
          volumeMultiplier: 1.0,
          repRange: [4, 8],
          setsRange: [3, 5],
          restPeriods: 180,
          focus: 'Strength conversion',
          description: 'Convert accumulated volume into strength gains'
        },
        {
          id: 'realization',
          name: 'Realization Block',
          duration: 4,
          intensityRange: [90, 105],
          volumeMultiplier: 0.6,
          repRange: [1, 3],
          setsRange: [2, 4],
          restPeriods: 300,
          focus: 'Peak performance',
          description: 'Realize maximum strength potential with competition loads'
        }
      ]
    }
  };

  useEffect(() => {
    setCurrentCycle(trainingCycles[selectedModel]);
  }, [selectedModel]);

  const getCurrentPhase = (): PeriodizationPhase | null => {
    if (!currentCycle) return null;

    if (currentCycle.model === 'undulating') {
      // For undulating, rotate through phases daily
      const dayOfWeek = new Date().getDay();
      const phaseIndex = dayOfWeek % 3; // 3 phases cycling
      return currentCycle.phases[phaseIndex];
    }

    // For linear and block, find phase based on current week
    let weekCounter = 0;
    for (const phase of currentCycle.phases) {
      weekCounter += phase.duration;
      if (currentCycle.currentWeek <= weekCounter) {
        return phase;
      }
    }
    
    return currentCycle.phases[currentCycle.phases.length - 1];
  };

  const calculateWorkoutVariables = (phase: PeriodizationPhase, exercise: string) => {
    if (!currentCycle) return null;

    const oneRM = currentCycle.athlete.oneRepMaxes[exercise] || 200;
    const minIntensity = phase.intensityRange[0];
    const maxIntensity = phase.intensityRange[1];
    
    // Progressive overload within phase
    const weekInPhase = currentCycle.currentWeek % phase.duration || phase.duration;
    const progressionFactor = weekInPhase / phase.duration;
    const targetIntensity = minIntensity + (maxIntensity - minIntensity) * progressionFactor;
    
    const targetWeight = Math.round((oneRM * targetIntensity / 100) / 5) * 5; // Round to nearest 5lbs
    const targetReps = Math.round(phase.repRange[0] + (phase.repRange[1] - phase.repRange[0]) * (1 - progressionFactor));
    const targetSets = Math.round(phase.setsRange[0] + (phase.setsRange[1] - phase.setsRange[0]) * progressionFactor);

    return {
      weight: targetWeight,
      reps: targetReps,
      sets: targetSets,
      intensity: Math.round(targetIntensity),
      restPeriods: phase.restPeriods
    };
  };

  const getPhaseProgress = (): number => {
    if (!currentCycle) return 0;
    
    if (currentCycle.model === 'undulating') {
      return (currentCycle.currentWeek / currentCycle.totalWeeks) * 100;
    }

    const currentPhase = getCurrentPhase();
    if (!currentPhase) return 0;

    let phaseStartWeek = 1;
    for (const phase of currentCycle.phases) {
      if (phase.id === currentPhase.id) break;
      phaseStartWeek += phase.duration;
    }

    const weekInPhase = currentCycle.currentWeek - phaseStartWeek + 1;
    return (weekInPhase / currentPhase.duration) * 100;
  };

  const currentPhase = getCurrentPhase();
  const squatVariables = calculateWorkoutVariables(currentPhase!, 'squat');
  const benchVariables = calculateWorkoutVariables(currentPhase!, 'bench');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Periodization Engine</h1>
          <p className="text-muted-foreground">
            Automated progression based on evidence-based periodization models
          </p>
        </div>
        
        <Select value={selectedModel} onValueChange={(value: any) => setSelectedModel(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linear">Linear Model</SelectItem>
            <SelectItem value="undulating">Undulating Model</SelectItem>
            <SelectItem value="block">Block Model</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {currentCycle && (
        <>
          {/* Current Cycle Overview */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-fitness-orange/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {currentCycle.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{currentCycle.currentWeek}</div>
                  <div className="text-sm text-muted-foreground">Week {currentCycle.currentWeek} of {currentCycle.totalWeeks}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-fitness-orange">{currentPhase?.name}</div>
                  <div className="text-sm text-muted-foreground">Current Phase</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-fitness-green-electric">{currentCycle.athlete.level}</div>
                  <div className="text-sm text-muted-foreground">Athlete Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{currentCycle.athlete.trainingAge}y</div>
                  <div className="text-sm text-muted-foreground">Training Age</div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Cycle Progress</span>
                  <span>{Math.round((currentCycle.currentWeek / currentCycle.totalWeeks) * 100)}%</span>
                </div>
                <Progress value={(currentCycle.currentWeek / currentCycle.totalWeeks) * 100} />
              </div>
            </CardContent>
          </Card>

          {/* Current Phase Details */}
          {currentPhase && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {currentPhase.name} - Week {currentCycle.currentWeek}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{currentPhase.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="font-bold">{currentPhase.intensityRange[0]}-{currentPhase.intensityRange[1]}%</div>
                    <div className="text-xs text-muted-foreground">Intensity</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="font-bold">{currentPhase.repRange[0]}-{currentPhase.repRange[1]}</div>
                    <div className="text-xs text-muted-foreground">Reps</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="font-bold">{currentPhase.setsRange[0]}-{currentPhase.setsRange[1]}</div>
                    <div className="text-xs text-muted-foreground">Sets</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="font-bold">{Math.round(currentPhase.restPeriods / 60)}min</div>
                    <div className="text-xs text-muted-foreground">Rest</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="font-bold">{currentPhase.volumeMultiplier}x</div>
                    <div className="text-xs text-muted-foreground">Volume</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Phase Progress</span>
                    <span>{Math.round(getPhaseProgress())}%</span>
                  </div>
                  <Progress value={getPhaseProgress()} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Today's Prescribed Workouts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Today's Squat Prescription</CardTitle>
              </CardHeader>
              <CardContent>
                {squatVariables && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                      <span className="font-medium">Weight:</span>
                      <span className="text-xl font-bold text-primary">{squatVariables.weight}lbs</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="font-bold">{squatVariables.sets}</div>
                        <div className="text-xs text-muted-foreground">Sets</div>
                      </div>
                      <div>
                        <div className="font-bold">{squatVariables.reps}</div>
                        <div className="text-xs text-muted-foreground">Reps</div>
                      </div>
                      <div>
                        <div className="font-bold">{squatVariables.intensity}%</div>
                        <div className="text-xs text-muted-foreground">1RM</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="w-full justify-center">
                      Rest: {Math.round(squatVariables.restPeriods / 60)} minutes
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Bench Prescription</CardTitle>
              </CardHeader>
              <CardContent>
                {benchVariables && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-fitness-orange/5 rounded-lg">
                      <span className="font-medium">Weight:</span>
                      <span className="text-xl font-bold text-fitness-orange">{benchVariables.weight}lbs</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="font-bold">{benchVariables.sets}</div>
                        <div className="text-xs text-muted-foreground">Sets</div>
                      </div>
                      <div>
                        <div className="font-bold">{benchVariables.reps}</div>
                        <div className="text-xs text-muted-foreground">Reps</div>
                      </div>
                      <div>
                        <div className="font-bold">{benchVariables.intensity}%</div>
                        <div className="text-xs text-muted-foreground">1RM</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="w-full justify-center">
                      Rest: {Math.round(benchVariables.restPeriods / 60)} minutes
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Phase Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Training Phases Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentCycle.phases.map((phase, index) => {
                  const isActive = phase.id === currentPhase?.id;
                  const isCompleted = currentCycle.phases.findIndex(p => p.id === currentPhase?.id) > index;
                  
                  return (
                    <div 
                      key={phase.id}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        isActive ? 'border-primary bg-primary/5' : 
                        isCompleted ? 'border-green-200 bg-green-50' : 
                        'border-muted bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{phase.name}</h4>
                          <p className="text-sm text-muted-foreground">{phase.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={isActive ? 'default' : isCompleted ? 'secondary' : 'outline'}>
                            {phase.duration} weeks
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {phase.focus}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default PeriodizationEngine;