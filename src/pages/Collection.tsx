import { useParams, Link } from "react-router-dom";
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
import { useRecordForm } from "@/hooks/useRecordForm";
import { useRecordFilter } from "@/hooks/useRecordFilter";
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

  // Use custom hooks for form and filtering
  const form = useRecordForm({ validateRecord, createRecord, updateRecord });
  const filter = useRecordFilter(records);

  // Derived state
  const hasNewRecord = !!form.newRecordId;
  const hasAnyRecords = filter.hasRecords(hasNewRecord ? 1 : 0);

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
                  onClick={() => form.createNewRecord(currentCollection)}
                  className="h-8 text-xs"
                  disabled={hasNewRecord}
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
            onCreateRecord={(collection) => form.createNewRecord(collection)}
            searchTerm={filter.searchTerm}
            filteredRecords={filter.filteredRecords}
          />
        </CollectionErrorBoundary>
      </div>
    </Container>
  );
};

export default Collection;
