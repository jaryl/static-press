import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CollectionProvider } from "@/contexts/CollectionContext";
import { SiteProvider } from "@/contexts/SiteContext";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Collection from "@/pages/Collection";
import SchemaEditor from "@/pages/SchemaEditor";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Index from "@/pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <SiteProvider>
          <CollectionProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />

                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />

                <Route path="/collections/:slug" element={
                  <ProtectedRoute>
                    <Collection />
                  </ProtectedRoute>
                } />

                <Route path="/schema/:slug" element={
                  <ProtectedRoute>
                    <SchemaEditor />
                  </ProtectedRoute>
                } />

                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CollectionProvider>
        </SiteProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
