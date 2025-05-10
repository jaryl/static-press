import ProtectedRoute from "@/components/layout/ProtectedRoute";
import OnboardedRoute from "@/components/layout/OnboardedRoute";

interface ProtectedOnboardedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedOnboardedRoute - Combines ProtectedRoute and OnboardedRoute.
 * Only renders children if the user is authenticated AND onboarding is completed.
 */
const ProtectedOnboardedRoute = ({ children }: ProtectedOnboardedRouteProps) => (
  <ProtectedRoute>
    <OnboardedRoute>
      {children}
    </OnboardedRoute>
  </ProtectedRoute>
);

export default ProtectedOnboardedRoute;
