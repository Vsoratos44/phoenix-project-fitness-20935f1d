import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import Hero from "@/components/Hero";
import WorkoutCategories from "@/components/WorkoutCategories";
import StatsSection from "@/components/StatsSection";
import CallToAction from "@/components/CallToAction";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Auth CTA in Header */}
      <header className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="container mx-auto flex justify-end">
          <Button onClick={() => navigate('/auth')} variant="outline">
            Sign In / Get Started
          </Button>
        </div>
      </header>

      <Hero />
      <WorkoutCategories />
      <StatsSection />
      <CallToAction />
    </div>
  );
};

export default Index;
