import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useCollection } from "@/contexts/CollectionContext";
import { Sidebar } from "@/components/layout/sidebar";
import Container from "@/components/layout/Container";
import CollectionErrorBoundary from "@/components/collections/CollectionErrorBoundary";
import CollectionContent from "@/components/collections/CollectionContent";
import { Button } from "@/components/ui/button";
import { PrimaryHeader } from "@/components/layout/PrimaryHeader";
import { SecondaryHeader } from "@/components/layout/SecondaryHeader";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, FileJson, AlertTriangle } from "lucide-react";
import { useRecordForm } from "@/hooks/use-record-form";
import { useRecordFilter } from "@/hooks/use-record-filter";
import { Card } from "@/components/ui/card";
import { CollectionDataPrivacyAlert } from '@/components/collections/CollectionDataPrivacyAlert';

const Collection = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const {
    currentCollection,
    records,
    validateRecord,
    createRecord,
    updateRecord,
    getRawCollectionUrl,
    fetchCollection,
    fetchRecords,
    error,
    errorType
  } = useCollection();

  const form = useRecordForm({ validateRecord, createRecord, updateRecord });
  const filter = useRecordFilter(records);

  const prevSlugRef = useRef(slug);

  useEffect(() => {
    if (prevSlugRef.current && prevSlugRef.current !== slug) {
      if (form.isEditing) {
        form.cancelEditing();
      }

      if (slug) {
        const loadCollection = async () => {
          const collection = await fetchCollection(slug);
          if (collection) fetchRecords(slug);
        };

        loadCollection();
      }
    }

    prevSlugRef.current = slug;
  }, [slug, form, fetchCollection, fetchRecords]);

  useEffect(() => {
    if (slug && (!currentCollection || currentCollection.slug !== slug)) {
      const loadInitialCollection = async () => {
        const collection = await fetchCollection(slug);
        if (collection) fetchRecords(slug);
      };
      loadInitialCollection();
    }
  }, [slug, currentCollection, fetchCollection, fetchRecords]);

  const hasNewRecord = !!form.newRecordId;
  const hasAnyRecords = records.length > 0 || hasNewRecord;

  const handleCreateRecord = () => {
    if (currentCollection) {
      form.createNewRecord(currentCollection);

      setTimeout(() => {
        const tableElement = document.querySelector('.collection-table') as HTMLElement;
        const scrollContainer = document.querySelector('.flex-1.overflow-y-auto') as HTMLElement;

        if (tableElement) {
          if (scrollContainer) {
            const headerOffset = 80;
            scrollContainer.scrollTop = tableElement.offsetTop - headerOffset;
          } else {
            tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 0);
    }
  };

  if (!slug) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-medium">Collection not found</p>
            <Link to="/dashboard">
              <Button variant="link" size="sm" className="mt-2 text-xs">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Container>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {currentCollection && (
          <>
            <PrimaryHeader
              title={currentCollection.name}
              subtitle={
                <Badge variant="outline" className="text-[10px] h-6">
                  {records.length} {records.length === 1 ? 'record' : 'records'}
                </Badge>
              }
            >
              <Link to={`/schema/${slug}`}>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <Edit className="mr-1 h-3.5 w-3.5" />
                  Schema
                </Button>
              </Link>

              {getRawCollectionUrl(slug) ? (
                <a href={getRawCollectionUrl(slug)} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    <FileJson className="mr-1 h-3.5 w-3.5" />
                    View JSON
                  </Button>
                </a>
              ) : (
                <Button variant="outline" size="sm" className="h-8 text-xs" disabled title="JSON view not available in local mode">
                  <FileJson className="mr-1 h-3.5 w-3.5" />
                  View JSON
                </Button>
              )}

              {hasAnyRecords && (
                <Button
                  size="sm"
                  onClick={handleCreateRecord}
                  className="h-8 text-xs"
                  disabled={hasNewRecord || !!form.editingRecordId}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  New Record
                </Button>
              )}
            </PrimaryHeader>

            {/* Secondary Header with Search */}
            <SecondaryHeader
              description={currentCollection.description || ''}
              hasRecords={hasAnyRecords}
              searchPlaceholder="Search records..."
              searchTerm={filter.searchTerm}
              onSearch={filter.handleSearch}
            />

            {/* Accessibility Warning */}
            {currentCollection && slug && (
              <CollectionDataPrivacyAlert />
            )}
          </>
        )}

        {/* Render Error or Content based on context error state */}
        {error && currentCollection ? (
          // Render error message if collection loaded but records failed
          <Card className="bg-destructive/10 border-destructive text-destructive-foreground p-4 m-6 text-center">
            <AlertTriangle className="mx-auto h-6 w-6 mb-2" />
            <p className="font-semibold">Error Loading Records</p>
            <p className="text-sm mt-1">
              {errorType === 'COLLECTION_DATA_NOT_FOUND'
                ? `The data file (${slug}.json) for this collection could not be found.`
                : errorType === 'COLLECTION_DATA_MALFORMED'
                  ? `The data file (${slug}.json) appears to be corrupted or not valid JSON.`
                  : error // Fallback to the generic error message
              }
            </p>
            <Button variant="destructive" size="sm" className="mt-3" onClick={() => fetchRecords(slug!)}>Retry</Button>
          </Card>
        ) : currentCollection ? (
          // Render content only if collection is loaded and no error exists
          <CollectionErrorBoundary onRetry={() => window.location.reload()} >
            <CollectionContent
              id={slug}
              onCreateRecord={handleCreateRecord}
              searchTerm={filter.searchTerm}
              filteredRecords={filter.filteredRecords}
              newRecordId={form.newRecordId}
              formData={form.formData}
              onFieldChange={form.handleFieldChange}
              onSaveRecord={(id, collection) => form.saveRecord(id, collection)}
              onCancelEdit={form.cancelEditing}
              editingRecordId={form.editingRecordId}
              onStartEdit={form.startEditing}
              formErrors={form.errors}
            />
          </CollectionErrorBoundary>
        ) : (
          // Handle case where currentCollection is null (likely loading or schema fetch error)
          // The context provider or Dashboard usually handles the initial schema load error display
          // This part might need refinement based on how initial load errors are presented
          <div className="flex items-center justify-center h-64">
            {/* Optionally show loading or a generic message if needed */}
          </div>
        )}
      </div>
    </Container>
  );
};

export default Collection;
