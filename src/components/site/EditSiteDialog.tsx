import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSite } from '@/hooks/useSite';
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

interface EditSiteDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  site: {
    id: string;
    name: string;
    description?: string;
  };
}

export function EditSiteDialog({ isOpen, onOpenChange, site }: EditSiteDialogProps) {
  const { updateSite, deleteSite } = useSite();

  // Edit site state
  const [siteName, setSiteName] = useState(site.name);
  const [siteDescription, setSiteDescription] = useState(site.description || '');

  // Delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Update site details
  const handleUpdateSite = async () => {
    if (siteName.trim() === '') {
      return; // Don't update with an empty name
    }

    try {
      await updateSite(site.id, {
        name: siteName,
        description: siteDescription
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update site:', error);
    }
  };

  // Delete a site
  const handleDeleteSite = async () => {
    try {
      await deleteSite(site.id);
      setShowDeleteDialog(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete site:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Site</DialogTitle>
          <DialogDescription>
            Update the details for this site.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="editSiteName" className="text-right">
              Site Name
            </Label>
            <Input
              id="editSiteName"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="editSiteDescription" className="text-right pt-2">
              Description
            </Label>
            <Textarea
              id="editSiteDescription"
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              className="col-span-3"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Site
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the site "{siteName}" and all of its collections and data.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteSite} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="mr-2">Cancel</Button>
            <Button onClick={handleUpdateSite}>Save Changes</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
