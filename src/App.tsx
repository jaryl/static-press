import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CollectionProvider } from "@/contexts/CollectionContext";
import { SiteProvider } from "@/contexts/SiteContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Collection from "@/pages/Collection";
import SchemaEditor from "@/pages/SchemaEditor";
import Settings from "@/pages/Settings";
import SiteSettings from "@/pages/settings/SiteSettings";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import ProtectedOnboardedRoute from "@/components/layout/ProtectedOnboardedRoute";
import Index from "@/pages/Index";

const queryClient = new QueryClient();

// AppRoutes component to separate routing from the main App component
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes with onboarding check */}
        <Route path="/dashboard" element={
          <ProtectedOnboardedRoute>
            <Dashboard />
          </ProtectedOnboardedRoute>
        } />

        <Route path="/collections/:slug" element={
          <ProtectedOnboardedRoute>
            <Collection />
          </ProtectedOnboardedRoute>
        } />

        <Route path="/schema/:slug" element={
          <ProtectedOnboardedRoute>
            <SchemaEditor />
          </ProtectedOnboardedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedOnboardedRoute>
            <Settings />
          </ProtectedOnboardedRoute>
        } />

        <Route path="/settings/site" element={
          <ProtectedOnboardedRoute>
            <SiteSettings />
          </ProtectedOnboardedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

// Inner app component that's only rendered after authentication
const AuthenticatedApp = () => {
  // Only check for onboarding after successful authentication
  return (
    <OnboardingProvider>
      <SiteProvider>
        <CollectionProvider>
          <AppRoutes />
        </CollectionProvider>
      </SiteProvider>
    </OnboardingProvider>
  );
};

// Main App component
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <AuthenticatedApp />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
