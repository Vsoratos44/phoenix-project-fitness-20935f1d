import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Zap, Smartphone, Trophy } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "AI-Powered Workouts",
    description: "Get personalized routines that adapt to your progress"
  },
  {
    icon: Smartphone,
    title: "Offline Access",
    description: "Download workouts and train anywhere, anytime"
  },
  {
    icon: Trophy,
    title: "Achievement System",
    description: "Unlock badges and compete with friends globally"
  }
];

const CallToAction = () => {
  return (
    <section className="py-24 px-6 lg:px-8 relative overflow-hidden">
      {/* Electric Background Effects */}
      <div className="absolute top-10 left-1/4 w-32 h-32 bg-fitness-green-electric/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-1/4 w-40 h-40 bg-fitness-green-neon/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Features */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-fitness-green-electric/10 text-fitness-green-electric px-4 py-2 rounded-full text-sm font-medium border border-fitness-green-electric/20">
                <CheckCircle className="w-4 h-4 fill-current" />
                Premium Features
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold">
                Ready to
                <span className="block bg-gradient-to-r from-fitness-green-bright to-fitness-green-electric bg-clip-text text-transparent">
                  Transform?
                </span>
              </h2>
              
              <p className="text-xl text-muted-foreground">
                Join millions who've already started their fitness journey with our cutting-edge platform.
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={feature.title}
                    className="flex items-start gap-4 group"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-fitness-green-bright to-fitness-green-electric rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - CTA Card */}
          <div className="relative">
            <Card className="bg-gradient-to-br from-card via-card/90 to-background/80 backdrop-blur-sm border-border/50 shadow-2xl">
              <CardContent className="p-8 space-y-8">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-fitness-green-electric to-fitness-green-neon rounded-full flex items-center justify-center mx-auto animate-pulse-glow">
                    <Zap className="w-10 h-10 text-primary-foreground" />
                  </div>
                  
                  <h3 className="text-2xl font-bold">
                    Start Your Free Trial
                  </h3>
                  
                  <p className="text-muted-foreground">
                    Get full access to premium features for 30 days. No credit card required.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-fitness-green-electric" />
                    <span>Unlimited workout access</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-fitness-green-electric" />
                    <span>Personal AI fitness coach</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-fitness-green-electric" />
                    <span>Advanced progress tracking</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-fitness-green-electric" />
                    <span>Community challenges</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button variant="success" size="lg" className="w-full">
                    Start Free Trial
                  </Button>
                  <Button variant="electric" size="lg" className="w-full">
                    View Pricing Plans
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Cancel anytime. No commitments, just results.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;