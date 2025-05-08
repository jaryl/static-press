import { useState } from 'react';
import { ChevronDown, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSite } from '@/hooks/useSite';
import { NewSiteDialog } from '@/components/site/NewSiteDialog';
import { EditSiteDialog } from '@/components/site/EditSiteDialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function SiteSwitcher() {
  const { currentSite, sites, switchSite } = useSite();

  // Dropdown state
  const [open, setOpen] = useState(false);

  // Dialog states
  const [showNewSiteDialog, setShowNewSiteDialog] = useState(false);
  const [showEditSiteDialog, setShowEditSiteDialog] = useState(false);
  const [editingSite, setEditingSite] = useState<any>(null);

  // Open edit dialog with site details
  const openEditDialog = (site: any) => {
    setEditingSite(site);
    setShowEditSiteDialog(true);
  };

  return (
    <div className="flex items-center space-x-2 mb-4 px-3">
      {/* Site Switcher Dropdown */}
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            <span className="truncate">{currentSite.name}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[240px]">
          {sites.map((site) => (
            <DropdownMenuItem
              key={site.id}
              className="flex justify-between"
            >
              <div
                onClick={() => {
                  switchSite(site.id);
                  setOpen(false);
                }}
                className="flex-1 cursor-pointer"
              >
                {site.name}
              </div>
              {site.id !== 'default' && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(site);
                          setOpen(false);
                        }}
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Site Settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={(e) => {
            e.preventDefault();
            setShowNewSiteDialog(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            New Site
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create New Site Dialog */}
      <NewSiteDialog
        isOpen={showNewSiteDialog}
        onOpenChange={setShowNewSiteDialog}
      />

      {/* Edit Site Dialog */}
      {editingSite && (
        <EditSiteDialog
          isOpen={showEditSiteDialog}
          onOpenChange={setShowEditSiteDialog}
          site={editingSite}
        />
      )}
    </div>
  );
}
