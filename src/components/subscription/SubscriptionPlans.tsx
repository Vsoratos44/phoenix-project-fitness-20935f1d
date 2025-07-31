/**
 * Phoenix Project Fitness - Subscription Plans
 * 
 * Displays the three subscription tiers: Essential, Plus, Premium
 * with feature comparisons and Stripe checkout integration.
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Check, 
  Crown, 
  Zap, 
  Star,
  Users,
  Target,
  Brain,
  Camera,
  Trophy,
  ShoppingBag
} from "lucide-react";

interface SubscriptionPlan {
  id: 'essential' | 'plus' | 'premium';
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
  features: string[];
  limitations?: string[];
  stripePriceId: string;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'essential',
    name: 'Essential',
    price: 9.99,
    description: 'Perfect for getting started with your fitness journey',
    icon: Target,
    features: [
      'Access to basic workout library (100+ workouts)',
      'Manual workout logging',
      'Basic progress tracking',
      'Community access',
      'Email support',
      'SEP Rewards (0.5x multiplier)',
    ],
    limitations: [
      'No AI workout generator',
      'No computer vision form analysis',
      'Limited marketplace access',
    ],
    stripePriceId: 'price_essential_monthly', // This will be configured in Stripe
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 19.99,
    originalPrice: 29.99,
    description: 'Most popular choice with AI-powered features',
    icon: Zap,
    badge: 'Most Popular',
    badgeColor: 'bg-fitness-orange',
    features: [
      'Everything in Essential',
      'AI Workout Generator',
      'Full exercise library (1,500+ exercises)',
      'Basic computer vision rep counting',
      'Live class access',
      'Priority support',
      'SEP Rewards (1.0x multiplier)',
      'Marketplace access (basic tier)',
    ],
    stripePriceId: 'price_plus_monthly',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 39.99,
    originalPrice: 49.99,
    description: 'Ultimate fitness experience with all premium features',
    icon: Crown,
    badge: 'Best Value',
    badgeColor: 'bg-fitness-green-electric',
    features: [
      'Everything in Plus',
      'Advanced AI Coach with real-time form correction',
      'Full computer vision suite',
      'Personalized nutrition plans',
      'Phoenix Score analysis',
      'Priority live class booking',
      'Advanced analytics & insights',
      'Premium marketplace access',
      'SEP Rewards (1.5x multiplier)',
      '1-on-1 coaching sessions (2/month)',
    ],
    stripePriceId: 'price_premium_monthly',
  },
];

interface SubscriptionPlansProps {
  currentTier?: string;
  onPlanSelect?: (planId: string) => void;
}

export function SubscriptionPlans({ currentTier, onPlanSelect }: SubscriptionPlansProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(plan.id);
    
    try {
      // Call the Stripe checkout edge function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          planId: plan.id,
          priceId: plan.stripePriceId,
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: window.location.href,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription Error",
        description: error.message || "Failed to start subscription process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    setIsLoading('manage');
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: { returnUrl: window.location.href },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Portal error:', error);
      toast({
        title: "Error",
        description: "Failed to open subscription management. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-xl text-muted-foreground mb-6">
          Start your transformation journey with the perfect plan for your goals
        </p>
        <Badge variant="secondary" className="text-sm">
          🔥 All plans include 7-day free trial
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentTier === plan.id;
          const isPopular = plan.badge === 'Most Popular';
          const isBestValue = plan.badge === 'Best Value';

          return (
            <Card 
              key={plan.id}
              className={`relative transition-all duration-300 hover:shadow-xl ${
                isPopular ? 'ring-2 ring-fitness-orange scale-105' : 
                isBestValue ? 'ring-2 ring-fitness-green-electric' : ''
              } ${isCurrentPlan ? 'border-primary' : ''}`}
            >
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${plan.badgeColor} text-white px-4 py-1 rounded-full text-sm font-semibold`}>
                  {plan.badge}
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full ${
                    isPopular ? 'bg-fitness-orange/10 text-fitness-orange' :
                    isBestValue ? 'bg-fitness-green-electric/10 text-fitness-green-electric' :
                    'bg-primary/10 text-primary'
                  }`}>
                    <Icon className="h-8 w-8" />
                  </div>
                </div>
                
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                
                <div className="mt-4">
                  <div className="flex items-center justify-center space-x-2">
                    {plan.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        ${plan.originalPrice}
                      </span>
                    )}
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {plan.originalPrice && (
                    <Badge variant="secondary" className="mt-2">
                      Save ${(plan.originalPrice - plan.price).toFixed(2)}/month
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-fitness-green-electric mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.limitations && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-2">Not included:</p>
                    <div className="space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="h-5 w-5 mt-0.5 flex-shrink-0">
                            <div className="h-1 w-3 bg-muted-foreground rounded"></div>
                          </div>
                          <span className="text-sm text-muted-foreground">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  {isCurrentPlan ? (
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        disabled
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Current Plan
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={handleManageSubscription}
                        disabled={isLoading === 'manage'}
                      >
                        Manage Subscription
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className={`w-full ${
                        isPopular ? 'bg-fitness-orange hover:bg-fitness-orange/90' :
                        isBestValue ? 'bg-fitness-green-electric hover:bg-fitness-green-electric/90' :
                        ''
                      }`}
                      onClick={() => handleSubscribe(plan)}
                      disabled={isLoading === plan.id}
                    >
                      {isLoading === plan.id ? (
                        'Processing...'
                      ) : (
                        <>
                          Start 7-Day Free Trial
                          {plan.badge && <Star className="h-4 w-4 ml-2" />}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-16 text-center space-y-6">
        <h3 className="text-2xl font-bold">Why Choose Phoenix Fitness?</h3>
        <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="flex flex-col items-center space-y-2">
            <Brain className="h-8 w-8 text-primary" />
            <h4 className="font-semibold">AI-Powered</h4>
            <p className="text-sm text-muted-foreground text-center">
              Personalized workouts and form analysis
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Users className="h-8 w-8 text-primary" />
            <h4 className="font-semibold">Community</h4>
            <p className="text-sm text-muted-foreground text-center">
              Connect with like-minded fitness enthusiasts
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Trophy className="h-8 w-8 text-primary" />
            <h4 className="font-semibold">Rewards</h4>
            <p className="text-sm text-muted-foreground text-center">
              Earn SEP points for every workout
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Camera className="h-8 w-8 text-primary" />
            <h4 className="font-semibold">Form Analysis</h4>
            <p className="text-sm text-muted-foreground text-center">
              Real-time feedback on your technique
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}