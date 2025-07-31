/**
 * Phoenix Project Fitness - Workouts Page
 * 
 * Core workout management interface including:
 * - AI Workout Generator
 * - Workout History
 * - Quick Start Options
 * - Program Browser
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dumbbell,
  Zap,
  Clock,
  Target,
  Calendar,
  Play,
  Plus,
  Filter,
  TrendingUp
} from "lucide-react";

export default function WorkoutsPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  // Mock data for demonstration
  const recentWorkouts = [
    {
      id: 1,
      name: "Upper Body Strength",
      date: "Today",
      duration: 45,
      exercises: 8,
      calories: 320,
      status: "completed"
    },
    {
      id: 2,
      name: "HIIT Cardio Blast",
      date: "Yesterday",
      duration: 30,
      exercises: 6,
      calories: 280,
      status: "completed"
    },
    {
      id: 3,
      name: "Lower Body Power",
      date: "2 days ago",
      duration: 50,
      exercises: 9,
      calories: 400,
      status: "completed"
    }
  ];

  const aiWorkoutSuggestions = [
    {
      id: 1,
      name: "Adaptive Strength Circuit",
      description: "Personalized based on your Phoenix Score (87)",
      duration: 40,
      exercises: 7,
      difficulty: "Intermediate",
      focus: "Strength Building",
      equipment: "Dumbbells, Barbell"
    },
    {
      id: 2,
      name: "Recovery Flow",
      description: "Low intensity session for active recovery",
      duration: 25,
      exercises: 5,
      difficulty: "Beginner",
      focus: "Recovery",
      equipment: "Bodyweight"
    },
    {
      id: 3,
      name: "Explosive Power Training",
      description: "High-intensity power development",
      duration: 35,
      exercises: 6,
      difficulty: "Advanced",
      focus: "Power & Speed",
      equipment: "Dumbbells, Medicine Ball"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workouts</h1>
          <p className="text-muted-foreground">
            AI-powered workouts tailored to your fitness journey
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Workout
          </Button>
        </div>
      </div>

      {/* AI Workout Generator Quick Access */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-fitness-orange/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>AI Workout Generator</CardTitle>
            </div>
            <Badge variant="secondary" className="bg-fitness-green-electric/10 text-fitness-green-electric">
              Phoenix Score: 87
            </Badge>
          </div>
          <CardDescription>
            Get a personalized workout based on your current fitness level, goals, and available equipment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto flex-col items-start p-4">
              <Target className="h-6 w-6 mb-2 text-primary" />
              <div className="text-left">
                <div className="font-medium">Quick Start</div>
                <div className="text-xs text-muted-foreground">30-min balanced workout</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto flex-col items-start p-4">
              <Dumbbell className="h-6 w-6 mb-2 text-fitness-orange" />
              <div className="text-left">
                <div className="font-medium">Strength Focus</div>
                <div className="text-xs text-muted-foreground">Progressive overload</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto flex-col items-start p-4">
              <TrendingUp className="h-6 w-6 mb-2 text-fitness-green-electric" />
              <div className="text-left">
                <div className="font-medium">Adaptive</div>
                <div className="text-xs text-muted-foreground">AI-optimized routine</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="suggested" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="suggested">AI Suggested</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* AI Suggested Workouts */}
        <TabsContent value="suggested" className="space-y-4">
          <div className="grid gap-4">
            {aiWorkoutSuggestions.map((workout) => (
              <Card key={workout.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{workout.name}</h3>
                        <Badge 
                          variant="outline" 
                          className={`
                            ${workout.difficulty === 'Beginner' ? 'border-green-500 text-green-700' : ''}
                            ${workout.difficulty === 'Intermediate' ? 'border-yellow-500 text-yellow-700' : ''}
                            ${workout.difficulty === 'Advanced' ? 'border-red-500 text-red-700' : ''}
                          `}
                        >
                          {workout.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{workout.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{workout.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Dumbbell className="h-4 w-4 text-muted-foreground" />
                          <span>{workout.exercises} exercises</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span>{workout.focus}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {workout.equipment}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                      <Button size="sm" variant="hero">
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Workout History */}
        <TabsContent value="history" className="space-y-4">
          <div className="grid gap-4">
            {recentWorkouts.map((workout) => (
              <Card key={workout.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{workout.name}</h3>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Completed
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{workout.date}</p>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{workout.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Dumbbell className="h-4 w-4 text-muted-foreground" />
                          <span>{workout.exercises} exercises</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span>{workout.calories} cal</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Repeat
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Workout Programs */}
        <TabsContent value="programs" className="space-y-4">
          <div className="text-center py-12">
            <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Workout Programs</h3>
            <p className="text-muted-foreground mb-4">
              Structured programs coming soon! Browse our comprehensive training plans.
            </p>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Program
            </Button>
          </div>
        </TabsContent>

        {/* Workout Templates */}
        <TabsContent value="templates" className="space-y-4">
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Workout Templates</h3>
            <p className="text-muted-foreground mb-4">
              Save and reuse your favorite workout configurations.
            </p>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}