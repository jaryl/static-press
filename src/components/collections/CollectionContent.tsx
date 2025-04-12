import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCollection } from "@/contexts/CollectionContext";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import RecordRow from "./RecordRow";
import NewRecordRow from "./NewRecordRow";
import EmptyState from "@/components/common/EmptyState";
import NoResults from "@/components/common/NoResults";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { CollectionRecord, RecordData, FieldDefinition, CollectionSchema } from "@/services/collectionService";

interface CollectionContentProps {
  id: string;
  onCreateRecord: () => void;
  searchTerm?: string;
  filteredRecords?: CollectionRecord[];
  newRecordId?: string | null;
  formData?: RecordData;
  onFieldChange?: (field: FieldDefinition, value: any) => void;
  onSaveRecord?: (id: string, collection: CollectionSchema) => Promise<boolean>;
  onCancelEdit?: () => void;
  editingRecordId?: string | null;
  onStartEdit?: (recordId: string, initialData: RecordData) => void;
  formErrors?: string[];
}

const CollectionContent = ({
  id,
  onCreateRecord,
  searchTerm,
  filteredRecords,
  newRecordId,
  formData = {},
  onFieldChange,
  onSaveRecord,
  onCancelEdit,
  editingRecordId,
  onStartEdit,
  formErrors = []
}: CollectionContentProps) => {
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
  const hasNewRecord = !!newRecordId;
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
          <Spinner />
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
          <Spinner />
        </div>
      ) : !hasAnyRecords ? (
        <EmptyState
          collectionName={currentCollection.name}
          onCreateRecord={onCreateRecord}
        />
      ) : hasFilteredRecords ? (
        <div className="flex-1 max-w-full">
          {/* Error Display */}
          <ErrorDisplay errors={formErrors} />

          {/* Records Table with proper horizontal scroll handling */}
          <div className="mt-4 flow-root w-full">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <Table className="collection-table">
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
                        formData={formData}
                        onFieldChange={onFieldChange || (() => { })}
                        onSave={() => onSaveRecord?.(id, currentCollection)}
                        onCancel={onCancelEdit || (() => { })}
                      />
                    )}

                    {/* Record Rows */}
                    {displayRecords.map((record) => (
                      <RecordRow
                        key={record.id}
                        record={record}
                        collection={currentCollection}
                        isEditing={editingRecordId === record.id}
                        formData={formData}
                        onFieldChange={onFieldChange || (() => { })}
                        onStartEdit={() => onStartEdit?.(record.id, record.data)}
                        onSave={() => onSaveRecord?.(id, currentCollection)}
                        onCancel={onCancelEdit || (() => { })}
                        onDelete={() => handleDelete(record.id)}
                        disableActions={!!newRecordId || !!editingRecordId}
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
