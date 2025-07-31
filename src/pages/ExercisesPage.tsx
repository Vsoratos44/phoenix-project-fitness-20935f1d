/**
 * Phoenix Project Fitness - Exercise Library
 * 
 * Comprehensive exercise database featuring:
 * - Searchable exercise library
 * - Exercise categories and muscle groups
 * - Video demonstrations
 * - Form tips and variations
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Play,
  BookOpen,
  Target,
  Dumbbell,
  Heart,
  Zap,
  Filter,
  Star
} from "lucide-react";

export default function ExercisesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock exercise categories
  const exerciseCategories = [
    { name: "Strength", icon: Dumbbell, count: 245, color: "bg-blue-500" },
    { name: "Cardio", icon: Heart, count: 89, color: "bg-red-500" },
    { name: "HIIT", icon: Zap, count: 156, color: "bg-yellow-500" },
    { name: "Yoga", icon: Target, count: 78, color: "bg-green-500" },
    { name: "Flexibility", icon: BookOpen, count: 92, color: "bg-purple-500" },
  ];

  // Mock featured exercises
  const featuredExercises = [
    {
      id: 1,
      name: "Deadlift",
      category: "Strength",
      primaryMuscles: ["Hamstrings", "Glutes", "Lower Back"],
      difficulty: "Intermediate",
      equipment: "Barbell",
      description: "The king of compound movements. Builds total-body strength and power.",
      videoUrl: "/videos/deadlift.mp4",
      thumbnailUrl: "/images/deadlift-thumb.jpg",
      rating: 4.9,
      isBodyweight: false
    },
    {
      id: 2,
      name: "Push-Up",
      category: "Strength",
      primaryMuscles: ["Chest", "Triceps", "Shoulders"],
      difficulty: "Beginner",
      equipment: "Bodyweight",
      description: "Classic bodyweight exercise perfect for building upper body strength.",
      videoUrl: "/videos/pushup.mp4",
      thumbnailUrl: "/images/pushup-thumb.jpg",
      rating: 4.7,
      isBodyweight: true
    },
    {
      id: 3,
      name: "Burpees",
      category: "HIIT",
      primaryMuscles: ["Full Body"],
      difficulty: "Intermediate",
      equipment: "Bodyweight",
      description: "High-intensity full-body exercise that combines strength and cardio.",
      videoUrl: "/videos/burpees.mp4",
      thumbnailUrl: "/images/burpees-thumb.jpg",
      rating: 4.2,
      isBodyweight: true
    },
    {
      id: 4,
      name: "Squats",
      category: "Strength",
      primaryMuscles: ["Quadriceps", "Glutes", "Calves"],
      difficulty: "Beginner",
      equipment: "Bodyweight",
      description: "Fundamental lower body movement for building leg strength and mobility.",
      videoUrl: "/videos/squats.mp4",
      thumbnailUrl: "/images/squats-thumb.jpg",
      rating: 4.8,
      isBodyweight: true
    },
  ];

  const filteredExercises = featuredExercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.primaryMuscles.some(muscle => 
      muscle.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exercise Library</h1>
          <p className="text-muted-foreground">
            Discover over 500 exercises with detailed instructions and video demonstrations
          </p>
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Advanced Filters
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises, muscle groups, or equipment..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Exercise Categories */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {exerciseCategories.map((category) => (
          <Card key={category.name} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className={`h-12 w-12 rounded-full ${category.color} flex items-center justify-center mx-auto mb-3`}>
                <category.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.count} exercises</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Exercise Content */}
      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse All</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="recent">Recently Used</TabsTrigger>
          <TabsTrigger value="custom">My Exercises</TabsTrigger>
        </TabsList>

        {/* Browse All Exercises */}
        <TabsContent value="browse" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredExercises.map((exercise) => (
              <Card key={exercise.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  {/* Exercise Video/Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-fitness-orange/10 rounded-t-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button variant="secondary" size="lg" className="bg-white/90 hover:bg-white">
                        <Play className="h-6 w-6 mr-2" />
                        Watch Demo
                      </Button>
                    </div>
                    {exercise.isBodyweight && (
                      <Badge className="absolute top-2 left-2 bg-fitness-green-electric">
                        Bodyweight
                      </Badge>
                    )}
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 rounded px-2 py-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-white text-xs">{exercise.rating}</span>
                    </div>
                  </div>

                  {/* Exercise Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{exercise.name}</h3>
                      <Badge variant="outline" className={getDifficultyColor(exercise.difficulty)}>
                        {exercise.difficulty}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {exercise.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {exercise.primaryMuscles.join(", ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Dumbbell className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{exercise.equipment}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Instructions
                      </Button>
                      <Button size="sm" className="flex-1">
                        Add to Workout
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredExercises.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No exercises found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or browse by category
              </p>
            </div>
          )}
        </TabsContent>

        {/* Favorites */}
        <TabsContent value="favorites" className="space-y-4">
          <div className="text-center py-12">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Favorites Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start marking exercises as favorites to see them here
            </p>
            <Button variant="outline">Browse Exercises</Button>
          </div>
        </TabsContent>

        {/* Recently Used */}
        <TabsContent value="recent" className="space-y-4">
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Recent Exercises</h3>
            <p className="text-muted-foreground mb-4">
              Exercises you use in workouts will appear here
            </p>
            <Button variant="outline">Start a Workout</Button>
          </div>
        </TabsContent>

        {/* Custom Exercises */}
        <TabsContent value="custom" className="space-y-4">
          <div className="text-center py-12">
            <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Create Your Own Exercises</h3>
            <p className="text-muted-foreground mb-4">
              Add custom exercises that aren't in our library
            </p>
            <Button>
              <BookOpen className="h-4 w-4 mr-2" />
              Create Exercise
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}