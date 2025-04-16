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
import { useCreateCollectionSubmit } from '@/hooks/use-create-collection-submit';

const Dashboard = () => {
  const {
    collections,
    fetchCollections,
    loading,
    createCollection,
    error,
    errorType
  } = useCollection();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { submit: submitNewCollection, isSubmitting, error: submissionError, resetError } = useCreateCollectionSubmit(createCollection);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleDialogSubmit = async (data: CollectionFormData) => {
    const success = await submitNewCollection(data);
    if (success) {
      setIsCreateDialogOpen(false);
    } else {
      console.error("Submission failed:", submissionError);
    }
  };

  const filteredCollections = collections.filter(collection => {
    const search = String(searchTerm).toLowerCase();
    return (
      collection.name.toLowerCase().includes(search) ||
      (collection.description?.toLowerCase() || '').includes(search)
    );
  });

  const renderError = () => {
    if (!error) return null;

    let title = "Error Loading Collections";
    let description = error;

    if (errorType === 'SCHEMA_FILE_NOT_FOUND') {
      title = "Schema Not Found";
      description = "The main schema file (schema.json) could not be found. Please check your storage configuration or initialize the schema.";
    } else if (errorType === 'SCHEMA_MALFORMED') {
      title = "Invalid Schema Format";
      description = "The main schema file (schema.json) is not valid JSON. Please check the file content.";
    }

    return (
      <Card className="bg-destructive/10 border-destructive text-destructive-foreground p-4 m-6 text-center">
        <p className="font-semibold">{title}</p>
        <p className="text-sm mt-1">{description}</p>
        <Button variant="destructive" size="sm" className="mt-3" onClick={() => fetchCollections()}>Retry</Button>
      </Card>
    );
  }

  return (
    <Container>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <PrimaryHeader
          title="Collections"
        >
          <NewCollectionDialog
            onSubmit={handleDialogSubmit}
            isOpen={isCreateDialogOpen}
            onOpenChange={(isOpen) => {
              setIsCreateDialogOpen(isOpen);
              if (!isOpen) resetError();
            }}
            isSubmitting={isSubmitting}
            submissionError={submissionError}
          />
        </PrimaryHeader>
        <SecondaryHeader
          description="Manage your data collections and schemas"
          searchTerm={searchTerm}
          hasRecords={collections.length > 0}
          searchPlaceholder="Search collections..."
          onSearch={handleSearch}
        />

        {renderError()}

        {!error && loading && collections.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <Spinner />
          </div>
        ) : filteredCollections.length > 0 ? (
          <Card className="bg-card border-border overflow-hidden shadow-sm mx-3 my-4 sm:m-6">
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
