import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Medal, Trophy, Crown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LeaderboardsPage() {
  const mockLeaderboard = [
    { rank: 1, name: "FitnessKing", score: 2847, change: "+15" },
    { rank: 2, name: "IronWarrior", score: 2753, change: "+8" },
    { rank: 3, name: "FlexMaster", score: 2698, change: "-2" },
    { rank: 4, name: "PowerLifter", score: 2645, change: "+12" },
    { rank: 5, name: "BeastMode", score: 2598, change: "+5" },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Leaderboards</h1>
          <p className="text-muted-foreground">See how you rank among the Phoenix Fitness community</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Rank</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#47</div>
            <p className="text-xs text-muted-foreground">+3 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phoenix Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,847</div>
            <p className="text-xs text-muted-foreground">personal best</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEP Points</CardTitle>
            <Medal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,245</div>
            <p className="text-xs text-muted-foreground">total earned</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="phoenix-score" className="space-y-4">
        <TabsList>
          <TabsTrigger value="phoenix-score">Phoenix Score</TabsTrigger>
          <TabsTrigger value="sep-points">SEP Points</TabsTrigger>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
        </TabsList>

        <TabsContent value="phoenix-score">
          <Card>
            <CardHeader>
              <CardTitle>Phoenix Score Leaderboard</CardTitle>
              <CardDescription>Top performers ranked by their Phoenix Score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLeaderboard.map((user, index) => (
                  <div key={user.rank} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                        {user.rank === 1 && <Crown className="h-4 w-4 text-yellow-500" />}
                        {user.rank === 2 && <Medal className="h-4 w-4 text-gray-400" />}
                        {user.rank === 3 && <Medal className="h-4 w-4 text-orange-500" />}
                        {user.rank > 3 && <span className="text-sm font-medium">#{user.rank}</span>}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">Phoenix Score: {user.score}</p>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${user.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                      {user.change}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sep-points">
          <Card>
            <CardHeader>
              <CardTitle>SEP Points Leaderboard</CardTitle>
              <CardDescription>Most active community members by SEP points earned</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                SEP Points leaderboard coming soon! Track who's earning the most points through workouts, challenges, and community engagement.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workouts">
          <Card>
            <CardHeader>
              <CardTitle>Workout Leaderboard</CardTitle>
              <CardDescription>Most consistent users by workout frequency</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Workout frequency leaderboard coming soon! See who's staying most consistent with their training.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}