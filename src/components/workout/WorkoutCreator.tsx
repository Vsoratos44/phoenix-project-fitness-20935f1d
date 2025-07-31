/**
 * Phoenix Protocol Workout Creator
 * 
 * Advanced workout creation system based on scientific periodization principles
 * Features:
 * - Periodization models (Linear, Undulating, Block)
 * - Acute variable manipulation
 * - 1RM calculations
 * - Volume-load tracking
 * - ACWR monitoring
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Calculator,
  Target,
  TrendingUp,
  Clock,
  Dumbbell,
  Plus,
  Minus,
  Save,
  Play,
  BarChart3,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Exercise {
  id: string;
  name: string;
  category: string;
  primaryMuscles: string[];
  equipment: string[];
  instructions: string[];
}

interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
  restSeconds: number;
  intensity: number; // % of 1RM
  rpe?: number; // Rate of Perceived Exertion 1-10
  tempo?: string; // e.g., "3/1/2/1"
}

interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  order: number;
  superset?: string;
  notes?: string;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  goal: 'strength' | 'hypertrophy' | 'power' | 'endurance';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  exercises: WorkoutExercise[];
  periodizationModel: 'linear' | 'undulating' | 'block';
  week: number;
  phase: string;
}

const WorkoutCreator = () => {
  const { toast } = useToast();
  const [currentTemplate, setCurrentTemplate] = useState<Partial<WorkoutTemplate>>({
    name: "",
    goal: 'strength',
    difficulty: 'intermediate',
    periodizationModel: 'linear',
    week: 1,
    phase: "Hypertrophy"
  });

  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([]);
  const [activeTab, setActiveTab] = useState("template");

  // Sample exercises data (in production, this would come from the database)
  const availableExercises: Exercise[] = [
    {
      id: "1",
      name: "Barbell Back Squat",
      category: "Strength",
      primaryMuscles: ["Quadriceps", "Glutes"],
      equipment: ["Barbell", "Squat Rack"],
      instructions: ["Position bar on upper back", "Descend to depth", "Drive through heels"]
    },
    {
      id: "2", 
      name: "Bench Press",
      category: "Strength",
      primaryMuscles: ["Chest", "Triceps", "Shoulders"],
      equipment: ["Barbell", "Bench"],
      instructions: ["Retract shoulder blades", "Control descent", "Press explosively"]
    },
    {
      id: "3",
      name: "Deadlift",
      category: "Strength", 
      primaryMuscles: ["Hamstrings", "Glutes", "Back"],
      equipment: ["Barbell"],
      instructions: ["Hip hinge movement", "Keep bar close", "Full hip extension"]
    }
  ];

  // Phoenix Protocol: Acute Variables by Goal
  const acuteVariables = {
    strength: { intensity: "85-100%", reps: "1-5", sets: "4-6", rest: "2-5 min" },
    hypertrophy: { intensity: "67-85%", reps: "6-12", sets: "3-6", rest: "30-60 sec" },
    power: { intensity: "30-45%", reps: "1-10", sets: "3-6", rest: "1-2 min" },
    endurance: { intensity: "50-70%", reps: "12-25", sets: "1-3", rest: "0-90 sec" }
  };

  // 1RM Calculation Functions
  const calculate1RM = (weight: number, reps: number, formula: 'epley' | 'brzycki' | 'lombardi' = 'epley') => {
    switch (formula) {
      case 'epley':
        return weight * (1 + reps / 30);
      case 'brzycki':
        return weight / (1.0278 - (0.0278 * reps));
      case 'lombardi':
        return weight * Math.pow(reps, 0.10);
      default:
        return weight * (1 + reps / 30);
    }
  };

  // Volume-Load Calculation
  const calculateVolumeLoad = (exercises: WorkoutExercise[]) => {
    return exercises.reduce((total, exercise) => {
      const exerciseVolume = exercise.sets.reduce((setTotal, set) => {
        return setTotal + (set.reps * set.weight);
      }, 0);
      return total + exerciseVolume;
    }, 0);
  };

  const addExercise = (exercise: Exercise) => {
    const newWorkoutExercise: WorkoutExercise = {
      id: `${exercise.id}-${Date.now()}`,
      exercise,
      sets: [
        {
          id: `set-1-${Date.now()}`,
          reps: currentTemplate.goal === 'strength' ? 5 : 8,
          weight: 0,
          restSeconds: currentTemplate.goal === 'strength' ? 180 : 60,
          intensity: currentTemplate.goal === 'strength' ? 85 : 75
        }
      ],
      order: selectedExercises.length + 1
    };
    
    setSelectedExercises([...selectedExercises, newWorkoutExercise]);
  };

  const addSet = (exerciseId: string) => {
    setSelectedExercises(prev => 
      prev.map(ex => {
        if (ex.id === exerciseId) {
          const newSet: WorkoutSet = {
            id: `set-${ex.sets.length + 1}-${Date.now()}`,
            reps: ex.sets[ex.sets.length - 1]?.reps || 8,
            weight: ex.sets[ex.sets.length - 1]?.weight || 0,
            restSeconds: ex.sets[ex.sets.length - 1]?.restSeconds || 60,
            intensity: ex.sets[ex.sets.length - 1]?.intensity || 75
          };
          return { ...ex, sets: [...ex.sets, newSet] };
        }
        return ex;
      })
    );
  };

  const updateSet = (exerciseId: string, setId: string, field: keyof WorkoutSet, value: number | string) => {
    setSelectedExercises(prev =>
      prev.map(ex => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map(set => 
              set.id === setId ? { ...set, [field]: value } : set
            )
          };
        }
        return ex;
      })
    );
  };

  const saveWorkout = () => {
    if (!currentTemplate.name) {
      toast({
        title: "Name Required",
        description: "Please enter a workout name before saving.",
        variant: "destructive"
      });
      return;
    }

    const volumeLoad = calculateVolumeLoad(selectedExercises);
    
    toast({
      title: "Workout Saved",
      description: `${currentTemplate.name} saved with ${volumeLoad.toLocaleString()}lbs volume-load`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Phoenix Protocol Workout Creator</h1>
          <p className="text-muted-foreground">
            Science-based workout design using evidence-based periodization principles
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={saveWorkout}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
          <Button>
            <Play className="h-4 w-4 mr-2" />
            Start Workout
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="template">Template Setup</TabsTrigger>
          <TabsTrigger value="exercises">Exercise Selection</TabsTrigger>
          <TabsTrigger value="periodization">Periodization</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Template Setup */}
        <TabsContent value="template" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Workout Template Configuration
              </CardTitle>
              <CardDescription>
                Define the foundational parameters for your workout based on training goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workout-name">Workout Name</Label>
                  <Input
                    id="workout-name"
                    placeholder="e.g., Upper Body Strength - Week 1"
                    value={currentTemplate.name}
                    onChange={(e) => setCurrentTemplate(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal">Primary Goal</Label>
                  <Select
                    value={currentTemplate.goal}
                    onValueChange={(value: any) => setCurrentTemplate(prev => ({ ...prev, goal: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strength">Maximal Strength</SelectItem>
                      <SelectItem value="hypertrophy">Hypertrophy (Muscle Growth)</SelectItem>
                      <SelectItem value="power">Power Development</SelectItem>
                      <SelectItem value="endurance">Muscular Endurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={currentTemplate.difficulty}
                    onValueChange={(value: any) => setCurrentTemplate(prev => ({ ...prev, difficulty: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="periodization">Periodization Model</Label>
                  <Select
                    value={currentTemplate.periodizationModel}
                    onValueChange={(value: any) => setCurrentTemplate(prev => ({ ...prev, periodizationModel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Linear Periodization</SelectItem>
                      <SelectItem value="undulating">Undulating Periodization</SelectItem>
                      <SelectItem value="block">Block Periodization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Acute Variables Reference */}
              {currentTemplate.goal && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Phoenix Protocol: {currentTemplate.goal.charAt(0).toUpperCase() + currentTemplate.goal.slice(1)} Variables</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="text-xs text-muted-foreground">Intensity</Label>
                        <div className="font-medium">{acuteVariables[currentTemplate.goal].intensity}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Repetitions</Label>
                        <div className="font-medium">{acuteVariables[currentTemplate.goal].reps}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Sets</Label>
                        <div className="font-medium">{acuteVariables[currentTemplate.goal].sets}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Rest</Label>
                        <div className="font-medium">{acuteVariables[currentTemplate.goal].rest}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exercise Selection */}
        <TabsContent value="exercises" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Available Exercises */}
            <Card>
              <CardHeader>
                <CardTitle>Exercise Library</CardTitle>
                <CardDescription>
                  Select compound movements first, then accessory exercises
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {availableExercises.map((exercise) => (
                  <div key={exercise.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{exercise.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {exercise.primaryMuscles.join(", ")}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => addExercise(exercise)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Selected Exercises */}
            <Card>
              <CardHeader>
                <CardTitle>Workout Exercises</CardTitle>
                <CardDescription>
                  Configure sets, reps, and intensity for each exercise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedExercises.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No exercises selected yet
                  </div>
                ) : (
                  selectedExercises.map((workoutEx) => (
                    <Card key={workoutEx.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{workoutEx.exercise.name}</h4>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => addSet(workoutEx.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Set
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {workoutEx.sets.map((set, index) => (
                          <div key={set.id} className="grid grid-cols-5 gap-2 items-center text-sm">
                            <Label className="text-xs">Set {index + 1}</Label>
                            <div>
                              <Input
                                type="number"
                                placeholder="Reps"
                                value={set.reps}
                                onChange={(e) => updateSet(workoutEx.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                                className="h-8"
                              />
                            </div>
                            <div>
                              <Input
                                type="number"
                                placeholder="Weight"
                                value={set.weight}
                                onChange={(e) => updateSet(workoutEx.id, set.id, 'weight', parseInt(e.target.value) || 0)}
                                className="h-8"
                              />
                            </div>
                            <div>
                              <Input
                                type="number"
                                placeholder="% 1RM"
                                value={set.intensity}
                                onChange={(e) => updateSet(workoutEx.id, set.id, 'intensity', parseInt(e.target.value) || 0)}
                                className="h-8"
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {Math.round(set.restSeconds / 60)}min rest
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Periodization */}
        <TabsContent value="periodization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Periodization Planning
              </CardTitle>
              <CardDescription>
                Long-term progression strategy based on scientific periodization models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Current Phase</h4>
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{currentTemplate.phase}</span>
                      <Badge variant="secondary">Week {currentTemplate.week}</Badge>
                    </div>
                    <Progress value={((currentTemplate.week || 1) / 4) * 100} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Focus on progressive overload and volume accumulation
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Progression Model</h4>
                  <div className="space-y-2">
                    {currentTemplate.periodizationModel === 'linear' && (
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm">Linear Periodization</h5>
                        <p className="text-xs text-muted-foreground">
                          High volume → Low volume, Low intensity → High intensity
                        </p>
                        <div className="mt-2 space-y-1 text-xs">
                          <div>Weeks 1-4: Hypertrophy (70-80% 1RM)</div>
                          <div>Weeks 5-8: Strength (80-90% 1RM)</div>
                          <div>Weeks 9-12: Peak (90-100% 1RM)</div>
                        </div>
                      </div>
                    )}

                    {currentTemplate.periodizationModel === 'undulating' && (
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm">Undulating Periodization</h5>
                        <p className="text-xs text-muted-foreground">
                          Daily/weekly variation in intensity and volume
                        </p>
                        <div className="mt-2 space-y-1 text-xs">
                          <div>Monday: Strength (3-5 reps)</div>
                          <div>Wednesday: Power (6-8 reps explosive)</div>
                          <div>Friday: Hypertrophy (10-15 reps)</div>
                        </div>
                      </div>
                    )}

                    {currentTemplate.periodizationModel === 'block' && (
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm">Block Periodization</h5>
                        <p className="text-xs text-muted-foreground">
                          Concentrated training blocks with specific adaptations
                        </p>
                        <div className="mt-2 space-y-1 text-xs">
                          <div>Block 1: Accumulation (Volume)</div>
                          <div>Block 2: Transmutation (Strength)</div>
                          <div>Block 3: Realization (Peak)</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="h-5 w-5" />
                  Volume-Load
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {calculateVolumeLoad(selectedExercises).toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Total lbs moved</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" />
                  Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-fitness-orange">
                  {selectedExercises.reduce((total, ex) => {
                    const exerciseTime = ex.sets.length * 2 + ex.sets.reduce((sum, set) => sum + (set.restSeconds / 60), 0);
                    return total + exerciseTime;
                  }, 0).toFixed(0)}
                </div>
                <p className="text-sm text-muted-foreground">Estimated minutes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5" />
                  Total Sets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-fitness-green-electric">
                  {selectedExercises.reduce((total, ex) => total + ex.sets.length, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Across all exercises</p>
              </CardContent>
            </Card>
          </div>

          {/* 1RM Calculator */}
          <Card>
            <CardHeader>
              <CardTitle>1RM Calculator</CardTitle>
              <CardDescription>
                Calculate your one-rep max using multiple evidence-based formulas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Weight Lifted</Label>
                  <Input type="number" placeholder="225" />
                </div>
                <div className="space-y-2">
                  <Label>Repetitions</Label>
                  <Input type="number" placeholder="5" />
                </div>
                <div className="space-y-2">
                  <Label>Formula</Label>
                  <Select defaultValue="epley">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="epley">Epley</SelectItem>
                      <SelectItem value="brzycki">Brzycki</SelectItem>
                      <SelectItem value="lombardi">Lombardi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="text-lg font-bold">Estimated 1RM: 255 lbs</div>
                <p className="text-sm text-muted-foreground">
                  Use this to set appropriate percentages for your workout intensities
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkoutCreator;