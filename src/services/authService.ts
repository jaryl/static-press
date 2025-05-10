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
// Key for storing mock user in demo mode
const DEMO_USER_KEY = 'static-press-demo-user';

// Helper to check the mode
const isRemoteDataMode = () => import.meta.env.VITE_USE_REMOTE_DATA === 'true';

export const authService = {
  login: async (username: string, password: string): Promise<User | null> => {
    if (isRemoteDataMode()) {
      // --- Remote Mode: Use API ---
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          console.error('[AuthService Remote] Login failed:', response.status, await response.text());
          localStorage.removeItem(TOKEN_KEY);
          return null;
        }

        const data = await response.json();
        const token = data.accessToken;

        if (token) {
          localStorage.setItem(TOKEN_KEY, token);
          // getCurrentUser will handle decoding the token
          return authService.getCurrentUser();
        } else {
          console.error('[AuthService Remote] Login succeeded but no token received.');
          return null;
        }
      } catch (error) {
        console.error('[AuthService Remote] Error during login API call:', error);
        return null;
      }
    } else {
      // --- Demo Mode: Mock Authentication ---
      console.log('[AuthService Demo] Attempting mock login');
      if (username === 'admin' && password === 'password123') {
        const mockUser: User = { id: 'admin', role: 'admin' };
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockUser));
        console.log('[AuthService Demo] Mock login successful');
        return Promise.resolve(mockUser);
      } else {
        console.warn('[AuthService Demo] Mock login failed: Invalid credentials');
        localStorage.removeItem(DEMO_USER_KEY); // Clear any old demo user on failed attempt
        return Promise.resolve(null);
      }
    }
  },

  logout: (): Promise<void> => {
    // Clear credentials for both modes
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(DEMO_USER_KEY);
    console.log('[AuthService] Logged out, cleared tokens/demo user.');
    return Promise.resolve();
  },

  getCurrentUser: (): User | null => {
    if (isRemoteDataMode()) {
      // --- Remote Mode: Use JWT ---
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        return null;
      }

      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const isExpired = Date.now() >= decoded.exp * 1000;
        if (isExpired) {
          console.warn('[AuthService Remote] Token expired, clearing.');
          localStorage.removeItem(TOKEN_KEY);
          return null;
        }
        return {
          id: decoded.sub,
          role: decoded.role,
        };
      } catch (error) {
        console.error('[AuthService Remote] Failed to decode token:', error);
        localStorage.removeItem(TOKEN_KEY); // Clear invalid token
        return null;
      }
    } else {
      // --- Demo Mode: Check Mock User ---
      const demoUserJson = localStorage.getItem(DEMO_USER_KEY);
      if (!demoUserJson) {
        return null;
      }
      try {
        const user = JSON.parse(demoUserJson) as User;
        // Optional: Add validation here if needed
        if (user && user.id && user.role) {
          return user;
        }
        console.warn('[AuthService Demo] Invalid demo user data found in localStorage.');
        localStorage.removeItem(DEMO_USER_KEY);
        return null;
      } catch (error) {
        console.error('[AuthService Demo] Failed to parse demo user from localStorage:', error);
        localStorage.removeItem(DEMO_USER_KEY); // Clear invalid data
        return null;
      }
    }
  },

  getToken: (): string | null => {
    // Only return a token if in remote mode and it's valid
    if (!isRemoteDataMode()) {
      return null; // No token in demo mode
    }

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
    // This doesn't need changing as it relies on getCurrentUser
    return !!authService.getCurrentUser();
  },
};
