import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCollection } from "@/contexts/CollectionContext";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import RecordRow from "./RecordRow";
import NewRecordRow from "./NewRecordRow";
import EmptyState from "@/components/layout/EmptyState";
import NoResults from "@/components/layout/NoResults";
import ErrorDisplay from "@/components/layout/ErrorDisplay";
import { CollectionRecord, RecordData } from "@/services/shared/types/collection";
import { FieldDefinition, CollectionSchema } from "@/services/shared/types/schema";

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
    validateRecord,
    loading,
    error,
  } = useCollection();

  useEffect(() => {
    fetchCollection(id);
    fetchRecords(id);
  }, [id, fetchCollection, fetchRecords]);

  const handleDelete = async (recordId: string) => {
    await deleteRecord(id, recordId);
  };

  const hasNewRecord = !!newRecordId;
  const displayRecords = filteredRecords || records;
  const hasAnyRecords = records.length > 0 || hasNewRecord;
  const hasFilteredRecords = displayRecords.length > 0 || hasNewRecord;
  const isFiltering = searchTerm && searchTerm.trim() !== '';

  if (error) {
    throw new Error(error);
  }

  if (loading && !currentCollection) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!loading && !currentCollection) {
    return (
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
    );
  }

  if (!currentCollection) {
    console.error("CollectionContent: Reached rendering stage but currentCollection is null.");
    return <ErrorDisplay errors={["Failed to load collection details."]} />;
  }

  return (
    <div className="p-0 flex flex-1">
      {loading && currentCollection ? (
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
          <ErrorDisplay errors={formErrors} />

          <div className="mt-4 flow-root w-full">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <Table className="collection-table">
                  <TableHeader>
                    <TableRow>
                      {currentCollection.fields.map((field, index) => (
                        <TableHead key={`header-${field.id}-${index}`} className="text-xs">
                          {field.name}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </TableHead>
                      ))}
                      <TableHead className="text-xs text-right w-[100px] sticky right-0 z-10 bg-background group-hover:bg-muted">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hasNewRecord && (
                      <NewRecordRow
                        collection={currentCollection}
                        formData={formData}
                        onFieldChange={onFieldChange || (() => { })}
                        onSave={() => onSaveRecord?.(id, currentCollection)}
                        onCancel={onCancelEdit || (() => { })}
                      />
                    )}

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
