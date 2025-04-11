import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { ExternalLink } from 'lucide-react';
import { LogOut } from 'lucide-react';
import Container from "@/components/common/Container";
import { PrimaryHeader } from "@/components/common/PrimaryHeader";

const Settings = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Container>
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <PrimaryHeader
            title="Settings"
            backLink="/dashboard"
          />

          <div className="secondary-header">
            <div className="text-xs text-muted-foreground">
              Manage your account and application settings
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <Card>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-base">Application Settings</CardTitle>
                    <CardDescription className="text-xs">Configure your StaticPress application</CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 py-3 text-sm">
                    <Alert>
                      <InfoIcon className="h-3 w-3" />
                      <AlertTitle className="text-xs font-medium">Demo Mode</AlertTitle>
                      <AlertDescription className="text-xs">
                        This is a demo application with simulated functionality.
                        In a real implementation, these settings would be configurable.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-base">API Configuration</CardTitle>
                    <CardDescription className="text-xs">Manage API access and credentials</CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 py-3 text-sm">
                    <Alert>
                      <InfoIcon className="h-3 w-3" />
                      <AlertTitle className="text-xs font-medium">Demo Mode</AlertTitle>
                      <AlertDescription className="text-xs">
                        In a production environment, this section would allow configuration of
                        API endpoints, authentication tokens, and other backend settings.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-base">Account</CardTitle>
                    <CardDescription className="text-xs">Manage your account settings</CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 py-3 space-y-3">
                    <dl className="space-y-3">
                      <div className="space-y-1">
                        <dt className="text-xs font-medium text-foreground">Name</dt>
                        <dd className="text-xs text-muted-foreground">{user?.name || 'Admin User'}</dd>
                      </div>
                      <div className="space-y-1">
                        <dt className="text-xs font-medium text-foreground">Username</dt>
                        <dd className="text-xs text-muted-foreground">{user?.username || 'admin'}</dd>
                      </div>
                    </dl>
                    <div className="pt-1">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full gap-2 text-sm"
                        onClick={() => logout()}
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-base">About</CardTitle>
                    <CardDescription className="text-xs">StaticPress is a modern, lightweight content management system (CMS) designed for developers who need a simple yet powerful way to manage structured content.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 py-3">
                    <dl className="space-y-4">
                      <div className="space-y-1">
                        <dt className="text-xs font-medium text-foreground">Application</dt>
                        <dd className="text-xs text-muted-foreground">
                          {import.meta.env.VITE_APP_REPOSITORY_URL ? (
                            <a href={import.meta.env.VITE_APP_REPOSITORY_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                              static-press <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            'No build information'
                          )}
                        </dd>
                      </div>
                      <div className="space-y-1">
                        <dt className="text-xs font-medium text-foreground">Version</dt>
                        <dd className="text-xs text-muted-foreground">
                          {import.meta.env.VITE_APP_VERSION || 'No version information'}
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Settings;
