import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Trophy, 
  Users, 
  Calendar, 
  Target, 
  Flame, 
  Clock, 
  Star,
  TrendingUp,
  Award,
  Medal,
  Zap,
  Crown,
  Gift,
  CheckCircle2,
  Play,
  Timer,
  Activity
} from "lucide-react";

interface Challenge {
  id: string;
  name: string;
  description: string;
  challenge_type: string;
  category: string;
  start_date: string;
  end_date: string;
  goal_criteria: any;
  entry_fee_sep: number;
  prize_pool_sep: number;
  max_participants: number;
  is_public: boolean;
  created_by: string;
  participant_count?: number;
  my_participation?: any;
  leaderboard_position?: number;
}

interface ChallengeParticipant {
  id: string;
  user_id: string;
  current_progress: any;
  is_completed: boolean;
  final_rank: number | null;
  prize_earned_sep: number;
  user_profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

export default function ChallengeSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [myChallenges, setMyChallenges] = useState<Challenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<ChallengeParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
    if (user) {
      loadMyChallenges();
    }
  }, [user]);

  const loadChallenges = async () => {
    try {
      const now = new Date().toISOString();
      
      // Load active public challenges
      const { data: challenges, error } = await supabase
        .from('challenges')
        .select(`
          *,
          challenge_participants!left (
            id,
            user_id
          )
        `)
        .eq('is_public', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Count participants for each challenge
      const challengesWithCounts = (challenges || []).map(challenge => ({
        ...challenge,
        participant_count: challenge.challenge_participants?.length || 0
      }));

      setActiveChallenges(challengesWithCounts);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyChallenges = async () => {
    if (!user) return;

    try {
      // Load challenges I'm participating in
      const { data: myParticipations, error } = await supabase
        .from('challenge_participants')
        .select(`
          *,
          challenges (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const activeChallenges: Challenge[] = [];
      const completedChallenges: Challenge[] = [];
      const now = new Date();

      (myParticipations || []).forEach(participation => {
        if (participation.challenges) {
          const challenge = {
            ...participation.challenges,
            my_participation: participation
          };

          const endDate = new Date(challenge.end_date);
          if (endDate > now) {
            activeChallenges.push(challenge);
          } else {
            completedChallenges.push(challenge);
          }
        }
      });

      setMyChallenges(activeChallenges);
      setCompletedChallenges(completedChallenges);
    } catch (error) {
      console.error('Error loading my challenges:', error);
    }
  };

  const loadLeaderboard = async (challengeId: string) => {
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select(`
          *,
          user_id
        `)
        .eq('challenge_id', challengeId)
        .order('current_progress->score', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Get user profiles for leaderboard
      const participantsWithProfiles = await Promise.all(
        (data || []).map(async (participant, index) => {
          const { data: profile } = await supabase
            .from('enhanced_profiles')
            .select('id, user_id')
            .eq('user_id', participant.user_id)
            .single();

          return {
            ...participant,
            rank: index + 1,
            user_profile: {
              display_name: profile?.id || 'Anonymous User',
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.user_id}`
            }
          };
        })
      );

      setLeaderboard(participantsWithProfiles);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join challenges",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          current_progress: { score: 0, workouts_completed: 0 }
        });

      if (error) throw error;

      toast({
        title: "🏆 Challenge Joined!",
        description: "Good luck! Track your progress and climb the leaderboard."
      });

      loadChallenges();
      loadMyChallenges();
    } catch (error: any) {
      console.error('Error joining challenge:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to join challenge",
        variant: "destructive"
      });
    }
  };

  const getChallengeProgress = (challenge: Challenge) => {
    if (!challenge.my_participation?.current_progress) return 0;
    
    const progress = challenge.my_participation.current_progress;
    const criteria = challenge.goal_criteria;
    
    switch (challenge.challenge_type) {
      case 'workout_streak':
        return Math.min((progress.streak || 0) / (criteria.target_streak || 1), 1) * 100;
      case 'total_volume':
        return Math.min((progress.total_volume || 0) / (criteria.target_volume || 1), 1) * 100;
      case 'workout_count':
        return Math.min((progress.workouts_completed || 0) / (criteria.target_workouts || 1), 1) * 100;
      default:
        return Math.min((progress.score || 0) / (criteria.target_score || 1), 1) * 100;
    }
  };

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'workout_streak': return <Flame className="h-4 w-4" />;
      case 'total_volume': return <TrendingUp className="h-4 w-4" />;
      case 'workout_count': return <Activity className="h-4 w-4" />;
      case 'time_challenge': return <Timer className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  const formatTimeLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Ended';
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const generateRandomChallenges = () => {
    return [
      {
        id: 'weekly-volume',
        name: '10,000kg Volume Challenge',
        description: 'Lift a total of 10,000kg in one week. Push your limits!',
        challenge_type: 'total_volume',
        category: 'strength',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        goal_criteria: { target_volume: 10000 },
        entry_fee_sep: 50,
        prize_pool_sep: 1000,
        max_participants: 100,
        is_public: true,
        created_by: 'system',
        participant_count: 23
      },
      {
        id: 'workout-streak',
        name: '30-Day Consistency Challenge',
        description: 'Complete a workout every day for 30 days. Build the ultimate habit!',
        challenge_type: 'workout_streak',
        category: 'consistency',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        goal_criteria: { target_streak: 30 },
        entry_fee_sep: 100,
        prize_pool_sep: 5000,
        max_participants: 50,
        is_public: true,
        created_by: 'system',
        participant_count: 67
      },
      {
        id: 'phoenix-master',
        name: 'Phoenix Score Master',
        description: 'Achieve a Phoenix Score of 85+ through consistent training and recovery.',
        challenge_type: 'phoenix_score',
        category: 'holistic',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        goal_criteria: { target_score: 85 },
        entry_fee_sep: 75,
        prize_pool_sep: 2500,
        max_participants: 25,
        is_public: true,
        created_by: 'system',
        participant_count: 12
      }
    ];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Challenges</h1>
          <p className="text-muted-foreground">
            Compete, improve, and earn rewards with the Phoenix community
          </p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Trophy className="mr-2 h-4 w-4" />
          Create Challenge
        </Button>
      </div>

      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="my-challenges">My Challenges</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeChallenges.length > 0 ? activeChallenges : generateRandomChallenges()).map((challenge) => (
              <Card key={challenge.id} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-400 to-red-500 rounded-bl-3xl flex items-center justify-center">
                  {getChallengeTypeIcon(challenge.challenge_type)}
                </div>
                
                <CardHeader>
                  <CardTitle className="pr-16">{challenge.name}</CardTitle>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{challenge.participant_count || 0} participants</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTimeLeft(challenge.end_date)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Prize Pool</p>
                      <p className="text-lg font-bold text-orange-600">
                        {challenge.prize_pool_sep} SEP
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Entry Fee</p>
                      <p className="text-sm text-muted-foreground">
                        {challenge.entry_fee_sep} SEP
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => joinChallenge(challenge.id)}
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Join Challenge
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSelectedChallenge(challenge);
                        loadLeaderboard(challenge.id);
                      }}
                    >
                      <Trophy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-challenges" className="space-y-6">
          {myChallenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myChallenges.map((challenge) => (
                <Card key={challenge.id} className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getChallengeTypeIcon(challenge.challenge_type)}
                      {challenge.name}
                    </CardTitle>
                    <CardDescription>{challenge.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(getChallengeProgress(challenge))}%
                        </span>
                      </div>
                      <Progress value={getChallengeProgress(challenge)} />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>Time left: {formatTimeLeft(challenge.end_date)}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedChallenge(challenge);
                          loadLeaderboard(challenge.id);
                        }}
                      >
                        View Leaderboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Active Challenges</h3>
                <p className="text-muted-foreground mb-4">
                  Join a challenge to start competing and earning rewards!
                </p>
                <Button onClick={() => setSelectedChallenge(null)}>
                  Discover Challenges
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {completedChallenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedChallenges.map((challenge) => (
                <Card key={challenge.id} className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Medal className="h-5 w-5 text-yellow-600" />
                      {challenge.name}
                      {challenge.my_participation?.is_completed && (
                        <Badge variant="default" className="ml-auto">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Final Rank</p>
                        <p className="text-lg font-bold">
                          #{challenge.my_participation?.final_rank || 'Unranked'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">SEP Earned</p>
                        <p className="text-lg font-bold text-green-600">
                          {challenge.my_participation?.prize_earned_sep || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Medal className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Completed Challenges</h3>
                <p className="text-muted-foreground">
                  Complete challenges to see your achievements here!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Challenge Details Modal/Leaderboard */}
      {selectedChallenge && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              {selectedChallenge.name} - Leaderboard
            </CardTitle>
            <CardDescription>
              See how you stack up against the competition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.slice(0, 10).map((participant, index) => (
                <div key={participant.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100">
                    {index < 3 ? (
                      <Crown className={`h-4 w-4 ${
                        index === 0 ? 'text-yellow-500' : 
                        index === 1 ? 'text-gray-400' : 'text-orange-500'
                      }`} />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={participant.user_profile?.avatar_url} />
                    <AvatarFallback>
                      {participant.user_profile?.display_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <p className="font-medium">{participant.user_profile?.display_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Score: {participant.current_progress?.score || 0}
                    </p>
                  </div>
                  
                  {participant.is_completed && (
                    <Badge variant="default">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Done
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setSelectedChallenge(null)}
              className="w-full mt-4"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}