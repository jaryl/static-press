
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCollection } from "@/contexts/CollectionContext";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import RecordRow from "./RecordRow";
import NewRecordRow from "./NewRecordRow";
import EmptyState from "./EmptyState";
import NoResults from "./NoResults";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { useRecordForm } from "@/hooks/useRecordForm";
import { CollectionRecord } from "@/services/collectionService";

interface CollectionContentProps {
  id: string;
  onCreateRecord?: (collection: any) => void;
  searchTerm?: string;
  filteredRecords?: CollectionRecord[];
}

const CollectionContent = ({ id, onCreateRecord, searchTerm, filteredRecords }: CollectionContentProps) => {
  const {
    fetchCollection,
    fetchRecords,
    currentCollection,
    records,
    deleteRecord,
    createRecord,
    updateRecord,
    validateRecord
  } = useCollection();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use custom hooks for form
  const form = useRecordForm({ validateRecord, createRecord, updateRecord });

  // Load collection data
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      setError(null);

      try {
        await fetchCollection(id);
        await fetchRecords(id);
      } catch (err) {
        if (isMounted) {
          console.error('Error loading collection data:', err);
          // Convert to Error object if it's not already
          const errorObj = err instanceof Error ? err : new Error(String(err));
          setError(errorObj);
          // This will trigger the error boundary by throwing in render
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Handle record deletion
  const handleDelete = async (recordId: string) => {
    await deleteRecord(id, recordId);
  };

  // Derived state
  const hasNewRecord = !!form.newRecordId;
  const displayRecords = filteredRecords || records;
  const hasAnyRecords = records.length > 0 || hasNewRecord;
  const hasFilteredRecords = displayRecords.length > 0 || hasNewRecord;
  const isFiltering = searchTerm && searchTerm.trim() !== '';

  // If there's an error, throw it so the error boundary can catch it
  if (error) {
    throw error;
  }

  if (!currentCollection) {
    return (
      <div className="flex-1 flex items-center justify-center">
        {isLoading ? (
          <Loader />
        ) : (
          <div className="text-center">
            <p className="text-sm font-medium">Collection not found</p>
            <Link to="/dashboard">
              <Button variant="link" size="sm" className="mt-2 text-xs">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Only return the main content area
  return (
    <div className="p-0 flex flex-1">
      {isLoading ? (
        <div className="flex flex-col flex-1 items-center justify-center">
          <Loader />
        </div>
      ) : !hasAnyRecords ? (
        <EmptyState
          collectionName={currentCollection.name}
          onCreateRecord={() => onCreateRecord ? onCreateRecord(currentCollection) : form.createNewRecord(currentCollection)}
        />
      ) : hasFilteredRecords ? (
        <div className="flex-1 max-w-full">
          {/* Error Display */}
          <ErrorDisplay errors={form.errors} />

          {/* Records Table with proper horizontal scroll handling */}
          <div className="mt-4 flow-root w-full">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {currentCollection.fields.map((field) => (
                        <TableHead key={field.id} className="text-xs">
                          {field.name}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </TableHead>
                      ))}
                      <TableHead className="text-xs text-right w-[100px] sticky right-0 z-10 bg-background group-hover:bg-muted">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* New Record Row */}
                    {hasNewRecord && (
                      <NewRecordRow
                        collection={currentCollection}
                        formData={form.formData}
                        onFieldChange={form.handleFieldChange}
                        onSave={() => form.saveRecord(id, currentCollection)}
                        onCancel={form.cancelEditing}
                      />
                    )}

                    {/* Record Rows */}
                    {displayRecords.map((record) => (
                      <RecordRow
                        key={record.id}
                        record={record}
                        collection={currentCollection}
                        isEditing={form.editingRecordId === record.id}
                        formData={form.formData}
                        onFieldChange={form.handleFieldChange}
                        onStartEdit={() => form.startEditing(record.id, record.data)}
                        onSave={() => form.saveRecord(id, currentCollection)}
                        onCancel={form.cancelEditing}
                        onDelete={() => handleDelete(record.id)}
                        disableActions={form.isEditing}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <NoResults />
      )}
    </div>
  );
};

export default CollectionContent;
