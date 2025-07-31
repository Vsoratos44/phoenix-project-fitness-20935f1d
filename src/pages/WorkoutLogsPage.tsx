import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Activity,
  Calendar,
  Clock,
  Dumbbell,
  Edit3,
  Eye,
  Filter,
  Heart,
  Search,
  TrendingUp,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface WorkoutSession {
  id: string;
  name: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  calories_burned: number | null;
  total_exercises: number;
  total_sets: number;
  total_volume_kg: number;
  perceived_exertion: number | null;
  notes: string | null;
  heart_rate_avg: number | null;
  heart_rate_max: number | null;
  location: string | null;
  workout_template_id: string | null;
  exercise_logs: any[];
}

export default function WorkoutLogsPage() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutSession | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutSession | null>(null);

  useEffect(() => {
    if (user) {
      loadWorkouts();
    }
  }, [user]);

  useEffect(() => {
    const filtered = workouts.filter(workout =>
      workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (workout.notes && workout.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredWorkouts(filtered);
  }, [workouts, searchTerm]);

  const loadWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          exercise_logs (
            id,
            sets_completed,
            notes,
            exercises (
              name,
              primary_muscle_groups
            ),
            set_logs (
              weight_kg,
              reps,
              rpe
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('start_time', { ascending: false })
        .limit(50);

      if (error) throw error;
      setWorkouts(data || []);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateWorkout = async (workout: WorkoutSession) => {
    try {
      const { error } = await supabase
        .from('workout_sessions')
        .update({
          name: workout.name,
          notes: workout.notes,
          perceived_exertion: workout.perceived_exertion,
          calories_burned: workout.calories_burned,
          location: workout.location
        })
        .eq('id', workout.id);

      if (error) throw error;
      
      await loadWorkouts();
      setEditingWorkout(null);
    } catch (error) {
      console.error('Error updating workout:', error);
    }
  };

  const getWorkoutTypeColor = (workout: WorkoutSession) => {
    const exerciseCount = workout.total_exercises;
    if (exerciseCount >= 8) return "bg-red-100 text-red-800";
    if (exerciseCount >= 5) return "bg-orange-100 text-orange-800";
    return "bg-green-100 text-green-800";
  };

  const hasConnectedDevice = (workout: WorkoutSession) => {
    // Check if workout has heart rate data (indicates connected device)
    return workout.heart_rate_avg !== null || workout.heart_rate_max !== null;
  };

  if (loading) {
    return <div className="p-6">Loading workout history...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Workout History</h1>
        <p className="text-muted-foreground">
          Track your progress and edit your workout sessions
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search workouts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Workout Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Workouts</p>
                <p className="text-2xl font-bold">{workouts.length}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">
                  {workouts.filter(w => {
                    const workoutDate = new Date(w.start_time);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return workoutDate >= weekAgo;
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold">
                  {Math.round(workouts.reduce((acc, w) => acc + (w.duration_minutes || 0), 0) / workouts.length || 0)}m
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">SEP Eligible</p>
                <p className="text-2xl font-bold">
                  {workouts.filter(hasConnectedDevice).length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-fitness-orange" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workouts List */}
      <div className="space-y-4">
        {filteredWorkouts.map((workout) => (
          <Card key={workout.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{workout.name}</h3>
                    <Badge variant="outline" className={getWorkoutTypeColor(workout)}>
                      {workout.total_exercises} exercises
                    </Badge>
                    {hasConnectedDevice(workout) && (
                      <Badge variant="outline" className="bg-fitness-orange/10 text-fitness-orange border-fitness-orange/20">
                        SEP Eligible
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                    <div>
                      <span className="font-medium">Date:</span> {format(new Date(workout.start_time), 'MMM d, yyyy')}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {workout.duration_minutes || 0}min
                    </div>
                    <div>
                      <span className="font-medium">Sets:</span> {workout.total_sets}
                    </div>
                    <div>
                      <span className="font-medium">Volume:</span> {Math.round(workout.total_volume_kg || 0)}kg
                    </div>
                  </div>

                  {workout.heart_rate_avg && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span>Avg: {workout.heart_rate_avg} bpm</span>
                      </div>
                      {workout.heart_rate_max && (
                        <div>Max: {workout.heart_rate_max} bpm</div>
                      )}
                    </div>
                  )}

                  {workout.notes && (
                    <p className="text-sm text-muted-foreground italic">"{workout.notes}"</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedWorkout(workout)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{selectedWorkout?.name}</DialogTitle>
                        <DialogDescription>
                          Workout details from {selectedWorkout && format(new Date(selectedWorkout.start_time), 'MMMM d, yyyy')}
                        </DialogDescription>
                      </DialogHeader>
                      {selectedWorkout && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Duration</Label>
                              <p className="text-sm">{selectedWorkout.duration_minutes} minutes</p>
                            </div>
                            <div>
                              <Label>Perceived Exertion</Label>
                              <p className="text-sm">{selectedWorkout.perceived_exertion || 'Not rated'}/10</p>
                            </div>
                          </div>
                          
                          <div>
                            <Label>Exercise Breakdown</Label>
                            <div className="space-y-2 mt-2">
                              {selectedWorkout.exercise_logs?.map((log, index) => (
                                <div key={log.id} className="p-2 border rounded text-sm">
                                  <div className="font-medium">{log.exercises?.name}</div>
                                  <div className="text-muted-foreground">
                                    {log.sets_completed} sets completed
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setEditingWorkout(workout)}>
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Workout</DialogTitle>
                        <DialogDescription>
                          Update your workout details
                        </DialogDescription>
                      </DialogHeader>
                      {editingWorkout && (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name">Workout Name</Label>
                            <Input
                              id="name"
                              value={editingWorkout.name}
                              onChange={(e) => setEditingWorkout({
                                ...editingWorkout,
                                name: e.target.value
                              })}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Input
                              id="notes"
                              value={editingWorkout.notes || ''}
                              onChange={(e) => setEditingWorkout({
                                ...editingWorkout,
                                notes: e.target.value
                              })}
                              placeholder="Add workout notes..."
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="exertion">Perceived Exertion (1-10)</Label>
                              <Input
                                id="exertion"
                                type="number"
                                min="1"
                                max="10"
                                value={editingWorkout.perceived_exertion || ''}
                                onChange={(e) => setEditingWorkout({
                                  ...editingWorkout,
                                  perceived_exertion: parseInt(e.target.value) || null
                                })}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="calories">Calories Burned</Label>
                              <Input
                                id="calories"
                                type="number"
                                value={editingWorkout.calories_burned || ''}
                                onChange={(e) => setEditingWorkout({
                                  ...editingWorkout,
                                  calories_burned: parseInt(e.target.value) || null
                                })}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              value={editingWorkout.location || ''}
                              onChange={(e) => setEditingWorkout({
                                ...editingWorkout,
                                location: e.target.value
                              })}
                              placeholder="Gym, Home, Park..."
                            />
                          </div>
                          
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setEditingWorkout(null)}>
                              Cancel
                            </Button>
                            <Button onClick={() => updateWorkout(editingWorkout)}>
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredWorkouts.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Workouts Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Try adjusting your search terms" : "Start your fitness journey by logging your first workout!"}
                </p>
                <Button>Log Your First Workout</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}