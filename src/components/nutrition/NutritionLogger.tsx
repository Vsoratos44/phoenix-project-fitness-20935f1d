/**
 * Comprehensive Nutrition Logging Component
 * 
 * Allows users to search, log, and track their daily nutrition intake
 * with macro and micronutrient tracking capabilities.
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Apple, 
  Plus, 
  Search, 
  Camera,
  Target,
  TrendingUp,
  Clock,
  Utensils,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g?: number;
  serving_sizes: any; // Use any for JSON fields from Supabase
  traffic_light_category: 'green' | 'yellow' | 'red';
}

interface NutritionLog {
  id: string;
  food_id: string;
  custom_food_name?: string;
  date: string;
  meal_type: string;
  serving_amount: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  notes?: string;
  food?: FoodItem;
}

interface NutritionGoals {
  calories_target: number;
  protein_target_g: number;
  carbs_target_g: number;
  fat_target_g: number;
  fiber_target_g: number;
  water_target_ml: number;
}

interface DailyNutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  meals: {
    breakfast: NutritionLog[];
    lunch: NutritionLog[];
    dinner: NutritionLog[];
    snack: NutritionLog[];
  };
}

export function NutritionLogger() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailySummary, setDailySummary] = useState<DailyNutritionSummary | null>(null);
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [isLogging, setIsLogging] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servingAmount, setServingAmount] = useState(1);
  const [servingUnit, setServingUnit] = useState('');
  const [foodNotes, setFoodNotes] = useState('');

  const { toast } = useToast();
  const { user } = useAuth();

  // Load daily summary and goals
  useEffect(() => {
    if (user) {
      loadDailySummary();
      loadNutritionGoals();
    }
  }, [user, selectedDate]);

  const loadDailySummary = async () => {
    try {
      const { data: logs, error } = await supabase
        .from('nutrition_logs')
        .select(`
          *,
          foods (
            id, name, brand, calories_per_100g, protein_per_100g, 
            carbs_per_100g, fat_per_100g, fiber_per_100g,
            traffic_light_category, serving_sizes
          )
        `)
        .eq('user_id', user?.id)
        .eq('date', selectedDate)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by meal type and calculate totals
      const mealGroups = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: []
      };

      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      let totalFiber = 0;

      logs?.forEach((log: any) => {
        mealGroups[log.meal_type as keyof typeof mealGroups].push(log);
        totalCalories += log.calories || 0;
        totalProtein += log.protein_g || 0;
        totalCarbs += log.carbs_g || 0;
        totalFat += log.fat_g || 0;
        totalFiber += log.fiber_g || 0;
      });

      setDailySummary({
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        fiber: totalFiber,
        meals: mealGroups
      });

    } catch (error: any) {
      toast({
        title: "Failed to Load Nutrition Data",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadNutritionGoals = async () => {
    try {
      const { data: goals, error } = await supabase
        .from('nutrition_goals')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setNutritionGoals(goals);

    } catch (error: any) {
      console.error('Error loading nutrition goals:', error);
    }
  };

  const searchFoods = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const { data: foods, error } = await supabase
        .from('foods')
        .select('*')
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
        .eq('is_verified', true)
        .limit(20);

      if (error) throw error;
      
      // Transform the data to ensure proper typing
      const transformedFoods = foods?.map(food => ({
        ...food,
        serving_sizes: Array.isArray(food.serving_sizes) ? food.serving_sizes : [],
        traffic_light_category: (food.traffic_light_category as 'green' | 'yellow' | 'red') || 'yellow'
      })) || [];
      
      setSearchResults(transformedFoods as FoodItem[]);

    } catch (error: any) {
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const calculateNutrition = (food: FoodItem, amount: number, unit: string) => {
    // Convert serving to grams
    let grams = amount;
    if (unit !== 'g' && Array.isArray(food.serving_sizes)) {
      const servingSize = food.serving_sizes.find((s: any) => s.unit === unit);
      if (servingSize) {
        grams = amount * servingSize.grams;
      }
    }

    const multiplier = grams / 100;
    
    return {
      calories: Math.round((food.calories_per_100g || 0) * multiplier),
      protein: Math.round((food.protein_per_100g || 0) * multiplier * 10) / 10,
      carbs: Math.round((food.carbs_per_100g || 0) * multiplier * 10) / 10,
      fat: Math.round((food.fat_per_100g || 0) * multiplier * 10) / 10,
      fiber: Math.round((food.fiber_per_100g || 0) * multiplier * 10) / 10,
    };
  };

  const logFood = async () => {
    if (!selectedFood || !user) return;

    setIsLogging(true);

    try {
      const nutrition = calculateNutrition(selectedFood, servingAmount, servingUnit);

      const { error } = await supabase
        .from('nutrition_logs')
        .insert({
          user_id: user.id,
          food_id: selectedFood.id,
          date: selectedDate,
          meal_type: selectedMealType,
          serving_amount: servingAmount,
          serving_unit: servingUnit,
          calories: nutrition.calories,
          protein_g: nutrition.protein,
          carbs_g: nutrition.carbs,
          fat_g: nutrition.fat,
          fiber_g: nutrition.fiber,
          notes: foodNotes
        });

      if (error) throw error;

      // Trigger event for SEP rewards
      await supabase
        .from('events')
        .insert({
          event_type: 'nutrition_logged',
          event_data: {
            meal_type: selectedMealType,
            calories: nutrition.calories,
            food_name: selectedFood.name
          },
          user_id: user.id
        });

      toast({
        title: "Food Logged!",
        description: `${selectedFood.name} added to ${selectedMealType}`,
      });

      // Reset form and reload data
      setSelectedFood(null);
      setServingAmount(1);
      setServingUnit('');
      setFoodNotes('');
      loadDailySummary();

    } catch (error: any) {
      toast({
        title: "Logging Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLogging(false);
    }
  };

  const getTrafficLightColor = (category: string) => {
    switch (category) {
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMacroProgress = (current: number, target: number) => {
    return target > 0 ? Math.min((current / target) * 100, 100) : 0;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <Apple className="h-8 w-8" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">Nutrition Logger</h1>
        <p className="text-xl text-muted-foreground">
          Track your daily nutrition and reach your health goals
        </p>
      </div>

      <Tabs defaultValue="log" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="log">Log Food</TabsTrigger>
          <TabsTrigger value="daily">Daily Summary</TabsTrigger>
          <TabsTrigger value="goals">Nutrition Goals</TabsTrigger>
        </TabsList>

        {/* Food Logging Tab */}
        <TabsContent value="log" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Food Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Foods
                </CardTitle>
                <CardDescription>
                  Find foods from our comprehensive database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Food Name or Barcode</Label>
                  <Input
                    id="search"
                    placeholder="Search for foods..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchFoods(e.target.value);
                    }}
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {searchResults.map((food) => (
                      <div
                        key={food.id}
                        className={`p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors
                          ${selectedFood?.id === food.id ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => {
                          setSelectedFood(food);
                          const servingSizes = Array.isArray(food.serving_sizes) ? food.serving_sizes : [];
                          setServingUnit(servingSizes[0]?.unit || 'g');
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{food.name}</h4>
                            {food.brand && (
                              <p className="text-sm text-muted-foreground">{food.brand}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={getTrafficLightColor(food.traffic_light_category)}
                            >
                              {food.calories_per_100g} cal/100g
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Food Details & Logging */}
            {selectedFood && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Log Food
                  </CardTitle>
                  <CardDescription>
                    Add {selectedFood.name} to your nutrition log
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Meal Type Selection */}
                  <div className="space-y-2">
                    <Label>Meal Type</Label>
                    <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Serving Size */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={servingAmount}
                        onChange={(e) => setServingAmount(parseFloat(e.target.value) || 1)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Select value={servingUnit} onValueChange={setServingUnit}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="g">grams</SelectItem>
                          {Array.isArray(selectedFood.serving_sizes) && selectedFood.serving_sizes.map((serving: any, index: number) => (
                            <SelectItem key={index} value={serving.unit}>
                              {serving.unit} ({serving.grams}g)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Nutrition Preview */}
                  {servingAmount > 0 && servingUnit && (
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Nutrition Information</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {(() => {
                          const nutrition = calculateNutrition(selectedFood, servingAmount, servingUnit);
                          return (
                            <>
                              <div>Calories: {nutrition.calories}</div>
                              <div>Protein: {nutrition.protein}g</div>
                              <div>Carbs: {nutrition.carbs}g</div>
                              <div>Fat: {nutrition.fat}g</div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional notes..."
                      value={foodNotes}
                      onChange={(e) => setFoodNotes(e.target.value)}
                    />
                  </div>

                  <Button 
                    onClick={logFood} 
                    disabled={isLogging || !servingUnit}
                    className="w-full"
                  >
                    {isLogging ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Logging...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Log Food
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Daily Summary Tab */}
        <TabsContent value="daily" className="space-y-6">
          {/* Date Selection */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <Label htmlFor="date">Date:</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-auto"
                />
              </div>
            </CardContent>
          </Card>

          {/* Macro Overview */}
          {dailySummary && nutritionGoals && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Daily Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Calories */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Calories</span>
                      <span>{Math.round(dailySummary.calories)} / {nutritionGoals.calories_target}</span>
                    </div>
                    <Progress value={getMacroProgress(dailySummary.calories, nutritionGoals.calories_target)} />
                  </div>

                  {/* Protein */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Protein</span>
                      <span>{Math.round(dailySummary.protein)}g / {nutritionGoals.protein_target_g}g</span>
                    </div>
                    <Progress value={getMacroProgress(dailySummary.protein, nutritionGoals.protein_target_g)} />
                  </div>

                  {/* Carbs */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Carbs</span>
                      <span>{Math.round(dailySummary.carbs)}g / {nutritionGoals.carbs_target_g}g</span>
                    </div>
                    <Progress value={getMacroProgress(dailySummary.carbs, nutritionGoals.carbs_target_g)} />
                  </div>

                  {/* Fat */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fat</span>
                      <span>{Math.round(dailySummary.fat)}g / {nutritionGoals.fat_target_g}g</span>
                    </div>
                    <Progress value={getMacroProgress(dailySummary.fat, nutritionGoals.fat_target_g)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Meal Breakdown */}
          {dailySummary && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(dailySummary.meals).map(([mealType, logs]) => (
                <Card key={mealType}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 capitalize">
                      <Utensils className="h-5 w-5" />
                      {mealType}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {logs.length > 0 ? (
                      <div className="space-y-2">
                        {logs.map((log: any) => (
                          <div key={log.id} className="p-2 border rounded">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">
                                  {log.custom_food_name || log.foods?.name || 'Unknown Food'}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {log.serving_amount} {log.serving_unit}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">{Math.round(log.calories)} cal</div>
                                <div className="text-xs text-muted-foreground">
                                  P: {Math.round(log.protein_g)}g | C: {Math.round(log.carbs_g)}g | F: {Math.round(log.fat_g)}g
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No foods logged for {mealType}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Nutrition Goals Tab */}
        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Nutrition Goals
              </CardTitle>
              <CardDescription>
                Set your daily nutrition targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Nutrition goals management will be implemented in the next phase.
                For now, default goals are set based on general recommendations.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}