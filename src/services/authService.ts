
// This is a mock authentication service
// In a real application, this would connect to a backend

// Hardcoded credentials (in a real app, these would be in environment variables)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "password123";

export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

export const authService = {
  login: (username: string, password: string): Promise<User | null> => {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
          const user: User = {
            id: "1",
            username: ADMIN_USERNAME,
            name: "Admin User",
            role: "admin",
          };
          // Store user in localStorage
          localStorage.setItem("user", JSON.stringify(user));
          resolve(user);
        } else {
          resolve(null);
        }
      }, 500);
    });
  },

  logout: (): Promise<void> => {
    return new Promise((resolve) => {
      // Clear user from localStorage
      localStorage.removeItem("user");
      resolve();
    });
  },

  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem("user");
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as User;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return !!authService.getCurrentUser();
  },
};
