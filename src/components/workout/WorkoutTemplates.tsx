/**
 * Phoenix Training Protocol Templates
 * Pre-built workout programs based on evidence-based training principles
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  Target, 
  Clock, 
  Calendar, 
  Flame, 
  Zap, 
  Trophy,
  TrendingUp,
  Play,
  Star,
  Users,
  CheckCircle,
  ArrowRight
} from "lucide-react";

interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  goal: string;
  duration: number;
  frequency: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  phases: Phase[];
  highlights: string[];
  sampleWorkout: Exercise[];
}

interface Phase {
  name: string;
  weeks: string;
  focus: string;
  description: string;
}

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  category: string;
}

const PHOENIX_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'metabolic-hypertrophy',
    name: '8-Week Metabolic Hypertrophy',
    description: 'Build lean muscle while burning fat through strategic periodization',
    goal: 'Lean Muscle Gain & Fat Loss',
    duration: 8,
    frequency: 4,
    difficulty: 'intermediate',
    equipment: ['Barbell', 'Dumbbells', 'Cable Machine', 'Pull-up Bar'],
    phases: [
      {
        name: 'Accumulation',
        weeks: '1-4',
        focus: 'Volume Building',
        description: 'Build training capacity and movement quality foundation'
      },
      {
        name: 'Intensification', 
        weeks: '5-8',
        focus: 'Strength & Power',
        description: 'Increase intensity while maintaining metabolic stress'
      }
    ],
    highlights: [
      'Upper/Lower split for optimal recovery',
      'Superset protocols for metabolic stress',
      'Progressive overload built-in',
      'EPOC maximization techniques'
    ],
    sampleWorkout: [
      { name: 'Barbell Bench Press', sets: 4, reps: '6-8', rest: '60s', category: 'Compound' },
      { name: 'Bent-Over Barbell Row', sets: 4, reps: '6-8', rest: '60s', category: 'Compound' },
      { name: 'Dumbbell Shoulder Press', sets: 3, reps: '8-10', rest: '45s', category: 'Accessory' },
      { name: 'Pull-Ups', sets: 3, reps: 'AMRAP', rest: '45s', category: 'Compound' }
    ]
  },
  {
    id: 'lean-physique-sculpt',
    name: '12-Week Lean Physique Sculpt',
    description: 'Advanced hypertrophy program for maximum muscle definition',
    goal: 'Advanced Muscle Hypertrophy & Body Composition',
    duration: 12,
    frequency: 5,
    difficulty: 'advanced',
    equipment: ['Full Gym Access', 'Cables', 'Free Weights', 'Machines'],
    phases: [
      {
        name: 'Foundation Volume',
        weeks: '1-4',
        focus: 'Work Capacity',
        description: 'High-volume training to build base fitness'
      },
      {
        name: 'Intensity Build',
        weeks: '5-8', 
        focus: 'Strength Development',
        description: 'Progressive overload with advanced techniques'
      },
      {
        name: 'Peak Definition',
        weeks: '9-12',
        focus: 'Muscle Sculpting',
        description: 'Drop sets, supersets, and metabolic finishers'
      }
    ],
    highlights: [
      'Push/Pull/Legs split for complete development',
      'Block periodization for continuous progress',
      'High-volume metabolic workouts',
      'Advanced intensity techniques'
    ],
    sampleWorkout: [
      { name: 'Barbell Bench Press', sets: 4, reps: '8-10', rest: '15s', category: 'Compound' },
      { name: 'Dumbbell Lateral Raises', sets: 4, reps: '12-15', rest: '60s', category: 'Superset' },
      { name: 'Seated Shoulder Press', sets: 4, reps: '8-10', rest: '15s', category: 'Compound' },
      { name: 'Dips', sets: 4, reps: 'AMRAP', rest: '60s', category: 'Superset' }
    ]
  },
  {
    id: 'progressive-hiit',
    name: '8-Week Progressive HIIT Overload',
    description: 'Systematic cardiovascular conditioning with progressive work:rest ratios',
    goal: 'Fat Loss & Cardiovascular Conditioning',
    duration: 8,
    frequency: 4,
    difficulty: 'beginner',
    equipment: ['Dumbbells', 'Bodyweight', 'Timer'],
    phases: [
      {
        name: 'Foundation',
        weeks: '1-2',
        focus: '1:2 Work:Rest',
        description: '30s work, 60s rest - building aerobic base'
      },
      {
        name: 'Intensity Build',
        weeks: '3-4',
        focus: '1:1.5 Work:Rest', 
        description: '40s work, 60s rest - anaerobic development'
      },
      {
        name: 'Endurance Build',
        weeks: '5-6',
        focus: '1:1 Work:Rest',
        description: '45s work, 45s rest - lactate threshold'
      },
      {
        name: 'Peak Performance',
        weeks: '7-8',
        focus: '2:1 Work:Rest',
        description: '40s work, 20s rest - maximum power output'
      }
    ],
    highlights: [
      'Progressive work:rest ratios',
      'No equipment needed',
      'Scalable intensity levels',
      'Maximum calorie burn protocols'
    ],
    sampleWorkout: [
      { name: 'Burpees', sets: 1, reps: '30s', rest: '60s', category: 'Full Body' },
      { name: 'High Knees', sets: 1, reps: '30s', rest: '60s', category: 'Cardio' },
      { name: 'Bodyweight Squats', sets: 1, reps: '30s', rest: '60s', category: 'Lower Body' },
      { name: 'Mountain Climbers', sets: 1, reps: '30s', rest: '60s', category: 'Core' }
    ]
  }
];

export function WorkoutTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const startProgram = async (template: WorkoutTemplate) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to start a workout program",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Program Started!",
      description: `You've enrolled in ${template.name}. Check your dashboard for today's workout.`,
    });

    // Here you would typically save the program to the user's profile
    // and generate the first workout
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
          <Trophy className="h-8 w-8 text-primary" />
          Phoenix Training Protocols
        </h2>
        <p className="text-lg text-muted-foreground">
          Evidence-based workout programs designed by certified strength coaches
        </p>
      </div>

      {!selectedTemplate ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PHOENIX_TEMPLATES.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getDifficultyColor(template.difficulty)}>
                    {template.difficulty}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>4.8</span>
                  </div>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {template.name}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{template.duration} weeks</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{template.frequency}x/week</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-primary">Key Benefits:</div>
                  <ul className="text-sm space-y-1">
                    {template.highlights.slice(0, 2).map((highlight, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => startProgram(template)}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start Program
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <Button 
            variant="outline" 
            onClick={() => setSelectedTemplate(null)}
            className="mb-4"
          >
            ← Back to Programs
          </Button>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{selectedTemplate.name}</CardTitle>
                  <CardDescription className="text-lg">{selectedTemplate.description}</CardDescription>
                </div>
                <Badge className={getDifficultyColor(selectedTemplate.difficulty)} variant="outline">
                  {selectedTemplate.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="phases">Phases</TabsTrigger>
                  <TabsTrigger value="sample">Sample Workout</TabsTrigger>
                  <TabsTrigger value="equipment">Equipment</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Program Goal
                      </h3>
                      <p className="text-muted-foreground">{selectedTemplate.goal}</p>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <div className="text-2xl font-bold">{selectedTemplate.duration}</div>
                          <div className="text-sm text-muted-foreground">Weeks</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <div className="text-2xl font-bold">{selectedTemplate.frequency}</div>
                          <div className="text-sm text-muted-foreground">Days/Week</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Key Highlights</h3>
                      <ul className="space-y-2">
                        {selectedTemplate.highlights.map((highlight, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button 
                      size="lg" 
                      onClick={() => startProgram(selectedTemplate)}
                      className="w-full md:w-auto"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Start This Program
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="phases" className="space-y-4">
                  <h3 className="text-lg font-semibold">Training Phases</h3>
                  <div className="space-y-4">
                    {selectedTemplate.phases.map((phase, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{phase.name}</h4>
                            <Badge variant="outline">Weeks {phase.weeks}</Badge>
                          </div>
                          <div className="text-sm text-primary font-medium mb-1">
                            Focus: {phase.focus}
                          </div>
                          <p className="text-muted-foreground text-sm">{phase.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="sample" className="space-y-4">
                  <h3 className="text-lg font-semibold">Sample Workout</h3>
                  <div className="space-y-3">
                    {selectedTemplate.sampleWorkout.map((exercise, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{exercise.name}</div>
                          <div className="text-sm text-muted-foreground">{exercise.category}</div>
                        </div>
                        <div className="text-right text-sm">
                          <div>{exercise.sets} sets × {exercise.reps}</div>
                          <div className="text-muted-foreground">Rest: {exercise.rest}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="equipment" className="space-y-4">
                  <h3 className="text-lg font-semibold">Required Equipment</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedTemplate.equipment.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}