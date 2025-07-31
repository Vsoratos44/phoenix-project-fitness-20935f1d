import Hero from "@/components/Hero";
import WorkoutCategories from "@/components/WorkoutCategories";
import StatsSection from "@/components/StatsSection";
import CallToAction from "@/components/CallToAction";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <WorkoutCategories />
      <StatsSection />
      <CallToAction />
    </div>
  );
};

export default Index;
