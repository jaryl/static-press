import { createContext, ReactNode, useContext, useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { schemaService } from '@/services/schemaService';
import { siteService } from '@/services/siteService';
import { useToast } from '@/hooks/use-toast';
import { handleApiError, withLoading } from '@/lib/utils';

// Interface for site data
export interface Site {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteContextType {
  currentSite: Site;
  sites: Site[];
  switchSite: (siteId: string) => void;
  createSite: (data: { id: string; name: string; description?: string; templateId?: string }) => Promise<Site>;
  updateSite: (siteId: string, updates: Partial<Site>) => Promise<Site>;
  deleteSite: (siteId: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  refreshSites: () => Promise<void>;
}

const DEFAULT_SITE: Site = {
  id: 'default',
  name: 'Default Site'
};

// Create the context with default values
const SiteContext = createContext<SiteContextType | undefined>(undefined);

// Hook to use the site context
export const useSite = () => {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
};

export const SiteProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [currentSiteId, setCurrentSiteId] = useState<string>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Query for fetching all sites
  const { data: sites = [] } = useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      try {
        const sitesList = await siteService.fetchSites();

        // Make sure default site is always available
        if (!sitesList.some(site => site.id === 'default')) {
          sitesList.unshift(DEFAULT_SITE);
        }

        return sitesList;
      } catch (err) {
        console.error('Error fetching sites:', err);
        return [DEFAULT_SITE]; // Fallback to default
      }
    },
  });

  // Query for current site
  const { data: currentSite = DEFAULT_SITE } = useQuery({
    queryKey: ['site', currentSiteId],
    queryFn: async () => {
      try {
        if (currentSiteId === 'default') {
          // For default site, no need to fetch
          return DEFAULT_SITE;
        }

        const site = await siteService.getSite(currentSiteId);
        return site;
      } catch (err) {
        console.error(`Error fetching site ${currentSiteId}:`, err);
        return DEFAULT_SITE; // Fallback to default
      }
    },
  });

  // Effect to set schema service site ID when current site changes
  useEffect(() => {
    if (currentSite) {
      schemaService.setSiteId(currentSite.id);
    }
  }, [currentSite]);

  // Switch to a different site
  const switchSite = useCallback((siteId: string) => {
    setCurrentSiteId(siteId);
  }, []);

  // Create a new site
  const createSite = useCallback(async (data: { id: string; name: string; description?: string; templateId?: string }): Promise<Site> => {
    return withLoading(async () => {
      try {
        const newSite = await siteService.createSite(data);

        // Invalidate the sites query to refresh the list
        queryClient.invalidateQueries({ queryKey: ['sites'] });

        // Switch to the new site
        switchSite(newSite.id);

        toast({
          title: 'Site Created',
          description: `Successfully created "${newSite.name}" site.`,
        });

        return newSite;
      } catch (err) {
        handleApiError('create site', err, setError, toast);
        throw err;
      }
    }, setIsLoading);
  }, [toast, queryClient, switchSite]);

  // Update a site's metadata
  const updateSite = useCallback(async (siteId: string, updates: Partial<Site>): Promise<Site> => {
    return withLoading(async () => {
      try {
        const updatedSite = await siteService.updateSite(siteId, updates);

        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ['sites'] });
        queryClient.invalidateQueries({ queryKey: ['site', siteId] });

        toast({
          title: 'Site Updated',
          description: `Successfully updated "${updatedSite.name}" site.`,
        });

        return updatedSite;
      } catch (err) {
        handleApiError(`update site ${siteId}`, err, setError, toast);
        throw err;
      }
    }, setIsLoading);
  }, [toast, queryClient]);

  // Delete a site
  const deleteSite = useCallback(async (siteId: string): Promise<boolean> => {
    return withLoading(async () => {
      try {
        await siteService.deleteSite(siteId);

        // Invalidate sites query
        queryClient.invalidateQueries({ queryKey: ['sites'] });

        // If the deleted site was the current site, switch to the default site
        if (currentSiteId === siteId) {
          switchSite('default');
        }

        toast({
          title: 'Site Deleted',
          description: 'Successfully deleted the site.',
        });

        return true;
      } catch (err) {
        handleApiError(`delete site ${siteId}`, err, setError, toast);
        return false;
      }
    }, setIsLoading);
  }, [toast, queryClient, currentSiteId, switchSite]);

  // Function to refresh the sites list
  const refreshSites = useCallback(async (): Promise<void> => {
    queryClient.invalidateQueries({ queryKey: ['sites'] });
    queryClient.invalidateQueries({ queryKey: ['site', currentSiteId] });
  }, [queryClient, currentSiteId]);

  const value = {
    currentSite,
    sites,
    switchSite,
    createSite,
    updateSite,
    deleteSite,
    isLoading,
    error,
    refreshSites
  };

  return (
    <SiteContext.Provider value={value}>
      {children}
    </SiteContext.Provider>
  );
};
