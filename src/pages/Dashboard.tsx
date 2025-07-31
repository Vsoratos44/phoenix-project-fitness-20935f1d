import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Target, 
  Trophy, 
  Calendar, 
  TrendingUp,
  Settings,
  LogOut,
  Dumbbell,
  Timer,
  Zap
} from 'lucide-react';

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Dumbbell className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Phoenix Fitness</h1>
              <p className="text-sm text-muted-foreground">{formatTime(currentTime)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">
            {getGreeting()}, {user.user_metadata?.first_name || 'Athlete'}! 💪
          </h2>
          <p className="text-muted-foreground">Ready to crush your fitness goals today?</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3/5</div>
              <div className="text-xs text-muted-foreground">Workouts completed</div>
              <Progress value={60} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7 days</div>
              <div className="text-xs text-muted-foreground">Personal best!</div>
              <div className="flex space-x-1 mt-2">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-2 w-2 bg-primary rounded-full" />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <div className="text-xs text-muted-foreground">This month</div>
              <div className="text-xs text-primary mt-1">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Score</CardTitle>
              <Zap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8.7/10</div>
              <div className="text-xs text-muted-foreground">Fitness intelligence</div>
              <Badge variant="secondary" className="mt-2">Excellent</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Today's Workout */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Today's AI-Generated Workout</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Upper Body Power Focus</h3>
                <p className="text-sm text-muted-foreground">
                  Customized based on your progress and energy levels
                </p>
              </div>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Timer className="h-3 w-3" />
                <span>45 min</span>
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Warm-up</span>
                <span className="text-muted-foreground">5 min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Strength Training</span>
                <span className="text-muted-foreground">30 min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cool-down</span>
                <span className="text-muted-foreground">10 min</span>
              </div>
            </div>

            <Button className="w-full">
              Start Workout
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { date: '2024-01-30', workout: 'Full Body Strength', duration: '42 min', score: '9.2' },
                { date: '2024-01-29', workout: 'Cardio Blast', duration: '35 min', score: '8.8' },
                { date: '2024-01-28', workout: 'Lower Body Focus', duration: '48 min', score: '9.0' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div>
                    <p className="font-medium">{activity.workout}</p>
                    <p className="text-sm text-muted-foreground">{activity.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{activity.duration}</p>
                    <Badge variant="secondary" className="text-xs">
                      Score: {activity.score}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;