// This is a mock authentication service
// In a real application, this would connect to a backend

import { jwtDecode } from 'jwt-decode';

// Define the shape of the user data we expect/use in the frontend
export interface User {
  id: string; // Usually corresponds to 'sub' in JWT
  role: string;
}

// Define the expected shape of the JWT payload
interface DecodedToken {
  sub: string; // Subject (username/id)
  role: string; // Custom role claim
  iat: number; // Issued at timestamp (seconds)
  exp: number; // Expiration timestamp (seconds)
}

// Key for storing the JWT in localStorage
const TOKEN_KEY = 'accessToken';

export const authService = {
  login: async (username: string, password: string): Promise<User | null> => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        console.error('Login failed:', response.status, await response.text());
        return null;
      }

      const data = await response.json();
      const token = data.accessToken;

      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        return authService.getCurrentUser();
      } else {
        console.error('Login succeeded but no token received.');
        return null;
      }
    } catch (error) {
      console.error('Error during login API call:', error);
      return null;
    }
  },

  logout: (): Promise<void> => {
    localStorage.removeItem(TOKEN_KEY);
    return Promise.resolve();
  },

  getCurrentUser: (): User | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return null;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);

      const isExpired = Date.now() >= decoded.exp * 1000;
      if (isExpired) {
        console.warn('Token expired, clearing.');
        localStorage.removeItem(TOKEN_KEY);
        return null;
      }

      return {
        id: decoded.sub,
        role: decoded.role,
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  },

  getToken: (): string | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (Date.now() >= decoded.exp * 1000) {
        localStorage.removeItem(TOKEN_KEY);
        return null;
      }
    } catch (e) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }

    return token;
  },

  isAuthenticated: (): boolean => {
    return !!authService.getCurrentUser();
  },
};
