/**
 * Phoenix Project Fitness - Main Dashboard
 * 
 * Comprehensive dashboard showcasing all microservices:
 * - Phoenix Score & Analytics
 * - Workout Overview & Quick Actions
 * - Nutrition Summary
 * - Social Activity Feed
 * - Achievement Progress
 * - SEP Points & Rewards
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Calendar,
  Dumbbell,
  Flame,
  Heart,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Utensils,
  Zap
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, Phoenix!</h1>
        <p className="text-muted-foreground">
          Ready to crush your fitness goals today? Your Phoenix Score is looking strong.
        </p>
      </div>

      {/* Phoenix Score & Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phoenix Score</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">87</div>
            <p className="text-xs text-muted-foreground">
              +5 from yesterday
            </p>
            <div className="mt-2">
              <Progress value={87} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 <span className="text-sm font-normal">workouts</span></div>
            <p className="text-xs text-muted-foreground">
              2 more than last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEP Points</CardTitle>
            <Flame className="h-4 w-4 text-fitness-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-fitness-orange">1,245</div>
            <p className="text-xs text-muted-foreground">
              +120 today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,340</div>
            <p className="text-xs text-muted-foreground">
              Goal: 2,500 (96%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Primary Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Workout */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    Today's Workout
                  </CardTitle>
                  <CardDescription>
                    AI-generated based on your Phoenix Score and preferences
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-fitness-green-electric/10 text-fitness-green-electric">
                  Optimized
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-gradient-to-r from-primary/10 to-fitness-orange/10 p-4">
                <h3 className="font-semibold mb-2">Upper Body Strength Circuit</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="ml-2 font-medium">45 minutes</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Exercises:</span>
                    <span className="ml-2 font-medium">8 exercises</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Difficulty:</span>
                    <span className="ml-2 font-medium">Intermediate</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Equipment:</span>
                    <span className="ml-2 font-medium">Dumbbells</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button className="flex-1" size="lg">
                  <Zap className="h-4 w-4 mr-2" />
                  Start Workout
                </Button>
                <Button variant="outline" size="lg">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Nutrition Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Nutrition Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">1,680</div>
                  <div className="text-xs text-muted-foreground">Calories</div>
                  <Progress value={67} className="h-1 mt-1" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">120g</div>
                  <div className="text-xs text-muted-foreground">Protein</div>
                  <Progress value={80} className="h-1 mt-1" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">180g</div>
                  <div className="text-xs text-muted-foreground">Carbs</div>
                  <Progress value={72} className="h-1 mt-1" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">45g</div>
                  <div className="text-xs text-muted-foreground">Fat</div>
                  <Progress value={56} className="h-1 mt-1" />
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Log Meal
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Social & Achievements */}
        <div className="space-y-6">
          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-yellow-500/10">
                <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  🔥
                </div>
                <div>
                  <div className="font-medium text-sm">Week Streak!</div>
                  <div className="text-xs text-muted-foreground">7 days in a row</div>
                </div>
                <Badge variant="secondary" className="ml-auto">+50 SEP</Badge>
              </div>

              <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-500/10">
                <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  💪
                </div>
                <div>
                  <div className="font-medium text-sm">Personal Record</div>
                  <div className="text-xs text-muted-foreground">Deadlift 225lbs</div>
                </div>
                <Badge variant="secondary" className="ml-auto">+75 SEP</Badge>
              </div>

              <Button variant="outline" className="w-full" size="sm">
                View All Achievements
              </Button>
            </CardContent>
          </Card>

          {/* Community Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Community Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-fitness-orange" />
                  <div className="flex-1 text-sm">
                    <span className="font-medium">Alex</span> completed a 
                    <span className="text-primary"> HIIT workout</span>
                    <div className="text-xs text-muted-foreground">2 hours ago</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-fitness-green-bright to-fitness-green-electric" />
                  <div className="flex-1 text-sm">
                    <span className="font-medium">Maya</span> achieved a new 
                    <span className="text-fitness-green-bright"> squat PR</span>
                    <div className="text-xs text-muted-foreground">4 hours ago</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-fitness-orange to-red-500" />
                  <div className="flex-1 text-sm">
                    <span className="font-medium">Jordan</span> joined the 
                    <span className="text-fitness-orange"> 30-Day Challenge</span>
                    <div className="text-xs text-muted-foreground">6 hours ago</div>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full" size="sm">
                Join Community
              </Button>
            </CardContent>
          </Card>

          {/* Active Challenges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Active Challenges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-gradient-to-r from-fitness-green-bright/10 to-fitness-green-electric/10 border border-fitness-green-bright/20">
                <div className="font-medium text-sm mb-1">January Consistency</div>
                <div className="text-xs text-muted-foreground mb-2">
                  Work out 20 days this month
                </div>
                <div className="flex items-center justify-between">
                  <Progress value={65} className="flex-1 h-2" />
                  <span className="text-xs font-medium ml-2">13/20</span>
                </div>
              </div>

              <Button variant="outline" className="w-full" size="sm">
                Browse Challenges
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}