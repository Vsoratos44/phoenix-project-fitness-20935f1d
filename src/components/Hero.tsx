import { Button } from "@/components/ui/button";
import { Play, Star, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-fitness.jpg";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Fitness Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20">
                <Star className="w-4 h-4 fill-current" />
                #1 Rated Fitness App
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Elevate Your
                <span className="block bg-gradient-to-r from-primary to-fitness-orange bg-clip-text text-transparent">
                  Fitness Flow
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                Transform your body and mind with personalized workouts, real-time coaching, and a community that pushes you to new heights.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="hero" 
                size="lg"
                className="group"
                onClick={() => navigate('/auth')}
              >
                Start Your Journey
                <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary/30 hover:border-primary hover:bg-primary/10"
                onClick={() => navigate('/ai-workouts')}
              >
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-8 border-t border-border">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">2M+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-fitness-orange">500K+</div>
                <div className="text-sm text-muted-foreground">Workouts Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-fitness-green">4.9★</div>
                <div className="text-sm text-muted-foreground">App Rating</div>
              </div>
            </div>
          </div>

          {/* Right Column - Feature Preview */}
          <div className="relative animate-scale-in animation-delay-300">
            <div className="bg-gradient-to-br from-card via-card to-background/80 backdrop-blur-sm border border-border rounded-3xl p-8 shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Today's Workout</h3>
                  <div className="flex items-center gap-2 text-fitness-orange">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Live Session</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/10 to-fitness-orange/10 rounded-xl border border-primary/20">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                      <Play className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-semibold">HIIT Power Session</div>
                      <div className="text-sm text-muted-foreground">45 min • High Intensity</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-secondary rounded-xl">
                      <div className="text-2xl font-bold text-primary">156</div>
                      <div className="text-xs text-muted-foreground">BPM</div>
                    </div>
                    <div className="p-4 bg-secondary rounded-xl">
                      <div className="text-2xl font-bold text-fitness-orange">420</div>
                      <div className="text-xs text-muted-foreground">Calories</div>
                    </div>
                    <div className="p-4 bg-secondary rounded-xl">
                      <div className="text-2xl font-bold text-fitness-green">89%</div>
                      <div className="text-xs text-muted-foreground">Complete</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-fitness-orange/20 rounded-full blur-xl animate-pulse animation-delay-1000"></div>
    </section>
  );
};

export default Hero;