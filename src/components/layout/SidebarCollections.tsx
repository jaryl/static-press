import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Database, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CollectionSchema } from "@/services/collectionService";

interface SidebarCollectionsProps {
  isOpen: boolean;
  collections: CollectionSchema[];
  createCollection: (collection: Omit<CollectionSchema, "id" | "createdAt" | "updatedAt">) => Promise<CollectionSchema>;
}

export function SidebarCollections({ isOpen, collections, createCollection }: SidebarCollectionsProps) {
  const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({
    name: "",
    slug: "",
    description: "",
    fields: []
  });
  const location = useLocation();

  const handleNameChange = (value: string) => {
    setNewCollection({
      ...newCollection,
      name: value,
      slug: value.toLowerCase().replace(/\s+/g, '-')
    });
  };

  const handleNewCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCollection({
      ...newCollection,
      fields: [] // Start with no fields, they'll be added in schema editor
    });
    setNewCollection({
      name: "",
      slug: "",
      description: "",
      fields: []
    });
    setIsNewCollectionOpen(false);
  };

  // Common dialog content for both views
  const collectionDialog = (
    <DialogContent className="bg-card border-border">
      <DialogHeader>
        <DialogTitle className="text-base">New Collection</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleNewCollectionSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-xs">Name</Label>
          <Input
            id="name"
            value={newCollection.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            className="saas-input text-xs h-8"
          />
        </div>
        <div>
          <Label htmlFor="slug" className="text-xs">Slug (URL identifier)</Label>
          <Input
            id="slug"
            value={newCollection.slug}
            onChange={(e) => setNewCollection({ ...newCollection, slug: e.target.value })}
            required
            className="saas-input text-xs h-8"
          />
        </div>
        <div>
          <Label htmlFor="description" className="text-xs">Description</Label>
          <Textarea
            id="description"
            value={newCollection.description}
            onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
            className="saas-input text-xs"
            rows={3}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" className="saas-button-primary">
            Create Collection
          </Button>
        </div>
      </form>
    </DialogContent>
  );

  // Expanded view of collections
  if (isOpen) {
    return (
      <div className="mt-5">
        <div className="flex items-center justify-between px-4 mb-2">
          <h3 className="text-sm font-medium text-sidebar-foreground/70">Collections</h3>
          <Dialog open={isNewCollectionOpen} onOpenChange={setIsNewCollectionOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-sm hover:bg-sidebar-accent"
              >
                <PlusCircle size={14} className="text-sidebar-foreground/70" />
              </Button>
            </DialogTrigger>
            {collectionDialog}
          </Dialog>
        </div>

        <div className="space-y-2 px-2">
          {collections.map((collection) => (
            <Link key={collection.slug} to={`/collections/${collection.slug}`}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent h-8 px-3 py-5",
                  location.pathname.includes(`/collections/${collection.slug}`) && "bg-sidebar-accent text-sidebar-primary"
                )}
              >
                <span className="mr-2">
                  <Database size={16} />
                </span>
                <span className="truncate text-sm">{collection.name}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Collapsed view of collections
  return (
    <div className="mt-5 flex flex-col items-center">
      <Dialog open={isNewCollectionOpen} onOpenChange={setIsNewCollectionOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-sidebar-accent mb-2"
            title="New Collection"
          >
            <PlusCircle size={16} className="text-sidebar-foreground/70" />
          </Button>
        </DialogTrigger>
        {collectionDialog}
      </Dialog>

      <div className="flex flex-col space-y-2">
        {collections.map((collection) => (
          <Link key={collection.slug} to={`/collections/${collection.slug}`}>
            <Button
              variant="ghost"
              className={cn(
                "h-8 w-8 flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent",
                location.pathname.includes(`/collections/${collection.slug}`) && "bg-sidebar-accent text-sidebar-primary"
              )}
              title={collection.name}
            >
              <span className="text-base">{collection.name.charAt(0).toUpperCase()}</span>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
