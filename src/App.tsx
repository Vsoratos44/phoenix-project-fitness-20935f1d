import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import WorkoutsPage from "./pages/WorkoutsPage";
import ExercisesPage from "./pages/ExercisesPage";
import OnboardingPage from "./pages/OnboardingPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import WorkoutSessionPage from "./pages/WorkoutSessionPage";
import PhoenixScorePage from "./pages/PhoenixScorePage";
import WorkoutLogsPage from "./pages/WorkoutLogsPage";
import RewardsPage from "./pages/RewardsPage";
import AIWorkoutPage from "./pages/AIWorkoutPage";
import NutritionPage from "./pages/NutritionPage";
import WorkoutCreatorPage from "./pages/WorkoutCreatorPage";
import PeriodizationPage from "./pages/PeriodizationPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import BiometricsPage from "./pages/BiometricsPage";
import CommunityPage from "./pages/CommunityPage";
import ChallengesPage from "./pages/ChallengesPage";
import LeaderboardsPage from "./pages/LeaderboardsPage";
import AchievementsPage from "./pages/AchievementsPage";
import ProgramsPage from "./pages/ProgramsPage";
import MarketplacePage from "./pages/MarketplacePage";
import SettingsPage from "./pages/SettingsPage";
import ActivityPage from "./pages/ActivityPage";
import ProgressPage from "./pages/ProgressPage";
import ComponentTestingPage from "./pages/ComponentTestingPage";
import { AuthProvider } from "./hooks/useAuth";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import WearablesPage from "./pages/WearablesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="onboarding" element={<OnboardingPage />} />
              <Route path="subscription" element={<SubscriptionPage />} />
              <Route path="workouts" element={<WorkoutsPage />} />
              <Route path="exercises" element={<ExercisesPage />} />
              <Route path="ai-workouts" element={<AIWorkoutPage />} />
              <Route path="programs" element={<ProgramsPage />} />
              <Route path="workout-session" element={<WorkoutSessionPage />} />
              <Route path="phoenix-score" element={<PhoenixScorePage />} />
              <Route path="workout-logs" element={<WorkoutLogsPage />} />
              <Route path="ai-workout" element={<AIWorkoutPage />} />
              <Route path="nutrition" element={<NutritionPage />} />
              <Route path="biometrics" element={<BiometricsPage />} />
              <Route path="progress" element={<ProgressPage />} />
              <Route path="community" element={<CommunityPage />} />
              <Route path="wearables" element={<WearablesPage />} />
              <Route path="challenges" element={<ChallengesPage />} />
              <Route path="leaderboards" element={<LeaderboardsPage />} />
              <Route path="achievements" element={<AchievementsPage />} />
              <Route path="marketplace" element={<MarketplacePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="activity" element={<ActivityPage />} />
              <Route path="workout-creator" element={<WorkoutCreatorPage />} />
              <Route path="periodization" element={<PeriodizationPage />} />
              <Route path="rewards" element={<RewardsPage />} />
              <Route path="points" element={<RewardsPage />} />
              <Route path="component-testing" element={<ComponentTestingPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;