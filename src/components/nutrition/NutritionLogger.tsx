/**
 * Enhanced Nutrition Logging Component
 * 
 * Features inspired by MyFitnessPal and Noom:
 * - Color-coded food tracking system
 * - Macro progress rings
 * - Comprehensive food database
 * - Daily summaries and goal tracking
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  CheckCircle,
  Trophy,
  Flame,
  Calendar
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
  serving_sizes: any;
  traffic_light_category: 'green' | 'yellow' | 'red';
  food_group?: string;
  category?: string;
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
  foods?: FoodItem;
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
  const [categoryFoods, setCategoryFoods] = useState<FoodItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

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
            traffic_light_category, serving_sizes, food_group, category
          )
        `)
        .eq('user_id', user?.id)
        .eq('date', selectedDate)
        .order('created_at', { ascending: true });

      if (error) throw error;

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

  const loadCategoryFoods = async (category: string) => {
    try {
      const { data: foods, error } = await supabase
        .from('foods')
        .select('*')
        .eq('traffic_light_category', category)
        .eq('is_verified', true)
        .order('food_group')
        .order('name');

      if (error) throw error;
      
      const transformedFoods = foods?.map(food => ({
        ...food,
        serving_sizes: Array.isArray(food.serving_sizes) ? food.serving_sizes : [],
        traffic_light_category: (food.traffic_light_category as 'green' | 'yellow' | 'red') || 'yellow'
      })) || [];
      
      setCategoryFoods(transformedFoods as FoodItem[]);
      setSelectedCategory(category);
      setCategoryModalOpen(true);
    } catch (error: any) {
      toast({
        title: "Failed to Load Category Foods",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const calculateNutrition = (food: FoodItem, amount: number, unit: string) => {
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

  const MacroRing = ({ current, target, color, label }: { current: number; target: number; color: string; label: string }) => {
    const percentage = getMacroProgress(current, target);
    return (
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-2">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-muted/20"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${percentage}, 100`}
              className={color}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-bold ${color.replace('text-', 'text-')}`}>
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">
          {Math.round(current)} / {target}{label === 'Calories' ? '' : 'g'}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <Apple className="h-8 w-8" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">Nutrition Tracker</h1>
        <p className="text-xl text-muted-foreground">
          Smart food logging with color-coded guidance
        </p>
      </div>

      <Tabs defaultValue="daily" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">Today's Progress</TabsTrigger>
          <TabsTrigger value="log">Log Food</TabsTrigger>
          <TabsTrigger value="goals">Goals & Settings</TabsTrigger>
        </TabsList>

        {/* Daily Progress Tab - Enhanced with Macro Rings */}
        <TabsContent value="daily" className="space-y-6">
          {/* Progress Hero Section */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Trophy className="h-6 w-6" />
                    Today's Progress
                  </h2>
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary flex items-center gap-2">
                    <Flame className="h-8 w-8" />
                    {Object.values(dailySummary?.meals || {}).flat().length}
                  </div>
                  <div className="text-sm text-muted-foreground">meals logged</div>
                </div>
              </div>
              
              {/* Macro Progress Rings */}
              {nutritionGoals && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <MacroRing 
                    current={dailySummary?.calories || 0} 
                    target={nutritionGoals.calories_target} 
                    color="text-orange-500" 
                    label="Calories" 
                  />
                  <MacroRing 
                    current={dailySummary?.protein || 0} 
                    target={nutritionGoals.protein_target_g} 
                    color="text-blue-500" 
                    label="Protein" 
                  />
                  <MacroRing 
                    current={dailySummary?.carbs || 0} 
                    target={nutritionGoals.carbs_target_g} 
                    color="text-green-500" 
                    label="Carbs" 
                  />
                  <MacroRing 
                    current={dailySummary?.fat || 0} 
                    target={nutritionGoals.fat_target_g} 
                    color="text-purple-500" 
                    label="Fat" 
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Food Color Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Food Quality Guide
              </CardTitle>
              <CardDescription>
                Color-coded system to help you make healthier choices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div 
                  className="text-center p-4 rounded-lg bg-green-50 border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                  onClick={() => loadCategoryFoods('green')}
                >
                  <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <h3 className="font-semibold text-green-800">Green Foods</h3>
                  <p className="text-sm text-green-600">Most of your calories should come from these nutrient-dense, lower-calorie foods</p>
                </div>
                <div 
                  className="text-center p-4 rounded-lg bg-yellow-50 border border-yellow-200 cursor-pointer hover:bg-yellow-100 transition-colors"
                  onClick={() => loadCategoryFoods('yellow')}
                >
                  <div className="w-4 h-4 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                  <h3 className="font-semibold text-yellow-800">Yellow Foods</h3>
                  <p className="text-sm text-yellow-600">Lean proteins, healthy fats, and complex carbs - enjoy in moderation</p>
                </div>
                <div 
                  className="text-center p-4 rounded-lg bg-red-50 border border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
                  onClick={() => loadCategoryFoods('red')}
                >
                  <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-2"></div>
                  <h3 className="font-semibold text-red-800">Red Foods</h3>
                  <p className="text-sm text-red-600">Calorie-dense foods - limit these but don't eliminate them completely</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meals Breakdown */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => (
              <Card key={mealType} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg capitalize flex items-center gap-2">
                    <Utensils className="h-4 w-4" />
                    {mealType}
                    <Badge variant="outline" className="ml-auto">
                      {dailySummary?.meals?.[mealType as keyof typeof dailySummary.meals]?.length || 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dailySummary?.meals?.[mealType as keyof typeof dailySummary.meals]?.length ? (
                    dailySummary.meals[mealType as keyof typeof dailySummary.meals].map((log: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${
                            log.foods?.traffic_light_category === 'green' ? 'bg-green-500' :
                            log.foods?.traffic_light_category === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <div className="font-medium text-sm">
                            {log.foods?.name || log.custom_food_name}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {log.serving_amount} {log.serving_unit} • {log.calories} cal
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          P: {Math.round(log.protein_g || 0)}g • C: {Math.round(log.carbs_g || 0)}g • F: {Math.round(log.fat_g || 0)}g
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground text-sm py-8 border-2 border-dashed rounded-lg">
                      <Utensils className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <div>No foods logged yet</div>
                      <div className="text-xs">Switch to "Log Food" tab to add items</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

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
                  <Label htmlFor="search">Food Name or Brand</Label>
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
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              food.traffic_light_category === 'green' ? 'bg-green-500' :
                              food.traffic_light_category === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            <div>
                              <h4 className="font-medium">{food.name}</h4>
                              {food.brand && (
                                <p className="text-sm text-muted-foreground">{food.brand}</p>
                              )}
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={getTrafficLightColor(food.traffic_light_category)}
                          >
                            {food.calories_per_100g} cal/100g
                          </Badge>
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
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Nutrition Goals
              </CardTitle>
              <CardDescription>
                Set your daily macro and calorie targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {nutritionGoals ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Current Goals</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Daily Calories:</span>
                        <span className="font-medium">{nutritionGoals.calories_target}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Protein:</span>
                        <span className="font-medium">{nutritionGoals.protein_target_g}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Carbohydrates:</span>
                        <span className="font-medium">{nutritionGoals.carbs_target_g}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fat:</span>
                        <span className="font-medium">{nutritionGoals.fat_target_g}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fiber:</span>
                        <span className="font-medium">{nutritionGoals.fiber_target_g}g</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Recommendations</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Aim for 0.8-1g protein per kg body weight</p>
                      <p>• Include 25-35g fiber daily for digestive health</p>
                      <p>• Focus on whole, minimally processed foods</p>
                      <p>• Stay hydrated with 8-10 glasses of water daily</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No Goals Set</h3>
                  <p className="text-muted-foreground mb-4">
                    Set up your nutrition goals to start tracking your progress
                  </p>
                  <Button>Set Up Goals</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Food Category Modal */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${
                selectedCategory === 'green' ? 'bg-green-500' :
                selectedCategory === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              {selectedCategory && selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Foods
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Group foods by food_group */}
            {categoryFoods.length > 0 ? (
              (() => {
                const groupedFoods = categoryFoods.reduce((groups: { [key: string]: FoodItem[] }, food) => {
                  const group = food.food_group || 'Other';
                  if (!groups[group]) groups[group] = [];
                  groups[group].push(food);
                  return groups;
                }, {});

                return Object.entries(groupedFoods).map(([group, foods]) => (
                  <div key={group}>
                    <h3 className="text-lg font-semibold mb-3 text-foreground">{group}</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {foods.map((food: FoodItem) => (
                        <div
                          key={food.id}
                          className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedFood(food);
                            const servingSizes = Array.isArray(food.serving_sizes) ? food.serving_sizes : [];
                            setServingUnit(servingSizes[0]?.unit || 'g');
                            setCategoryModalOpen(false);
                            // Switch to the log tab
                            const tabsTrigger = document.querySelector('[value="log"]') as HTMLElement;
                            tabsTrigger?.click();
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{food.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {food.calories_per_100g} cal/100g
                            </Badge>
                          </div>
                          {food.brand && (
                            <p className="text-xs text-muted-foreground mb-1">{food.brand}</p>
                          )}
                          <div className="text-xs text-muted-foreground">
                            P: {Math.round(food.protein_per_100g || 0)}g • 
                            C: {Math.round(food.carbs_per_100g || 0)}g • 
                            F: {Math.round(food.fat_per_100g || 0)}g
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No foods found in this category.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}