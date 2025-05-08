import { useSite as useSiteFromContext, Site, SiteContextType } from '@/contexts/SiteContext';

// Re-export the hook and types
export const useSite = useSiteFromContext;
export type { Site, SiteContextType };
