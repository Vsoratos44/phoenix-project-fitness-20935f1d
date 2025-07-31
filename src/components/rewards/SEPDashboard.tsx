/**
 * Phoenix Project Fitness - SEP (Sweat Equity Points) Dashboard
 * 
 * Displays user's SEP balance, recent transactions, rewards multipliers,
 * and available redemption options in the marketplace.
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Flame, 
  TrendingUp, 
  Award, 
  ShoppingBag,
  Calendar,
  Target,
  Zap,
  Star,
  Gift,
  Clock,
  Plus,
  Minus,
  Trophy
} from "lucide-react";

interface SEPTransaction {
  id: number;
  points: number;
  transaction_type: string;
  activity_type: string;
  description: string;
  created_at: string;
  multipliers: any;
}

interface SEPStats {
  totalBalance: number;
  totalEarned: number;
  totalRedeemed: number;
  weeklyPoints: number;
  monthlyPoints: number;
  currentStreak: number;
  tierMultiplier: number;
}

interface RewardItem {
  id: string;
  name: string;
  description: string;
  sepCost: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
}

const SAMPLE_REWARDS: RewardItem[] = [
  {
    id: 'protein-powder',
    name: 'Premium Protein Powder',
    description: '2lb container of premium whey protein',
    sepCost: 2500,
    category: 'Supplements',
    isAvailable: true,
  },
  {
    id: 'workout-gear',
    name: 'Phoenix Fitness Gear Set',
    description: 'T-shirt, water bottle, and resistance bands',
    sepCost: 1500,
    category: 'Merchandise',
    isAvailable: true,
  },
  {
    id: 'personal-training',
    name: '1-on-1 Coaching Session',
    description: '60-minute personalized training session',
    sepCost: 5000,
    category: 'Services',
    isAvailable: true,
  },
  {
    id: 'nutrition-plan',
    name: 'Custom Meal Plan',
    description: '4-week personalized nutrition plan',
    sepCost: 3000,
    category: 'Services',
    isAvailable: true,
  },
];

export function SEPDashboard() {
  const [sepStats, setSepStats] = useState<SEPStats>({
    totalBalance: 0,
    totalEarned: 0,
    totalRedeemed: 0,
    weeklyPoints: 0,
    monthlyPoints: 0,
    currentStreak: 0,
    tierMultiplier: 1.0,
  });
  const [transactions, setTransactions] = useState<SEPTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userTier, setUserTier] = useState<string>('essential');
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadSEPData();
      loadUserSubscription();
    }
  }, [user]);

  const loadSEPData = async () => {
    if (!user) return;

    try {
      // Load SEP transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('sep_ledger')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (transactionError) throw transactionError;

      setTransactions(transactionData || []);

      // Calculate stats from transactions
      const transactions_ = transactionData || [];
      const totalEarned = transactions_
        .filter(t => t.transaction_type === 'earn')
        .reduce((sum, t) => sum + Number(t.points), 0);
      
      const totalRedeemed = transactions_
        .filter(t => t.transaction_type === 'redeem')
        .reduce((sum, t) => sum + Math.abs(Number(t.points)), 0);
      
      const totalBalance = totalEarned - totalRedeemed;

      // Calculate weekly and monthly points
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const weeklyPoints = transactions_
        .filter(t => 
          t.transaction_type === 'earn' && 
          new Date(t.created_at) >= oneWeekAgo
        )
        .reduce((sum, t) => sum + Number(t.points), 0);

      const monthlyPoints = transactions_
        .filter(t => 
          t.transaction_type === 'earn' && 
          new Date(t.created_at) >= oneMonthAgo
        )
        .reduce((sum, t) => sum + Number(t.points), 0);

      setSepStats({
        totalBalance,
        totalEarned,
        totalRedeemed,
        weeklyPoints,
        monthlyPoints,
        currentStreak: 5, // Placeholder - would calculate from actual workout streak
        tierMultiplier: getTierMultiplier(userTier),
      });

    } catch (error) {
      console.error('Error loading SEP data:', error);
      toast({
        title: "Error",
        description: "Failed to load SEP data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setUserTier(data.tier);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const getTierMultiplier = (tier: string): number => {
    switch (tier) {
      case 'essential': return 0.5;
      case 'plus': return 1.0;
      case 'premium': return 1.5;
      default: return 1.0;
    }
  };

  const getTierColor = (tier: string): string => {
    switch (tier) {
      case 'essential': return 'text-blue-600';
      case 'plus': return 'text-fitness-orange';
      case 'premium': return 'text-fitness-green-electric';
      default: return 'text-primary';
    }
  };

  const redeemReward = async (reward: RewardItem) => {
    if (!user) return;

    if (sepStats.totalBalance < reward.sepCost) {
      toast({
        title: "Insufficient SEP Points",
        description: `You need ${reward.sepCost - sepStats.totalBalance} more points to redeem this reward.`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Create redemption transaction
      const { error } = await supabase
        .from('sep_ledger')
        .insert({
          user_id: user.id,
          points: -reward.sepCost,
          transaction_type: 'redeem',
          activity_type: 'marketplace',
          description: `Redeemed: ${reward.name}`,
        });

      if (error) throw error;

      toast({
        title: "Reward Redeemed! 🎉",
        description: `You've successfully redeemed ${reward.name}. Check your email for details.`,
      });

      // Reload data to update balance
      loadSEPData();

    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast({
        title: "Redemption Failed",
        description: "Failed to redeem reward. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (transaction: SEPTransaction) => {
    if (transaction.transaction_type === 'earn') {
      switch (transaction.activity_type) {
        case 'workout': return <Target className="h-4 w-4" />;
        case 'challenge': return <Award className="h-4 w-4" />;
        case 'streak': return <Flame className="h-4 w-4" />;
        default: return <Plus className="h-4 w-4" />;
      }
    }
    return <Minus className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-32 animate-pulse">
              <CardContent className="p-6">
                <div className="bg-secondary rounded h-4 w-1/3 mb-3"></div>
                <div className="bg-secondary rounded h-8 w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center space-x-3">
          <Flame className="h-10 w-10 text-fitness-orange" />
          <span>SEP Dashboard</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Track your Sweat Equity Points and redeem amazing rewards
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-fitness-orange/10 to-fitness-orange/5"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-2">
              <Flame className="h-8 w-8 text-fitness-orange" />
              <Badge variant="secondary" className={getTierColor(userTier)}>
                {userTier.charAt(0).toUpperCase() + userTier.slice(1)}
              </Badge>
            </div>
            <div className="text-3xl font-bold text-fitness-orange">
              {sepStats.totalBalance.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Balance</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-6 w-6 text-fitness-green-electric" />
              <div className="text-xs text-fitness-green-electric font-semibold">
                +{sepStats.weeklyPoints}
              </div>
            </div>
            <div className="text-2xl font-bold">{sepStats.monthlyPoints.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">This Month</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="h-6 w-6 text-primary" />
              <div className="text-xs text-primary font-semibold">
                {sepStats.tierMultiplier}x
              </div>
            </div>
            <div className="text-2xl font-bold">{sepStats.currentStreak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <ShoppingBag className="h-6 w-6 text-secondary-foreground" />
              <div className="text-xs text-secondary-foreground font-semibold">
                Total
              </div>
            </div>
            <div className="text-2xl font-bold">{sepStats.totalRedeemed.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Redeemed</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Recent Activity</TabsTrigger>
          <TabsTrigger value="rewards">Marketplace</TabsTrigger>
          <TabsTrigger value="multipliers">Multipliers</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your latest SEP earning and spending activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Flame className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions yet. Start working out to earn SEP points!</p>
                  </div>
                ) : (
                  transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          transaction.transaction_type === 'earn' 
                            ? 'bg-fitness-green-electric/10 text-fitness-green-electric'
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {getTransactionIcon(transaction)}
                        </div>
                        <div>
                          <div className="font-semibold">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.activity_type} • {formatDate(transaction.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${
                        transaction.transaction_type === 'earn' 
                          ? 'text-fitness-green-electric'
                          : 'text-red-500'
                      }`}>
                        {transaction.transaction_type === 'earn' ? '+' : ''}
                        {Number(transaction.points).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Redeem Rewards</CardTitle>
              <CardDescription>
                Use your SEP points to unlock exclusive rewards and products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SAMPLE_REWARDS.map((reward) => (
                  <Card key={reward.id} className="relative">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{reward.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {reward.description}
                          </p>
                          <Badge variant="outline">{reward.category}</Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-fitness-orange">
                            {reward.sepCost.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">SEP</div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => redeemReward(reward)}
                        disabled={sepStats.totalBalance < reward.sepCost}
                        className="w-full"
                        variant={sepStats.totalBalance >= reward.sepCost ? "default" : "secondary"}
                      >
                        {sepStats.totalBalance >= reward.sepCost ? (
                          <>
                            <Gift className="h-4 w-4 mr-2" />
                            Redeem Now
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 mr-2" />
                            Need {(reward.sepCost - sepStats.totalBalance).toLocaleString()} more SEP
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="multipliers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEP Multipliers</CardTitle>
              <CardDescription>
                Boost your points with these multipliers based on your subscription and achievements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Star className={`h-6 w-6 ${getTierColor(userTier)}`} />
                    <div>
                      <div className="font-semibold">Subscription Tier</div>
                      <div className="text-sm text-muted-foreground">
                        {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Plan
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className={getTierColor(userTier)}>
                    {sepStats.tierMultiplier}x
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Flame className="h-6 w-6 text-fitness-orange" />
                    <div>
                      <div className="font-semibold">Workout Streak</div>
                      <div className="text-sm text-muted-foreground">
                        {sepStats.currentStreak} days in a row
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {sepStats.currentStreak >= 7 ? '1.1x' : '1.0x'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
                  <div className="flex items-center space-x-3">
                    <Trophy className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">Personal Record</div>
                      <div className="text-sm text-muted-foreground">
                        Achieve a new PR in any exercise
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">1.5x</Badge>
                </div>
              </div>

              <div className="bg-secondary/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">How SEP is Calculated:</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Base Points: 10 per workout</p>
                  <p>Duration Factor: Up to 2x for 60+ minute workouts</p>
                  <p>Volume Factor: Up to 2x for 5+ exercises</p>
                  <p>Multipliers: Tier × Streak × Achievement bonuses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}