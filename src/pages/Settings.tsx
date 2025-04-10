
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const Settings = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6">
          <div className="mb-6">
            <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to dashboard
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account and application settings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Settings</CardTitle>
                  <CardDescription>Configure your DataScribe application</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>Demo Mode</AlertTitle>
                    <AlertDescription>
                      This is a demo application with simulated functionality. 
                      In a real implementation, these settings would be configurable.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Configuration</CardTitle>
                  <CardDescription>Manage API access and credentials</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>Demo Mode</AlertTitle>
                    <AlertDescription>
                      In a production environment, this section would allow configuration of 
                      API endpoints, authentication tokens, and other backend settings.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>Manage your account settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Name</p>
                    <p className="text-sm text-muted-foreground">{user?.name || 'Admin User'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Username</p>
                    <p className="text-sm text-muted-foreground">{user?.username || 'admin'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Role</p>
                    <p className="text-sm text-muted-foreground">{user?.role || 'Administrator'}</p>
                  </div>
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => logout()}
                    >
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                  <CardDescription>Application information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">Application</p>
                      <p className="text-sm text-muted-foreground">DataScribe Admin</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Version</p>
                      <p className="text-sm text-muted-foreground">1.0.0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
