import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import WorkoutsPage from "./pages/WorkoutsPage";
import ExercisesPage from "./pages/ExercisesPage";
import OnboardingPage from "./pages/OnboardingPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import WorkoutSessionPage from "./pages/WorkoutSessionPage";
import RewardsPage from "./pages/RewardsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="onboarding" element={<OnboardingPage />} />
            <Route path="subscription" element={<SubscriptionPage />} />
            <Route path="workouts" element={<WorkoutsPage />} />
            <Route path="exercises" element={<ExercisesPage />} />
            <Route path="workout-session" element={<WorkoutSessionPage />} />
            <Route path="points" element={<RewardsPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;