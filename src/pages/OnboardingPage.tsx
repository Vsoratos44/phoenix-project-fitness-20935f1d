import { EnhancedOnboardingFlow } from "@/components/onboarding/EnhancedOnboardingFlow";
import { useNavigate } from "react-router-dom";

export default function OnboardingPage() {
  const navigate = useNavigate();

  const handleOnboardingComplete = () => {
    navigate("/dashboard");
  };

  return <EnhancedOnboardingFlow onComplete={handleOnboardingComplete} />;
}