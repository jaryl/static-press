import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import StandardDialog from '@/components/ui/standard-dialog';
import { Plus, Lock, Database } from 'lucide-react';
import { generateSlug } from '@/lib/utils';

export interface CollectionFormData {
  name: string;
  slug: string;
  description: string;
  fields?: any[];
}

interface CollectionFormProps {
  initialValues?: CollectionFormData;
  onSubmit: (data: CollectionFormData) => void;
  onOpenChange?: (open: boolean) => void;
  isOpen?: boolean;
  triggerButton?: React.ReactNode;
  title?: string;
  submitButtonText?: string;
}

export const CollectionForm: React.FC<CollectionFormProps> = ({
  initialValues = { name: '', slug: '', description: '', fields: [] },
  onSubmit,
  onOpenChange,
  isOpen,
  triggerButton,
  title = 'New Collection',
  submitButtonText = 'Create Collection'
}) => {
  const [formData, setFormData] = useState<CollectionFormData>(initialValues);

  const handleNameChange = (name: string) => {
    const slug = generateSlug(name);
    setFormData({ ...formData, name, slug });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form if not controlled externally
    if (!isOpen) {
      setFormData({ name: '', slug: '', description: '', fields: [] });
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-xs mb-2 block">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          className="bg-background text-foreground rounded-md text-xs h-10"
        />
      </div>
      <div>
        <Label htmlFor="slug" className="text-xs mb-2 block">Slug (URL identifier)</Label>
        <div className="relative">
          <Input
            id="slug"
            value={formData.slug}
            readOnly
            className="bg-muted text-muted-foreground rounded-md text-xs h-10 pl-8 border border-muted-foreground/20"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Auto-generated from name. Cannot be edited.
        </p>
      </div>
      <div>
        <Label htmlFor="description" className="text-xs mb-2 block">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-background text-foreground rounded-md text-x10"
          rows={3}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit">
          {submitButtonText}
        </Button>
      </div>
    </form>
  );

  // If no dialog control props are provided, just return the form
  if (triggerButton === undefined && isOpen === undefined) {
    return formContent;
  }

  // Otherwise, wrap in a dialog
  return (
    <StandardDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      trigger={triggerButton}
      title={title}
      icon={Database}
      maxWidth="sm"
    >
      {formContent}
    </StandardDialog>
  );
};

// Convenience component for creating a new collection with a button trigger
export const NewCollectionDialog: React.FC<{
  onSubmit: (data: CollectionFormData) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  buttonSize?: 'sm' | 'default';
}> = ({ onSubmit, isOpen, onOpenChange, buttonSize = 'sm' }) => {
  return (
    <CollectionForm
      onSubmit={onSubmit}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Create New Collection"
      triggerButton={
        <Button size={buttonSize} className={buttonSize === 'sm' ? "h-8 text-xs" : ""}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          New Collection
        </Button>
      }
      submitButtonText="Create Collection"
    />
  );
};
