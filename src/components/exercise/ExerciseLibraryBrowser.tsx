import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Filter, 
  Dumbbell, 
  Heart, 
  Target, 
  AlertTriangle,
  Play,
  BookOpen,
  Clock,
  Zap,
  Shield
} from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  description?: string;
  category: string;
  exercise_type: string;
  difficulty_level: string;
  intensity_level: string;
  muscle_group_primary: string;
  muscle_group_secondary: string[];
  equipment_required: string[];
  instructions: string[];
  form_cues: string[];
  common_mistakes: string[];
  contraindications: string[];
  modifications: any[];
  variations: any[];
  met_value: number;
  is_bodyweight: boolean;
  requires_spotter: boolean;
  is_unilateral: boolean;
  video_url?: string;
  thumbnail_url?: string;
}

interface FilterState {
  category: string;
  exerciseType: string;
  difficultyLevel: string;
  muscleGroup: string;
  equipment: string;
  intensityLevel: string;
}

export default function ExerciseLibraryBrowser() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [userInjuries, setUserInjuries] = useState<any[]>([]);
  const [userEquipment, setUserEquipment] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    exerciseType: "all",
    difficultyLevel: "all",
    muscleGroup: "all",
    equipment: "all",
    intensityLevel: "all"
  });

  // Load exercises and user data
  useEffect(() => {
    loadExercises();
    if (user) {
      loadUserData();
    }
  }, [user]);

  // Apply filters and search
  useEffect(() => {
    applyFilters();
  }, [exercises, searchTerm, filters]);

  const loadExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('is_approved', true)
        .order('name');

      if (error) throw error;
      setExercises((data || []) as Exercise[]);
    } catch (error) {
      console.error('Error loading exercises:', error);
      toast({
        title: "Error",
        description: "Failed to load exercise library",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      // Load user injuries
      const { data: injuries } = await supabase
        .from('user_injury_history')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active');

      if (injuries) {
        setUserInjuries(injuries);
      }

      // Load user equipment
      const { data: profile } = await supabase
        .from('profiles')
        .select('available_equipment')
        .eq('user_id', user?.id)
        .single();

      if (profile?.available_equipment) {
        setUserEquipment(profile.available_equipment);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const applyFilters = () => {
    let filtered = exercises;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.muscle_group_primary?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.category !== "all") {
      filtered = filtered.filter(exercise => exercise.category === filters.category);
    }
    if (filters.exerciseType !== "all") {
      filtered = filtered.filter(exercise => exercise.exercise_type === filters.exerciseType);
    }
    if (filters.difficultyLevel !== "all") {
      filtered = filtered.filter(exercise => exercise.difficulty_level === filters.difficultyLevel);
    }
    if (filters.muscleGroup !== "all") {
      filtered = filtered.filter(exercise => 
        exercise.muscle_group_primary === filters.muscleGroup ||
        exercise.muscle_group_secondary?.includes(filters.muscleGroup)
      );
    }
    if (filters.equipment !== "all") {
      filtered = filtered.filter(exercise => 
        exercise.equipment_required?.includes(filters.equipment) ||
        (filters.equipment === "bodyweight" && exercise.is_bodyweight)
      );
    }
    if (filters.intensityLevel !== "all") {
      filtered = filtered.filter(exercise => exercise.intensity_level === filters.intensityLevel);
    }

    setFilteredExercises(filtered);
  };

  const isExerciseSafe = (exercise: Exercise) => {
    // Check if exercise is contraindicated based on user injuries
    for (const injury of userInjuries) {
      if (injury.contraindicated_exercises?.includes(exercise.name)) {
        return false;
      }
    }
    return true;
  };

  const isEquipmentAvailable = (exercise: Exercise) => {
    if (exercise.is_bodyweight) return true;
    if (!exercise.equipment_required?.length) return true;
    
    return exercise.equipment_required.some(equipment => 
      userEquipment.includes(equipment)
    );
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIntensityColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'very_high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const resetFilters = () => {
    setFilters({
      category: "all",
      exerciseType: "all",
      difficultyLevel: "all",
      muscleGroup: "all",
      equipment: "all",
      intensityLevel: "all"
    });
    setSearchTerm("");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Loading Exercise Library...</h3>
            <p className="text-muted-foreground">Preparing your comprehensive exercise database</p>
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
          <div className="p-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100">
            <BookOpen className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Exercise Library
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore our comprehensive database of exercises with Phoenix-powered safety recommendations
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises by name, muscle group, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="flexibility">Flexibility</SelectItem>
                  <SelectItem value="plyometric">Plyometric</SelectItem>
                  <SelectItem value="mobility">Mobility</SelectItem>
                  <SelectItem value="balance">Balance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Type</Label>
              <Select value={filters.exerciseType} onValueChange={(value) => setFilters({...filters, exerciseType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="compound">Compound</SelectItem>
                  <SelectItem value="isolation">Isolation</SelectItem>
                  <SelectItem value="functional">Functional</SelectItem>
                  <SelectItem value="cardiovascular">Cardiovascular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Difficulty</Label>
              <Select value={filters.difficultyLevel} onValueChange={(value) => setFilters({...filters, difficultyLevel: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Muscle Group</Label>
              <Select value={filters.muscleGroup} onValueChange={(value) => setFilters({...filters, muscleGroup: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Muscles</SelectItem>
                  <SelectItem value="chest">Chest</SelectItem>
                  <SelectItem value="back">Back</SelectItem>
                  <SelectItem value="shoulders">Shoulders</SelectItem>
                  <SelectItem value="arms">Arms</SelectItem>
                  <SelectItem value="legs">Legs</SelectItem>
                  <SelectItem value="glutes">Glutes</SelectItem>
                  <SelectItem value="core">Core</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Equipment</Label>
              <Select value={filters.equipment} onValueChange={(value) => setFilters({...filters, equipment: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Equipment</SelectItem>
                  <SelectItem value="bodyweight">Bodyweight</SelectItem>
                  <SelectItem value="dumbbell">Dumbbells</SelectItem>
                  <SelectItem value="barbell">Barbell</SelectItem>
                  <SelectItem value="kettlebell">Kettlebells</SelectItem>
                  <SelectItem value="resistance_bands">Resistance Bands</SelectItem>
                  <SelectItem value="cable_machine">Cable Machine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Intensity</Label>
              <Select value={filters.intensityLevel} onValueChange={(value) => setFilters({...filters, intensityLevel: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Intensities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="very_high">Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing {filteredExercises.length} of {exercises.length} exercises
            </p>
            <Button variant="outline" onClick={resetFilters}>
              <Filter className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => {
          const isSafe = isExerciseSafe(exercise);
          const hasEquipment = isEquipmentAvailable(exercise);
          
          return (
            <Dialog key={exercise.id}>
              <DialogTrigger asChild>
                <Card className={`cursor-pointer transition-all hover:shadow-lg ${
                  !isSafe ? 'border-red-200 bg-red-50' : 
                  !hasEquipment ? 'border-yellow-200 bg-yellow-50' : 
                  'hover:border-primary'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-2">{exercise.name}</CardTitle>
                      <div className="flex gap-1">
                        {!isSafe && <Shield className="h-4 w-4 text-red-500" />}
                        {!hasEquipment && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {exercise.description || `${exercise.muscle_group_primary} exercise`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <Target className="mr-1 h-3 w-3" />
                        {exercise.muscle_group_primary}
                      </Badge>
                      <Badge className={getDifficultyColor(exercise.difficulty_level)}>
                        {exercise.difficulty_level}
                      </Badge>
                      <Badge className={getIntensityColor(exercise.intensity_level)}>
                        <Zap className="mr-1 h-3 w-3" />
                        {exercise.intensity_level}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Target className="mr-1 h-3 w-3" />
                        {exercise.category}
                      </span>
                      <span className="flex items-center">
                        <Heart className="mr-1 h-3 w-3" />
                        {exercise.met_value} METs
                      </span>
                    </div>

                    {exercise.equipment_required?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {exercise.equipment_required.slice(0, 3).map((equipment, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {equipment}
                          </Badge>
                        ))}
                        {exercise.equipment_required.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{exercise.equipment_required.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {!isSafe && (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-100 p-2 rounded">
                        <Shield className="h-4 w-4" />
                        <span>Contraindicated due to injury</span>
                      </div>
                    )}

                    {!hasEquipment && (
                      <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-100 p-2 rounded">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Equipment not available</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </DialogTrigger>

              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    {exercise.name}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Exercise Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Muscle className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm font-semibold">Primary</p>
                      <p className="text-xs text-muted-foreground">{exercise.muscle_group_primary}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Target className="h-6 w-6 mx-auto mb-2 text-green-600" />
                      <p className="text-sm font-semibold">Difficulty</p>
                      <p className="text-xs text-muted-foreground">{exercise.difficulty_level}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Zap className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                      <p className="text-sm font-semibold">Intensity</p>
                      <p className="text-xs text-muted-foreground">{exercise.intensity_level}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Heart className="h-6 w-6 mx-auto mb-2 text-red-600" />
                      <p className="text-sm font-semibold">METs</p>
                      <p className="text-xs text-muted-foreground">{exercise.met_value}</p>
                    </div>
                  </div>

                  {/* Instructions */}
                  {exercise.instructions?.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold mb-3">Instructions</h4>
                      <ol className="space-y-2">
                        {exercise.instructions.map((instruction, index) => (
                          <li key={index} className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </span>
                            <span className="text-sm">{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Form Cues */}
                  {exercise.form_cues?.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold mb-3">Form Cues</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {exercise.form_cues.map((cue, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Target className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {cue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Common Mistakes */}
                  {exercise.common_mistakes?.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold mb-3">Common Mistakes</h4>
                      <ul className="space-y-2">
                        {exercise.common_mistakes.map((mistake, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            {mistake}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Equipment & Safety */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {exercise.equipment_required?.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold mb-3">Equipment Required</h4>
                        <div className="flex flex-wrap gap-2">
                          {exercise.equipment_required.map((equipment, index) => (
                            <Badge key={index} variant="outline">
                              {equipment}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {exercise.contraindications?.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold mb-3">Contraindications</h4>
                        <ul className="space-y-1">
                          {exercise.contraindications.map((contraindication, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-red-600">
                              <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              {contraindication}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Video Link */}
                  {exercise.video_url && (
                    <div className="text-center">
                      <Button asChild>
                        <a href={exercise.video_url} target="_blank" rel="noopener noreferrer">
                          <Play className="mr-2 h-4 w-4" />
                          Watch Exercise Video
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>

      {filteredExercises.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Exercises Found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters to find exercises
            </p>
            <Button onClick={resetFilters}>
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}