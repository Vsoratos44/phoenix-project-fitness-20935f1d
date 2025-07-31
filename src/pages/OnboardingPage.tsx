import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useNavigate } from "react-router-dom";

export default function OnboardingPage() {
  const navigate = useNavigate();

  const handleOnboardingComplete = () => {
    navigate("/dashboard");
  };

  return <OnboardingFlow onComplete={handleOnboardingComplete} />;
}