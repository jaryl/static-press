
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
        <div className="page-header">
          <h1 className="text-md font-medium">Settings</h1>
          <div className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                <ArrowLeft className="mr-1 h-3 w-3" />
                Back
              </Button>
            </Link>
          </div>
        </div>
        
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
                  <CardTitle className="text-md">Application Settings</CardTitle>
                  <CardDescription className="text-xs">Configure your DataScribe application</CardDescription>
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
                  <CardTitle className="text-md">API Configuration</CardTitle>
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
                  <CardTitle className="text-md">Account</CardTitle>
                  <CardDescription className="text-xs">Manage your account settings</CardDescription>
                </CardHeader>
                <CardContent className="px-4 py-3 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-foreground">Name</p>
                    <p className="text-xs text-muted-foreground">{user?.name || 'Admin User'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">Username</p>
                    <p className="text-xs text-muted-foreground">{user?.username || 'admin'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">Role</p>
                    <p className="text-xs text-muted-foreground">{user?.role || 'Administrator'}</p>
                  </div>
                  <div className="pt-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive text-xs h-7"
                      onClick={() => logout()}
                    >
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-md">About</CardTitle>
                  <CardDescription className="text-xs">Application information</CardDescription>
                </CardHeader>
                <CardContent className="px-4 py-3">
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-foreground">Application</p>
                      <p className="text-xs text-muted-foreground">DataScribe Admin</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Version</p>
                      <p className="text-xs text-muted-foreground">1.0.0</p>
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
