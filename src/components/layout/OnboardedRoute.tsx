import { useOnboarding } from "@/contexts/OnboardingContext";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { Spinner } from "@/components/ui/spinner";

interface OnboardedRouteProps {
  children: React.ReactNode;
}

/**
 * OnboardedRoute - Only renders the children if onboarding has been completed.
 * Otherwise, it shows the onboarding flow.
 */
const OnboardedRoute = ({ children }: OnboardedRouteProps) => {
  const { showOnboarding, isCheckingOnboarding } = useOnboarding();

  if (isCheckingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingFlow />;
  }

  return <>{children}</>;
};

export default OnboardedRoute;
