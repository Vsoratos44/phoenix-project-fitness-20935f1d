import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Heart, Zap, Waves } from "lucide-react";

const categories = [
  {
    icon: Dumbbell,
    title: "Strength Training",
    description: "Build muscle and increase power with guided weight training sessions",
    color: "primary",
    workouts: "120+ Workouts"
  },
  {
    icon: Heart,
    title: "Cardio Blast",
    description: "High-energy cardio sessions to boost your endurance and burn calories",
    color: "fitness-orange",
    workouts: "85+ Workouts"
  },
  {
    icon: Waves,
    title: "Yoga & Mindfulness",
    description: "Find balance and flexibility with calming yoga and meditation practices",
    color: "fitness-green-bright",
    workouts: "60+ Sessions"
  },
  {
    icon: Zap,
    title: "HIIT Intervals",
    description: "Maximum results in minimum time with high-intensity interval training",
    color: "fitness-purple",
    workouts: "95+ Workouts"
  }
];

const WorkoutCategories = () => {
  return (
    <section className="py-24 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Choose Your
            <span className="block bg-gradient-to-r from-primary to-fitness-orange bg-clip-text text-transparent">
              Fitness Journey
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Whether you're building strength, improving cardio, or finding inner peace, 
            we have the perfect workout category to match your goals.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card 
                key={category.title}
                className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-border/50 bg-gradient-to-br from-card to-background/80 backdrop-blur-sm"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <CardContent className="p-6 space-y-4">
                  <div className={`w-14 h-14 rounded-2xl bg-${category.color}/10 border border-${category.color}/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 text-${category.color}`} />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {category.description}
                    </p>
                    <div className={`text-sm font-medium text-${category.color}`}>
                      {category.workouts}
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300"
                  >
                    Start Training
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-primary/10 via-fitness-orange/10 to-primary/10 border border-primary/20 rounded-3xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Not sure where to start?
            </h3>
            <p className="text-muted-foreground mb-6">
              Take our 2-minute fitness assessment and get a personalized workout plan
            </p>
            <Button variant="hero" size="lg">
              Take Assessment
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkoutCategories;