import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useCollection } from "@/contexts/CollectionContext";
import { useSite } from "@/hooks/useSite";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { Plus } from "lucide-react";
import { NewSiteDialog } from "@/components/site/NewSiteDialog";
import Container from '@/components/layout/Container';
import { Spinner } from "@/components/ui/spinner";
import { PrimaryHeader } from "@/components/layout/PrimaryHeader";
import { SecondaryHeader } from "@/components/layout/SecondaryHeader";
import NoResults from "@/components/layout/NoResults";
import { NewCollectionDialog } from '@/components/layout/CollectionForm';
import type { CollectionFormData } from '@/types';
import { CollectionTable } from '@/components/dashboard/CollectionTable';
import { Card } from "@/components/ui/card";
import { useCreateCollectionSubmit } from '@/hooks/use-create-collection-submit';
import { useQueryClient } from "@tanstack/react-query";

const Dashboard = () => {
  const {
    collections,
    createCollection,
    loading,
    error,
    errorType
  } = useCollection();
  const { currentSite } = useSite();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSiteDialogOpen, setIsSiteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const newSite = searchParams.get('newSite');
    if (newSite === 'true') {
      setIsSiteDialogOpen(true);
    }
  }, [searchParams]);

  const { submit: submitNewCollection, isSubmitting, error: submissionError, resetError } = useCreateCollectionSubmit(createCollection);

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
        <Button
          variant="destructive"
          size="sm"
          className="mt-3"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['collections'] })}
        >
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <Container>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-y-auto">
        <PrimaryHeader
          title={`Collections - ${currentSite.name}`}
        >
          <div className="flex items-center space-x-2">
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
            <NewSiteDialog
              isOpen={isSiteDialogOpen}
              onOpenChange={setIsSiteDialogOpen}
            />
          </div>
        </PrimaryHeader>
        <SecondaryHeader
          description="Manage your data collections and schemas"
          searchTerm={searchTerm}
          hasRecords={collections.length > 0}
          searchPlaceholder="Search collections..."
          onSearch={handleSearch}
        />

        {renderError()}

        {loading && collections.length === 0 ? (
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
              <p className="text-sm font-medium">No collections yet in <span className="font-bold">{currentSite.name}</span></p>
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
