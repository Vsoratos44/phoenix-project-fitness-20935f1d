import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, Trophy, Flame, Heart, Target } from "lucide-react";

export default function ActivityPage() {
  const recentActivities = [
    {
      id: 1,
      type: "workout",
      title: "Completed Upper Body Strength",
      description: "45 minutes • 12 exercises",
      time: "2 hours ago",
      icon: Activity,
      sepEarned: 85
    },
    {
      id: 2,
      type: "achievement",
      title: "Week Warrior Achievement Unlocked",
      description: "Completed 7 workouts this week",
      time: "1 day ago",
      icon: Trophy,
      sepEarned: 150
    },
    {
      id: 3,
      type: "nutrition",
      title: "Logged Daily Nutrition",
      description: "2,150 calories • 150g protein",
      time: "3 hours ago",
      icon: Heart,
      sepEarned: 25
    },
    {
      id: 4,
      type: "challenge",
      title: "30-Day Challenge Progress",
      description: "Day 15 of 30 completed",
      time: "1 day ago",
      icon: Target,
      sepEarned: 0
    },
    {
      id: 5,
      type: "workout",
      title: "Completed HIIT Session",
      description: "30 minutes • High intensity",
      time: "2 days ago",
      icon: Flame,
      sepEarned: 120
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'workout': return 'text-blue-500';
      case 'achievement': return 'text-yellow-500';
      case 'nutrition': return 'text-green-500';
      case 'challenge': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Activity Feed</h1>
          <p className="text-muted-foreground">Track your fitness journey and recent activities</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Activities</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">activities logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEP Earned Today</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">110</div>
            <p className="text-xs text-muted-foreground">points earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workout Streak</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5/7</div>
            <p className="text-xs text-muted-foreground">workouts completed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest fitness activities and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className={`p-2 rounded-full bg-muted ${getTypeColor(activity.type)}`}>
                  <activity.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                {activity.sepEarned > 0 && (
                  <div className="text-right">
                    <div className="text-sm font-medium text-primary">+{activity.sepEarned} SEP</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Analytics</CardTitle>
          <CardDescription>
            Detailed activity tracking and insights coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will include detailed activity charts, patterns, and personalized insights 
            about your fitness journey and habits.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}