import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Award, Target, Calendar } from "lucide-react";

const StatsSection = () => {
  return (
    <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Track Your
            <span className="block bg-gradient-to-r from-primary to-fitness-orange bg-clip-text text-transparent">
              Progress
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See your transformation with detailed analytics, achievement tracking, and personalized insights
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Weekly Overview */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-card to-background/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">This Week's Progress</h3>
                <div className="flex items-center gap-2 text-fitness-green">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">+12% from last week</span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/10 rounded-2xl border border-primary/20">
                  <div className="text-3xl font-bold text-primary mb-2">5</div>
                  <div className="text-sm text-muted-foreground">Workouts Completed</div>
                  <Progress value={83} className="mt-3" />
                </div>
                <div className="text-center p-6 bg-fitness-orange/10 rounded-2xl border border-fitness-orange/20">
                  <div className="text-3xl font-bold text-fitness-orange mb-2">2,840</div>
                  <div className="text-sm text-muted-foreground">Calories Burned</div>
                  <Progress value={94} className="mt-3" />
                </div>
                <div className="text-center p-6 bg-fitness-green-bright/10 rounded-2xl border border-fitness-green-bright/20">
                  <div className="text-3xl font-bold text-fitness-green-bright mb-2">8h 32m</div>
                  <div className="text-sm text-muted-foreground">Active Time</div>
                  <Progress value={76} className="mt-3" />
                </div>
              </div>

              {/* Weekly Chart Placeholder */}
              <div className="bg-secondary/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">Daily Activity</span>
                  <span className="text-sm text-muted-foreground">Last 7 days</span>
                </div>
                <div className="flex items-end justify-between h-32 gap-2">
                  {[40, 65, 80, 45, 90, 75, 85].map((height, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-gradient-to-t from-primary to-fitness-orange rounded-t-lg transition-all duration-500 hover:opacity-80"
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-xs text-muted-foreground">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements & Goals */}
          <div className="space-y-6">
            {/* Recent Achievements */}
            <Card className="bg-gradient-to-br from-card to-background/80 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="w-6 h-6 text-fitness-orange" />
                  <h3 className="text-xl font-bold">Recent Achievements</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-fitness-orange/10 rounded-xl border border-fitness-orange/20">
                    <div className="w-10 h-10 bg-fitness-orange rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-foreground">🔥</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm">5-Day Streak</div>
                      <div className="text-xs text-muted-foreground">Consistency Champion</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-xl border border-primary/20">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-foreground">💪</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm">New PR Set</div>
                      <div className="text-xs text-muted-foreground">Strength Builder</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-fitness-green/10 rounded-xl border border-fitness-green/20">
                    <div className="w-10 h-10 bg-fitness-green rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-foreground">🎯</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Goal Reached</div>
                      <div className="text-xs text-muted-foreground">Target Achiever</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Goals */}
            <Card className="bg-gradient-to-br from-card to-background/80 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-bold">Current Goals</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">Weekly Workouts</span>
                      <span className="text-sm text-muted-foreground">5/7</span>
                    </div>
                    <Progress value={71} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">Calorie Target</span>
                      <span className="text-sm text-muted-foreground">2,840/3,500</span>
                    </div>
                    <Progress value={81} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">Active Minutes</span>
                      <span className="text-sm text-muted-foreground">512/600</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;