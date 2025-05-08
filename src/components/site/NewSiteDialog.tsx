import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useSite } from '@/hooks/useSite';
import { siteTemplates } from '@/data/siteTemplates';

interface NewSiteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewSiteDialog({ isOpen, onOpenChange }: NewSiteDialogProps) {
  const navigate = useNavigate();
  const { createSite } = useSite();

  const [newSiteId, setNewSiteId] = useState('');
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteDescription, setNewSiteDescription] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('blank');
  const [isCreating, setIsCreating] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setNewSiteId('');
      setNewSiteName('');
      setNewSiteDescription('');
      setSelectedTemplateId('blank');
    }
  }, [isOpen]);

  // Generate URL-friendly ID from name
  const generateSiteId = (name: string) => {
    return name.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  // Handle site name input, auto-generate ID if empty
  const handleSiteNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setNewSiteName(name);

    if (!newSiteId || newSiteId === generateSiteId(newSiteName)) {
      setNewSiteId(generateSiteId(name));
    }
  };

  // Create a new site
  const handleCreateSite = async () => {
    if (newSiteName.trim() === '') {
      toast({
        title: 'Validation Error',
        description: 'Site name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      await createSite({
        id: newSiteId,
        name: newSiteName,
        description: newSiteDescription,
        templateId: selectedTemplateId
      });

      // Reset form and close dialog
      onOpenChange(false);

      // Remove any query params from URL
      navigate(window.location.pathname, { replace: true });

      toast({
        title: 'Site Created',
        description: `Successfully created "${newSiteName}" site.`,
      });
    } catch (error) {
      console.error('Failed to create site:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create site',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create a new site</DialogTitle>
          <DialogDescription>
            Enter the details for your new site and select a template.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="siteName" className="text-right">
              Site Name
            </Label>
            <Input
              id="siteName"
              value={newSiteName}
              onChange={handleSiteNameChange}
              className="col-span-3"
              placeholder="My New Site"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="siteId" className="text-right">
              Site ID
            </Label>
            <Input
              id="siteId"
              value={newSiteId}
              onChange={(e) => setNewSiteId(e.target.value)}
              className="col-span-3"
              placeholder="my-new-site"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="siteDescription" className="text-right pt-2">
              Description
            </Label>
            <Textarea
              id="siteDescription"
              value={newSiteDescription}
              onChange={(e) => setNewSiteDescription(e.target.value)}
              className="col-span-3"
              placeholder="A short description of this site"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">
              Template
            </Label>
            <div className="col-span-3 space-y-4">
              <RadioGroup
                value={selectedTemplateId}
                onValueChange={setSelectedTemplateId}
                className="grid grid-cols-1 gap-4 md:grid-cols-2"
              >
                {siteTemplates.map((template) => (
                  <div key={template.id} className="relative">
                    <RadioGroupItem
                      value={template.id}
                      id={template.id}
                      className="absolute top-4 left-4 z-10"
                    />
                    <Label
                      htmlFor={template.id}
                      className="cursor-pointer"
                    >
                      <Card className={`overflow-hidden ${selectedTemplateId === template.id ? 'border-primary' : ''}`}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">{template.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground">
                          {template.description}
                        </CardContent>
                        {template.schema.length > 0 && (
                          <CardFooter className="pt-0 text-xs">
                            {template.schema.length} collection{template.schema.length !== 1 ? 's' : ''}
                          </CardFooter>
                        )}
                      </Card>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
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
  );
}
