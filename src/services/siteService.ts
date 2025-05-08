import { Site } from '@/contexts/SiteContext';
import { schemaService } from '@/services/schemaService';
import { getSiteTemplate } from '@/data/siteTemplates';

/**
 * Service for handling site-related API operations
 */
export const siteService = {
  /**
   * Fetch all available sites
   */
  async fetchSites(): Promise<Site[]> {
    const response = await fetch('/api/sites');

    if (!response.ok) {
      throw new Error(`Failed to fetch sites: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  /**
   * Fetch a single site by ID
   */
  async getSite(siteId: string): Promise<Site> {
    const response = await fetch(`/api/sites/${siteId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch site ${siteId}: ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Create a new site
   */
  async createSite(data: {
    id: string;
    name: string;
    description?: string;
    templateId?: string;
  }): Promise<Site> {
    // Prepare the request payload
    const payload = {
      id: data.id,
      name: data.name,
      description: data.description || `${data.name} site`
    };

    // Make the API call to create the site
    const response = await fetch('/api/sites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to create site: ${response.status}`);
    }

    const newSite = await response.json();

    // If a template was specified, initialize the schema with template data
    if (data.templateId) {
      const template = getSiteTemplate(data.templateId);
      if (template && template.schema.length > 0) {
        await schemaService.setSiteId(newSite.id);

        // Initialize with the template schema
        for (const collection of template.schema) {
          await schemaService.createCollection(collection);
        }
      }
    }

    return newSite;
  },

  /**
   * Update an existing site
   */
  async updateSite(siteId: string, updates: Partial<Site>): Promise<Site> {
    // Prevent updating the default site's ID
    if (siteId === 'default' && updates.id && updates.id !== 'default') {
      throw new Error('Cannot change the ID of the default site');
    }

    const response = await fetch(`/api/sites/${siteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update site: ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Delete a site
   */
  async deleteSite(siteId: string): Promise<boolean> {
    // Prevent deleting the default site
    if (siteId === 'default') {
      throw new Error('Cannot delete the default site');
    }

    const response = await fetch(`/api/sites/${siteId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete site: ${response.status}`);
    }

    return true;
  }
};
