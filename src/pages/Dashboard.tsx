import { useEffect, useState } from "react";
import { useCollection } from "@/contexts/CollectionContext";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { Plus } from "lucide-react";
import Container from '@/components/layout/Container';
import { Spinner } from "@/components/ui/spinner";
import { PrimaryHeader } from "@/components/layout/PrimaryHeader";
import { SecondaryHeader } from "@/components/layout/SecondaryHeader";
import NoResults from "@/components/layout/NoResults";
import { NewCollectionDialog, CollectionFormData } from '@/components/layout/CollectionForm';
import { CollectionTable } from '@/components/dashboard/CollectionTable';
import { Card } from "@/components/ui/card";

const Dashboard = () => {
  const { collections, fetchCollections, loading, createCollection } = useCollection();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleCreateCollectionSubmit = async (data: CollectionFormData) => {
    try {
      await createCollection({
        ...data,
        fields: data.fields || []
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  const filteredCollections = collections.filter(collection => {
    // Ensure searchTerm is treated as a string
    const search = String(searchTerm).toLowerCase();
    return (
      collection.name.toLowerCase().includes(search) ||
      (collection.description?.toLowerCase() || '').includes(search)
    );
  });

  return (
    <Container>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <PrimaryHeader
          title="Collections"
        >
          {/* New Collection Button */}
          <NewCollectionDialog
            onSubmit={handleCreateCollectionSubmit}
            isOpen={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          />
        </PrimaryHeader>
        <SecondaryHeader
          description="Manage your data collections and schemas"
          searchTerm={searchTerm}
          hasRecords={collections.length > 0}
          searchPlaceholder="Search collections..."
          onSearch={handleSearch}
        />

        {loading && collections.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <Spinner />
          </div>
        ) : filteredCollections.length > 0 ? (
          <Card className="bg-card border-border overflow-hidden shadow-sm m-6">
            <CollectionTable collections={filteredCollections} />
          </Card>
        ) : searchTerm ? (
          <NoResults
            message="No collections match your search"
            helpText="Try a different search term"
          />
        ) : (
          <Card className="bg-card border-border p-6 text-center">
            <div>
              <p className="text-sm font-medium">No collections yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first collection to get started</p>
              <Button className="mt-4 text-xs h-7" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                Create Collection
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Container>
  );
};

export default Dashboard;
