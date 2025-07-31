/**
 * Global Search Component
 * 
 * Unified search across all content types:
 * - Exercises
 * - Workouts
 * - Food items
 * - Recipes
 * - Users (coming soon)
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  Search,
  Dumbbell,
  Utensils,
  Play,
  User,
  ChefHat,
  Target,
  Clock,
  TrendingUp
} from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'exercise' | 'workout' | 'food' | 'recipe' | 'user';
  category?: string;
  rating?: number;
  duration?: number;
  calories?: number;
  url: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearch = ({ isOpen, onClose }: GlobalSearchProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Sample data - in production this would come from your API/database
  const sampleData: SearchResult[] = [
    // Exercises
    {
      id: "ex-1",
      title: "Deadlift",
      description: "King of compound movements. Builds total-body strength and power.",
      type: "exercise",
      category: "Strength",
      rating: 4.9,
      url: "/exercises"
    },
    {
      id: "ex-2",
      title: "Push-Up",
      description: "Classic bodyweight exercise for upper body strength.",
      type: "exercise",
      category: "Bodyweight",
      rating: 4.7,
      url: "/exercises"
    },
    {
      id: "ex-3",
      title: "Burpees",
      description: "High-intensity full-body exercise combining strength and cardio.",
      type: "exercise",
      category: "HIIT",
      rating: 4.2,
      url: "/exercises"
    },
    
    // Workouts
    {
      id: "wo-1",
      title: "Upper Body Strength Circuit",
      description: "Progressive overload focused workout for building muscle.",
      type: "workout",
      category: "Strength",
      duration: 45,
      url: "/workouts"
    },
    {
      id: "wo-2",
      title: "HIIT Fat Burner",
      description: "High-intensity interval training for maximum calorie burn.",
      type: "workout",
      category: "Cardio",
      duration: 30,
      url: "/workouts"
    },
    {
      id: "wo-3",
      title: "Full Body Functional",
      description: "Balanced workout combining strength, cardio, and mobility.",
      type: "workout",
      category: "Functional",
      duration: 50,
      url: "/workouts"
    },
    
    // Food items
    {
      id: "food-1",
      title: "Chicken Breast",
      description: "Lean protein source, perfect for muscle building.",
      type: "food",
      category: "Protein",
      calories: 165,
      url: "/nutrition"
    },
    {
      id: "food-2",
      title: "Brown Rice",
      description: "Complex carbohydrate for sustained energy.",
      type: "food",
      category: "Carbs",
      calories: 218,
      url: "/nutrition"
    },
    {
      id: "food-3",
      title: "Avocado",
      description: "Healthy fats and fiber for optimal nutrition.",
      type: "food",
      category: "Healthy Fats",
      calories: 160,
      url: "/nutrition"
    },
    
    // Recipes
    {
      id: "recipe-1",
      title: "Post-Workout Protein Smoothie",
      description: "Perfect recovery drink with banana, protein powder, and berries.",
      type: "recipe",
      category: "Recovery",
      calories: 285,
      url: "/nutrition"
    },
    {
      id: "recipe-2",
      title: "Grilled Chicken Bowl",
      description: "Balanced meal with quinoa, vegetables, and lean protein.",
      type: "recipe",
      category: "Main Dish",
      calories: 420,
      url: "/nutrition"
    }
  ];

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay
    const timeoutId = setTimeout(() => {
      const filtered = sampleData.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setResults(filtered);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'exercise':
        return <Dumbbell className="h-4 w-4" />;
      case 'workout':
        return <Play className="h-4 w-4" />;
      case 'food':
        return <Utensils className="h-4 w-4" />;
      case 'recipe':
        return <ChefHat className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exercise':
        return 'bg-blue-100 text-blue-800';
      case 'workout':
        return 'bg-green-100 text-green-800';
      case 'food':
        return 'bg-orange-100 text-orange-800';
      case 'recipe':
        return 'bg-purple-100 text-purple-800';
      case 'user':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    onClose();
    setSearchQuery("");
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Global Search
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises, workouts, food, recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto px-6 pb-6">
          {!searchQuery.trim() && (
            <div className="py-8 text-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Button
                  variant="outline"
                  className="h-auto flex-col p-4"
                  onClick={() => setSearchQuery("strength")}
                >
                  <Dumbbell className="h-6 w-6 mb-2 text-blue-500" />
                  <span className="text-sm">Exercises</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col p-4"
                  onClick={() => setSearchQuery("HIIT")}
                >
                  <Play className="h-6 w-6 mb-2 text-green-500" />
                  <span className="text-sm">Workouts</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col p-4"
                  onClick={() => setSearchQuery("protein")}
                >
                  <Utensils className="h-6 w-6 mb-2 text-orange-500" />
                  <span className="text-sm">Food</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col p-4"
                  onClick={() => setSearchQuery("smoothie")}
                >
                  <ChefHat className="h-6 w-6 mb-2 text-purple-500" />
                  <span className="text-sm">Recipes</span>
                </Button>
              </div>
              <p className="text-muted-foreground text-sm">
                Try searching for "deadlift", "HIIT", "chicken", or "smoothie"
              </p>
            </div>
          )}

          {isSearching && (
            <div className="py-8 text-center">
              <div className="animate-spin h-6 w-6 mx-auto mb-2 border-2 border-primary border-t-transparent rounded-full" />
              <p className="text-muted-foreground text-sm">Searching...</p>
            </div>
          )}

          {searchQuery.trim() && !isSearching && results.length === 0 && (
            <div className="py-8 text-center">
              <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
            </div>
          )}

          {Object.entries(groupedResults).map(([type, typeResults]) => (
            <div key={type} className="mb-6">
              <h3 className="font-semibold mb-3 capitalize flex items-center gap-2">
                {getIcon(type)}
                {type}s ({typeResults.length})
              </h3>
              <div className="space-y-2">
                {typeResults.map((result) => (
                  <div
                    key={result.id}
                    className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium">{result.title}</h4>
                        <p className="text-sm text-muted-foreground">{result.description}</p>
                      </div>
                      <Badge variant="outline" className={getTypeColor(result.type)}>
                        {result.category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {result.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {result.duration}min
                        </div>
                      )}
                      {result.calories && (
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {result.calories} cal
                        </div>
                      )}
                      {result.rating && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {result.rating} rating
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSearch;