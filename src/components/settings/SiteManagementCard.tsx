import React from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '@/hooks/useSite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Settings, PlusCircle } from 'lucide-react';

const SiteManagementCard: React.FC = () => {
  const { currentSite, sites } = useSite();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Site Management</CardTitle>
        <CardDescription className="text-xs">
          Manage your sites and their configurations
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">Current Site</p>
            <div className="bg-muted p-3 rounded-md flex items-center justify-between">
              <div>
                <p className="font-semibold">{currentSite.name}</p>
                <p className="text-xs text-muted-foreground">ID: {currentSite.id}</p>
              </div>
              <Link to="/settings/site">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Configure
                </Button>
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Your Sites</p>
            <div className="text-sm">
              <p>You have access to <span className="font-semibold">{sites.length}</span> {sites.length === 1 ? 'site' : 'sites'}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <Link to="/dashboard">
          <Button variant="outline" size="sm">
            <Database className="h-4 w-4 mr-1" />
            View Collections
          </Button>
        </Link>
        <Link to="/dashboard?newSite=true">
          <Button size="sm">
            <PlusCircle className="h-4 w-4 mr-1" />
            Create New Site
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default SiteManagementCard;
