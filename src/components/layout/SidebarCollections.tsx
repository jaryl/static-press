import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Database, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CollectionSchema } from "@/services/schemaService";
import { CollectionForm, CollectionFormData } from '@/components/common/CollectionForm';

interface SidebarCollectionsProps {
  isOpen: boolean;
  collections: CollectionSchema[];
  createCollection: (collection: Omit<CollectionSchema, "id" | "createdAt" | "updatedAt">) => Promise<CollectionSchema>;
}

export function SidebarCollections({ isOpen, collections, createCollection }: SidebarCollectionsProps) {
  const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false);
  const location = useLocation();

  const handleCollectionFormSubmit = async (data: CollectionFormData) => {
    await createCollection({
      ...data,
      fields: data.fields || []
    });
    setIsNewCollectionOpen(false);
  };

  // Common dialog content for both views
  const collectionDialog = (
    <CollectionForm
      onSubmit={handleCollectionFormSubmit}
      isOpen={isNewCollectionOpen}
      onOpenChange={setIsNewCollectionOpen}
      title="New Collection"
    />
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
