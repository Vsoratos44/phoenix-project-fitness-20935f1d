import Hero from "@/components/Hero";
import WorkoutCategories from "@/components/WorkoutCategories";
import StatsSection from "@/components/StatsSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <WorkoutCategories />
      <StatsSection />
    </div>
  );
};

export default Index;
