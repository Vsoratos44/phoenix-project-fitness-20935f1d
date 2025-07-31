import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Medal, Trophy, Award, Star, Target, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AchievementsPage() {
  const achievements = [
    {
      id: 1,
      title: "First Workout",
      description: "Complete your first workout",
      icon: Trophy,
      unlocked: true,
      rarity: "common",
      sepReward: 50,
      unlockedDate: "2024-01-15"
    },
    {
      id: 2,
      title: "Week Warrior",
      description: "Complete 7 workouts in a week",
      icon: Flame,
      unlocked: true,
      rarity: "uncommon",
      sepReward: 100,
      unlockedDate: "2024-01-22"
    },
    {
      id: 3,
      title: "Phoenix Rising",
      description: "Achieve a Phoenix Score of 2000+",
      icon: Star,
      unlocked: false,
      rarity: "rare",
      sepReward: 500,
      progress: 75
    },
    {
      id: 4,
      title: "Iron Will",
      description: "Complete 100 workouts",
      icon: Award,
      unlocked: false,
      rarity: "epic",
      sepReward: 1000,
      progress: 34
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Medal className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Achievements</h1>
          <p className="text-muted-foreground">Unlock rewards by reaching fitness milestones</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unlocked</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">achievements earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEP Earned</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,150</div>
            <p className="text-xs text-muted-foreground">from achievements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">43%</div>
            <p className="text-xs text-muted-foreground">total progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rare Items</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">rare achievements</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Achievements</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          {achievements.map((achievement) => (
            <Card key={achievement.id} className={`${achievement.unlocked ? 'border-primary/50' : 'border-muted'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${achievement.unlocked ? 'bg-primary/10' : 'bg-muted'}`}>
                      <achievement.icon className={`h-5 w-5 ${achievement.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <CardTitle className={`text-lg ${!achievement.unlocked && 'text-muted-foreground'}`}>
                        {achievement.title}
                      </CardTitle>
                      <CardDescription>{achievement.description}</CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getRarityColor(achievement.rarity)}>
                      {achievement.rarity}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">
                      {achievement.sepReward} SEP
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {achievement.unlocked ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Trophy className="h-4 w-4" />
                    <span>Unlocked on {achievement.unlockedDate}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{achievement.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}