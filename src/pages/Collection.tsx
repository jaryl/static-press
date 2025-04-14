import { useParams, Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useCollection } from "@/contexts/CollectionContext";
import { Sidebar } from "@/components/layout/Sidebar";
import Container from "@/components/common/Container";
import CollectionErrorBoundary from "@/components/collections/CollectionErrorBoundary";
import CollectionContent from "@/components/collections/CollectionContent";
import { Button } from "@/components/ui/button";
import { PrimaryHeader } from "@/components/common/PrimaryHeader";
import { SecondaryHeader } from "@/components/common/SecondaryHeader";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, FileJson } from "lucide-react";
import { useRecordForm } from "@/hooks/use-record-form";
import { useRecordFilter } from "@/hooks/use-record-filter";
import { getDataUrl } from "@/lib/utils";

const Collection = () => {
  const { slug } = useParams<{ slug: string }>();
  const {
    currentCollection,
    records,
    validateRecord,
    createRecord,
    updateRecord
  } = useCollection();

  const form = useRecordForm({ validateRecord, createRecord, updateRecord });
  const filter = useRecordFilter(records);

  const prevSlugRef = useRef(slug);

  useEffect(() => {
    if (prevSlugRef.current && prevSlugRef.current !== slug) {
      if (form.isEditing) {
        form.cancelEditing();
      }
    }

    prevSlugRef.current = slug;
  }, [slug, form]);

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

              <a href={getDataUrl(slug)} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <FileJson className="mr-1 h-3.5 w-3.5" />
                  View JSON
                </Button>
              </a>

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
          </>
        )}

        <CollectionErrorBoundary onRetry={() => window.location.reload()}>
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
      </div>
    </Container>
  );
};

export default Collection;
