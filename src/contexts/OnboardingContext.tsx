import { createContext, ReactNode, useContext, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { siteService } from '@/services/siteService';
import { useToast } from '@/hooks/use-toast';
import { handleApiError } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingContextType {
  showOnboarding: boolean;
  isCheckingOnboarding: boolean;
  error: Error | null;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [error, setError] = useState<Error | null>(null);

  // Fetch sites using React Query - only if authenticated
  const { data: sites = [], isLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      try {
        return await siteService.fetchSites();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error fetching sites');
        setError(error);
        handleApiError('fetch sites', err, null, toast);
        return [];
      }
    },
    retry: 1,
    retryDelay: 1000,
    // Only run this query if the user is authenticated
    enabled: !!user,
  });

  // Determine if onboarding should be shown
  const hasSites = sites.length > 0;
  const showOnboarding = !isLoading && !hasSites;

  const value = {
    showOnboarding,
    isCheckingOnboarding: isLoading,
    error
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
