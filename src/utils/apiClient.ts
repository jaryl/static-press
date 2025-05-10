import { authService } from '@/services/authService';

/**
 * API Client helper to consistently handle authentication across all API requests
 */
export const apiClient = {
  /**
   * Generic fetch wrapper that automatically adds auth headers
   */
  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    // Start with the provided headers or create empty headers object
    let headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {})
    };

    // Add authentication token if available
    const token = authService.getToken();
    if (token) {
      headers = {
        ...headers,
        'Authorization': `Bearer ${token}`
      };
      console.log(`[apiClient] Adding auth token to request: ${url}`);
    } else {
      console.warn(`[apiClient] No auth token available for request: ${url}`);
    }

    // Return fetch with the updated options
    return fetch(url, {
      ...options,
      headers
    });
  },

  /**
   * GET request
   */
  async get(url: string, options: RequestInit = {}): Promise<Response> {
    return this.fetch(url, {
      ...options,
      method: 'GET'
    });
  },

  /**
   * POST request with JSON body
   */
  async post(url: string, data: any, options: RequestInit = {}): Promise<Response> {
    return this.fetch(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {})
      },
      body: JSON.stringify(data)
    });
  },

  /**
   * PUT request with JSON body
   */
  async put(url: string, data: any, options: RequestInit = {}): Promise<Response> {
    return this.fetch(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {})
      },
      body: JSON.stringify(data)
    });
  },

  /**
   * DELETE request
   */
  async delete(url: string, options: RequestInit = {}): Promise<Response> {
    return this.fetch(url, {
      ...options,
      method: 'DELETE'
    });
  }
};
