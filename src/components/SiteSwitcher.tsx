import { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { Site, useSite } from '@/contexts/SiteContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SiteSwitcher() {
  const { currentSite, sites, switchSite, createSite } = useSite();
  const [isOpen, setIsOpen] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleCreateSite = async () => {
    if (!newSiteName.trim()) return;

    setIsCreating(true);
    try {
      await createSite(newSiteName);
      setNewSiteName('');
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create site:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex items-center space-x-2 mb-4 px-3">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center max-w-[180px] overflow-hidden">
              <span className="truncate mr-1">{currentSite.name}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[240px]">
          {sites.map((site) => (
            <DropdownMenuItem
              key={site.id}
              className="cursor-pointer"
              onClick={() => {
                switchSite(site.id);
                setIsOpen(false);
              }}
            >
              <span className={site.id === currentSite.id ? 'font-semibold' : ''}>
                {site.name}
              </span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem
            className="cursor-pointer focus:bg-primary focus:text-primary-foreground"
            onClick={() => {
              setCreateDialogOpen(true);
              setIsOpen(false);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span>Create New Site</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Site</DialogTitle>
            <DialogDescription>
              Enter a name for your new site. This will create a new empty site.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="siteName" className="text-right">
                Site Name
              </Label>
              <Input
                id="siteName"
                placeholder="My Awesome Site"
                className="col-span-3"
                value={newSiteName}
                onChange={(e) => setNewSiteName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateSite();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSite}
              disabled={!newSiteName.trim() || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Site'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
