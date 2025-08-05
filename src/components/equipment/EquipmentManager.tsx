import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Settings, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Home, 
  Building, 
  Dumbbell,
  Zap,
  Search,
  Filter,
  AlertTriangle
} from "lucide-react";

interface Equipment {
  id: string;
  name: string;
  category: string;
  icon: string;
  description?: string;
  alternatives?: string[];
  common_exercises?: string[];
}

interface UserEquipment {
  equipment_id: string;
  location: 'home' | 'gym' | 'both';
  available: boolean;
  notes?: string;
}

export default function EquipmentManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([]);
  const [userEquipment, setUserEquipment] = useState<UserEquipment[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<'home' | 'gym' | 'both'>('home');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [customEquipment, setCustomEquipment] = useState({ name: "", category: "", description: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Standard equipment database
  const standardEquipment: Equipment[] = [
    {
      id: "barbell",
      name: "Barbell",
      category: "Free Weights",
      icon: "🏋️",
      description: "Olympic barbell for compound movements",
      alternatives: ["dumbbells", "resistance_bands"],
      common_exercises: ["Squats", "Deadlifts", "Bench Press", "Rows"]
    },
    {
      id: "dumbbells",
      name: "Dumbbells",
      category: "Free Weights", 
      icon: "💪",
      description: "Adjustable or fixed weight dumbbells",
      alternatives: ["resistance_bands", "kettlebells"],
      common_exercises: ["Dumbbell Press", "Rows", "Curls", "Lunges"]
    },
    {
      id: "kettlebells",
      name: "Kettlebells",
      category: "Free Weights",
      icon: "⚡",
      description: "Cast iron weights with handles",
      alternatives: ["dumbbells", "medicine_ball"],
      common_exercises: ["Swings", "Turkish Get-ups", "Snatches", "Goblet Squats"]
    },
    {
      id: "resistance_bands",
      name: "Resistance Bands",
      category: "Resistance Training",
      icon: "🔗",
      description: "Elastic bands for variable resistance",
      alternatives: ["cable_machine", "dumbbells"],
      common_exercises: ["Band Pull-aparts", "Rows", "Presses", "Squats"]
    },
    {
      id: "pull_up_bar",
      name: "Pull-up Bar",
      category: "Bodyweight",
      icon: "🏃",
      description: "Fixed or doorway pull-up bar",
      alternatives: ["resistance_bands", "lat_pulldown"],
      common_exercises: ["Pull-ups", "Chin-ups", "Hanging Leg Raises"]
    },
    {
      id: "adjustable_bench",
      name: "Adjustable Bench",
      category: "Support Equipment",
      icon: "🪑",
      description: "Incline/decline adjustable bench",
      alternatives: ["stability_ball", "floor"],
      common_exercises: ["Bench Press", "Incline Press", "Step-ups", "Bulgarian Split Squats"]
    },
    {
      id: "cable_machine",
      name: "Cable Machine",
      category: "Machines",
      icon: "🎭",
      description: "Pulley system with adjustable weight stack",
      alternatives: ["resistance_bands", "free_weights"],
      common_exercises: ["Cable Rows", "Lat Pulldowns", "Tricep Pushdowns", "Cable Flyes"]
    },
    {
      id: "squat_rack",
      name: "Squat Rack/Power Rack",
      category: "Support Equipment",
      icon: "🏗️",
      description: "Safety rack for heavy squats and bench press",
      alternatives: ["smith_machine", "bodyweight"],
      common_exercises: ["Squats", "Rack Pulls", "Overhead Press", "Bench Press"]
    },
    {
      id: "treadmill",
      name: "Treadmill",
      category: "Cardio",
      icon: "🏃‍♂️",
      description: "Motorized running/walking machine",
      alternatives: ["outdoor_running", "stationary_bike"],
      common_exercises: ["Running", "Walking", "HIIT Sprints", "Incline Walking"]
    },
    {
      id: "rowing_machine",
      name: "Rowing Machine",
      category: "Cardio",
      icon: "🚣",
      description: "Full-body cardio rowing simulator",
      alternatives: ["cable_rows", "resistance_bands"],
      common_exercises: ["Rowing Intervals", "Steady State", "HIIT Rows"]
    },
    {
      id: "medicine_ball",
      name: "Medicine Ball",
      category: "Functional Training",
      icon: "⚽",
      description: "Weighted ball for explosive movements",
      alternatives: ["kettlebells", "dumbbells"],
      common_exercises: ["Ball Slams", "Russian Twists", "Wall Balls", "Chest Pass"]
    },
    {
      id: "foam_roller",
      name: "Foam Roller",
      category: "Recovery",
      icon: "🌊",
      description: "Self-myofascial release tool",
      alternatives: ["lacrosse_ball", "massage_stick"],
      common_exercises: ["IT Band Rolling", "Quad Rolling", "Back Rolling", "Calf Rolling"]
    },
    {
      id: "yoga_mat",
      name: "Yoga/Exercise Mat",
      category: "Accessories",
      icon: "🧘",
      description: "Non-slip mat for floor exercises",
      alternatives: ["towel", "carpet"],
      common_exercises: ["Yoga", "Stretching", "Core Work", "Bodyweight Exercises"]
    },
    {
      id: "stability_ball",
      name: "Stability Ball",
      category: "Functional Training",
      icon: "🏐",
      description: "Large inflatable ball for core and stability work",
      alternatives: ["bench", "floor"],
      common_exercises: ["Ball Crunches", "Pike Push-ups", "Wall Squats", "Planks"]
    }
  ];

  useEffect(() => {
    setAvailableEquipment(standardEquipment);
    if (user) {
      loadUserEquipment();
    }
  }, [user]);

  const loadUserEquipment = async () => {
    try {
      // Load user profile to get current equipment setup
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('available_equipment')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (profile?.available_equipment) {
        // Convert profile equipment to UserEquipment format
        const userEquipmentData: UserEquipment[] = (Array.isArray(profile.available_equipment) ? profile.available_equipment : []).map((equipmentId: string) => ({
          equipment_id: equipmentId,
          location: 'home' as const,
          available: true
        }));
        
        setUserEquipment(userEquipmentData);
      }
    } catch (error) {
      console.error('Error loading user equipment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveEquipmentChanges = async () => {
    if (!user) return;

    try {
      // Extract equipment IDs that are available
      const availableEquipmentIds = userEquipment
        .filter(eq => eq.available)
        .map(eq => eq.equipment_id);

      // Update user profile
      const { error } = await supabase
        .from('profiles')
        .update({
          available_equipment: availableEquipmentIds
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setHasChanges(false);
      
      toast({
        title: "✅ Equipment Settings Saved",
        description: "Phoenix will now customize workouts based on your available equipment."
      });

    } catch (error) {
      console.error('Error saving equipment changes:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save equipment settings",
        variant: "destructive"
      });
    }
  };

  const toggleEquipment = (equipmentId: string, location: 'home' | 'gym' | 'both') => {
    const existingIndex = userEquipment.findIndex(eq => eq.equipment_id === equipmentId);
    
    if (existingIndex >= 0) {
      const updated = [...userEquipment];
      updated[existingIndex] = {
        ...updated[existingIndex],
        available: !updated[existingIndex].available,
        location
      };
      setUserEquipment(updated);
    } else {
      setUserEquipment(prev => [...prev, {
        equipment_id: equipmentId,
        location,
        available: true
      }]);
    }
    
    setHasChanges(true);
  };

  const addCustomEquipment = () => {
    if (!customEquipment.name.trim()) return;

    const newEquipment: Equipment = {
      id: `custom_${Date.now()}`,
      name: customEquipment.name,
      category: customEquipment.category || "Custom",
      icon: "🔧",
      description: customEquipment.description
    };

    setAvailableEquipment(prev => [...prev, newEquipment]);
    setCustomEquipment({ name: "", category: "", description: "" });
    
    toast({
      title: "Custom Equipment Added",
      description: `${newEquipment.name} has been added to your equipment options.`
    });
  };

  const isEquipmentSelected = (equipmentId: string) => {
    return userEquipment.some(eq => eq.equipment_id === equipmentId && eq.available);
  };

  const getEquipmentLocation = (equipmentId: string) => {
    const equipment = userEquipment.find(eq => eq.equipment_id === equipmentId);
    return equipment?.location || 'home';
  };

  const filteredEquipment = availableEquipment.filter(equipment => {
    const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || equipment.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(availableEquipment.map(eq => eq.category))];

  const getAlternativesForMissing = () => {
    const missingEquipment = standardEquipment.filter(eq => !isEquipmentSelected(eq.id));
    const alternatives = new Map<string, Equipment[]>();
    
    missingEquipment.forEach(missing => {
      if (missing.alternatives) {
        missing.alternatives.forEach(altId => {
          const alternative = standardEquipment.find(eq => eq.id === altId);
          if (alternative && isEquipmentSelected(alternative.id)) {
            if (!alternatives.has(missing.id)) {
              alternatives.set(missing.id, []);
            }
            alternatives.get(missing.id)!.push(alternative);
          }
        });
      }
    });
    
    return alternatives;
  };

  const alternatives = getAlternativesForMissing();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Loading Equipment Settings...</h3>
            <p className="text-muted-foreground">Preparing your equipment configuration</p>
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
          <div className="p-4 rounded-full bg-gradient-to-br from-blue-100 to-green-100">
            <Settings className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          Equipment Manager
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Configure your available equipment to help Phoenix generate perfectly tailored workouts
        </p>
      </div>

      {/* Save Changes Banner */}
      {hasChanges && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-800">You have unsaved changes</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  Cancel
                </Button>
                <Button size="sm" onClick={saveEquipmentChanges}>
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="equipment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="equipment" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            Equipment Selection
          </TabsTrigger>
          <TabsTrigger value="alternatives" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Exercise Alternatives
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Custom Equipment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equipment" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Find Equipment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search equipment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEquipment.map((equipment) => {
              const isSelected = isEquipmentSelected(equipment.id);
              
              return (
                <Card 
                  key={equipment.id} 
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'
                  }`}
                  onClick={() => toggleEquipment(equipment.id, selectedLocation)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{equipment.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{equipment.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {equipment.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <div className="w-5 h-5 border border-gray-300 rounded" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {equipment.description && (
                      <p className="text-sm text-muted-foreground">{equipment.description}</p>
                    )}
                    
                    {equipment.common_exercises && equipment.common_exercises.length > 0 && (
                      <div>
                        <p className="text-xs font-medium mb-2">Common Exercises:</p>
                        <div className="flex flex-wrap gap-1">
                          {equipment.common_exercises.slice(0, 3).map((exercise, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {exercise}
                            </Badge>
                          ))}
                          {equipment.common_exercises.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{equipment.common_exercises.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {isSelected && (
                      <div className="pt-2 border-t">
                        <p className="text-xs font-medium mb-2">Available at:</p>
                        <div className="flex gap-2">
                          <Button
                            variant={getEquipmentLocation(equipment.id) === 'home' ? 'default' : 'outline'}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleEquipment(equipment.id, 'home');
                            }}
                          >
                            <Home className="mr-1 h-3 w-3" />
                            Home
                          </Button>
                          <Button
                            variant={getEquipmentLocation(equipment.id) === 'gym' ? 'default' : 'outline'}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleEquipment(equipment.id, 'gym');
                            }}
                          >
                            <Building className="mr-1 h-3 w-3" />
                            Gym
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="alternatives" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exercise Alternatives</CardTitle>
              <CardDescription>
                Phoenix can substitute exercises based on your available equipment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alternatives.size === 0 ? (
                <div className="text-center py-8">
                  <Check className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Great Equipment Coverage!</h3>
                  <p className="text-muted-foreground">
                    You have good equipment coverage. Phoenix will have plenty of exercise options.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.from(alternatives.entries()).map(([missingId, availableAlts]) => {
                    const missing = standardEquipment.find(eq => eq.id === missingId);
                    if (!missing) return null;
                    
                    return (
                      <div key={missingId} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xl">{missing.icon}</span>
                          <div>
                            <h4 className="font-semibold">{missing.name}</h4>
                            <p className="text-sm text-muted-foreground">Not available</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Phoenix will use these alternatives:</p>
                          <div className="flex flex-wrap gap-2">
                            {availableAlts.map((alt) => (
                              <Badge key={alt.id} variant="secondary" className="flex items-center gap-1">
                                <span>{alt.icon}</span>
                                {alt.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Custom Equipment</CardTitle>
              <CardDescription>
                Add specialized equipment not in our standard list
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="custom_name">Equipment Name</Label>
                  <Input
                    id="custom_name"
                    placeholder="e.g., TRX Suspension Trainer"
                    value={customEquipment.name}
                    onChange={(e) => setCustomEquipment({...customEquipment, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="custom_category">Category</Label>
                  <select
                    id="custom_category"
                    value={customEquipment.category}
                    onChange={(e) => setCustomEquipment({...customEquipment, category: e.target.value})}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                    <option value="Custom">Custom Category</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="custom_description">Description (Optional)</Label>
                <Input
                  id="custom_description"
                  placeholder="Brief description of the equipment"
                  value={customEquipment.description}
                  onChange={(e) => setCustomEquipment({...customEquipment, description: e.target.value})}
                />
              </div>

              <Button
                onClick={addCustomEquipment}
                disabled={!customEquipment.name.trim()}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Custom Equipment
              </Button>
            </CardContent>
          </Card>

          {/* Custom Equipment List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Custom Equipment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {availableEquipment
                  .filter(eq => eq.id.startsWith('custom_'))
                  .map((equipment) => (
                    <div key={equipment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{equipment.icon}</span>
                        <div>
                          <h4 className="font-semibold">{equipment.name}</h4>
                          <p className="text-sm text-muted-foreground">{equipment.category}</p>
                          {equipment.description && (
                            <p className="text-xs text-muted-foreground">{equipment.description}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAvailableEquipment(prev => prev.filter(eq => eq.id !== equipment.id));
                          setUserEquipment(prev => prev.filter(eq => eq.equipment_id !== equipment.id));
                          setHasChanges(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                
                {availableEquipment.filter(eq => eq.id.startsWith('custom_')).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No custom equipment added yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}