import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSite } from '@/hooks/useSite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, Save } from 'lucide-react';

export default function SiteSettings() {
  const navigate = useNavigate();
  const { currentSite, updateSite, deleteSite } = useSite();
  
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize form with current site data
  useEffect(() => {
    if (currentSite) {
      setSiteName(currentSite.name);
      setSiteDescription(currentSite.description || '');
    }
  }, [currentSite]);

  const handleSave = async () => {
    if (!siteName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Site name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateSite(currentSite.id, {
        name: siteName,
        description: siteDescription,
      });
      
      toast({
        title: 'Success',
        description: 'Site settings updated successfully',
      });
    } catch (error) {
      console.error('Failed to update site settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update site settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (currentSite.id === 'default') {
      toast({
        title: 'Error',
        description: 'The default site cannot be deleted',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await deleteSite(currentSite.id);
      if (success) {
        navigate('/');
        toast({
          title: 'Success',
          description: 'Site deleted successfully',
        });
      }
    } catch (error) {
      console.error('Failed to delete site:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete site. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Site Settings</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Manage basic information about your site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <Label htmlFor="siteName" className="text-right pt-2">
                  Site Name
                </Label>
                <div className="col-span-3">
                  <Input
                    id="siteName"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    disabled={currentSite.id === 'default'}
                  />
                  {currentSite.id === 'default' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      The default site name cannot be changed.
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <Label htmlFor="siteId" className="text-right pt-2">
                  Site ID
                </Label>
                <div className="col-span-3">
                  <Input
                    id="siteId"
                    value={currentSite.id}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    The site ID cannot be changed after creation.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <Label htmlFor="siteDescription" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="siteDescription"
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  className="col-span-3"
                  rows={3}
                  disabled={currentSite.id === 'default'}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              {currentSite.id !== 'default' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Site
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the site "{currentSite.name}" and all of its collections and data.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <Button onClick={handleSave} disabled={isLoading || currentSite.id === 'default'}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
