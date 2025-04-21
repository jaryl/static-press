import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import ErrorBoundary from './components/layout/ErrorBoundary.tsx';
import './index.css';

// Create a client with better configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't retry on error by default (we'll handle with error boundaries)
      retry: false,
      // Keep data fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Don't refetch on window focus for better UX with serverless functions
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
