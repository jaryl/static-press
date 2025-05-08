import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { schemaService } from '@/services/schemaService';

// Interface for site data
export interface Site {
  id: string;
  name: string;
}

interface SiteContextType {
  currentSite: Site;
  sites: Site[];
  switchSite: (siteId: string) => void;
  createSite: (name: string) => Promise<Site>;
  isLoading: boolean;
}

const DEFAULT_SITE: Site = {
  id: 'default',
  name: 'Default Site'
};

// Create the context with default values
const SiteContext = createContext<SiteContextType>({
  currentSite: DEFAULT_SITE,
  sites: [DEFAULT_SITE],
  switchSite: () => { },
  createSite: async () => DEFAULT_SITE,
  isLoading: true
});

// Hook to use the site context
export const useSite = () => useContext(SiteContext);

export const SiteProvider = ({ children }: { children: ReactNode }) => {
  const [currentSite, setCurrentSite] = useState<Site>(DEFAULT_SITE);
  const [sites, setSites] = useState<Site[]>([DEFAULT_SITE]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize - in a real implementation, this would fetch sites from an API
  useEffect(() => {
    const fetchSites = async () => {
      try {
        // For Phase 1, we hardcode the default site and don't fetch from API yet
        // In Phase 2 we would fetch the list of sites from the server
        setSites([DEFAULT_SITE]);
        setCurrentSite(DEFAULT_SITE);

        // Initialize the services with the default site
        schemaService.setSiteId(DEFAULT_SITE.id);
      } catch (error) {
        console.error('Failed to load sites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSites();
  }, []);

  // Switch to a different site
  const switchSite = (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    if (site) {
      setCurrentSite(site);
      schemaService.setSiteId(site.id);
      // In a real implementation, we would also need to refresh data
    }
  };

  // Create a new site
  const createSite = async (name: string): Promise<Site> => {
    // Generate a simple ID from the name
    const id = name.toLowerCase().replace(/\s+/g, '-');

    // In a real implementation, we would make an API call to create the site
    const newSite: Site = { id, name };

    // Add the new site to our list
    setSites([...sites, newSite]);

    // Switch to the new site
    switchSite(id);

    return newSite;
  };

  return (
    <SiteContext.Provider value={{ currentSite, sites, switchSite, createSite, isLoading }}>
      {children}
    </SiteContext.Provider>
  );
};
