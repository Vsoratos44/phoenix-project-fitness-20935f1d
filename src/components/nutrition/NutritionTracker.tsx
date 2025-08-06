import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus, Utensils, Target } from "lucide-react";

interface FoodItem {
  food_id: string;
  name: string;
  quantity_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface DailyTargets {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface MealLog {
  id?: string;
  meal_type: string;
  food_items: FoodItem[];
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
}

export default function NutritionTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [foods, setFoods] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentMeal, setCurrentMeal] = useState<MealLog>({
    meal_type: "breakfast",
    food_items: [],
    total_calories: 0,
    total_protein_g: 0,
    total_carbs_g: 0,
    total_fat_g: 0
  });
  const [dailyTotals, setDailyTotals] = useState({
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0
  });
  const [targets] = useState<DailyTargets>({
    calories: 2000,
    protein_g: 150,
    carbs_g: 200,
    fat_g: 67
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFoods();
    loadTodaysTotals();
  }, [user]);

  const loadFoods = async () => {
    try {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .eq('is_verified', true)
        .limit(50);

      if (error) throw error;
      setFoods(data || []);
    } catch (error) {
      console.error('Error loading foods:', error);
    }
  };

  const loadTodaysTotals = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today);

      if (error) throw error;

      const totals = data?.reduce((acc, meal) => ({
        calories: acc.calories + (meal.total_calories || 0),
        protein_g: acc.protein_g + (meal.total_protein_g || 0),
        carbs_g: acc.carbs_g + (meal.total_carbs_g || 0),
        fat_g: acc.fat_g + (meal.total_fat_g || 0)
      }), { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }) || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };

      setDailyTotals(totals);
    } catch (error) {
      console.error('Error loading daily totals:', error);
    }
  };

  const addFoodToMeal = (food: any, quantity: number = 100) => {
    const calories = (food.calories_per_100g * quantity) / 100;
    const protein = (food.protein_per_100g * quantity) / 100;
    const carbs = (food.carbs_per_100g * quantity) / 100;
    const fat = (food.fat_per_100g * quantity) / 100;

    const foodItem: FoodItem = {
      food_id: food.id,
      name: food.name,
      quantity_g: quantity,
      calories,
      protein_g: protein,
      carbs_g: carbs,
      fat_g: fat
    };

    setCurrentMeal(prev => ({
      ...prev,
      food_items: [...prev.food_items, foodItem],
      total_calories: prev.total_calories + calories,
      total_protein_g: prev.total_protein_g + protein,
      total_carbs_g: prev.total_carbs_g + carbs,
      total_fat_g: prev.total_fat_g + fat
    }));
  };

  const saveMeal = async () => {
    if (!user || currentMeal.food_items.length === 0) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('meal_logs')
        .insert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          meal_type: currentMeal.meal_type,
          food_items: currentMeal.food_items as any,
          total_calories: currentMeal.total_calories,
          total_protein_g: currentMeal.total_protein_g,
          total_carbs_g: currentMeal.total_carbs_g,
          total_fat_g: currentMeal.total_fat_g,
          meal_time: new Date().toISOString()
        });

      if (error) throw error;

      // Create event for Phoenix Score recalculation
      await supabase
        .from('events')
        .insert({
          user_id: user.id,
          event_type: 'nutrition_logged',
          event_data: {
            meal_type: currentMeal.meal_type,
            calories: currentMeal.total_calories,
            protein: currentMeal.total_protein_g
          }
        });

      toast({
        title: "Meal Logged!",
        description: `${currentMeal.meal_type} has been saved to your nutrition log.`
      });

      // Reset current meal
      setCurrentMeal({
        meal_type: "breakfast",
        food_items: [],
        total_calories: 0,
        total_protein_g: 0,
        total_carbs_g: 0,
        total_fat_g: 0
      });

      // Reload daily totals
      loadTodaysTotals();

    } catch (error) {
      console.error('Error saving meal:', error);
      toast({
        title: "Error",
        description: "Failed to save meal",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Daily Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Today's Nutrition Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Calories</div>
              <div className="text-2xl font-bold">{Math.round(dailyTotals.calories)}</div>
              <Progress value={(dailyTotals.calories / targets.calories) * 100} className="mt-1" />
              <div className="text-xs text-muted-foreground">/ {targets.calories}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Protein</div>
              <div className="text-2xl font-bold">{Math.round(dailyTotals.protein_g)}g</div>
              <Progress value={(dailyTotals.protein_g / targets.protein_g) * 100} className="mt-1" />
              <div className="text-xs text-muted-foreground">/ {targets.protein_g}g</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Carbs</div>
              <div className="text-2xl font-bold">{Math.round(dailyTotals.carbs_g)}g</div>
              <Progress value={(dailyTotals.carbs_g / targets.carbs_g) * 100} className="mt-1" />
              <div className="text-xs text-muted-foreground">/ {targets.carbs_g}g</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Fat</div>
              <div className="text-2xl font-bold">{Math.round(dailyTotals.fat_g)}g</div>
              <Progress value={(dailyTotals.fat_g / targets.fat_g) * 100} className="mt-1" />
              <div className="text-xs text-muted-foreground">/ {targets.fat_g}g</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Food Search & Add */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Add Food
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="meal-type">Meal Type</Label>
              <Select 
                value={currentMeal.meal_type} 
                onValueChange={(value) => setCurrentMeal(prev => ({ ...prev, meal_type: value }))}
              >
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

            <div>
              <Label htmlFor="food-search">Search Foods</Label>
              <Input
                id="food-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for foods..."
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredFoods.map((food) => (
                <div key={food.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{food.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {food.calories_per_100g} cal, {food.protein_per_100g}g protein per 100g
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => addFoodToMeal(food)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Meal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Current Meal
              <Badge variant="outline" className="ml-auto">
                {currentMeal.meal_type}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentMeal.food_items.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No foods added yet. Search and add foods to build your meal.
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  {currentMeal.food_items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm p-2 bg-muted rounded">
                      <span>{item.name} ({item.quantity_g}g)</span>
                      <span>{Math.round(item.calories)} cal</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Calories: {Math.round(currentMeal.total_calories)}</div>
                    <div>Protein: {Math.round(currentMeal.total_protein_g)}g</div>
                    <div>Carbs: {Math.round(currentMeal.total_carbs_g)}g</div>
                    <div>Fat: {Math.round(currentMeal.total_fat_g)}g</div>
                  </div>
                </div>

                <Button 
                  onClick={saveMeal} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Saving..." : "Save Meal"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}