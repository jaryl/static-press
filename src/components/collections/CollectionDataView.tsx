import { useEffect, useState } from "react";
import { useCollection } from "@/contexts/CollectionContext";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Import collection components
import RecordRow from "@/components/collections/RecordRow";
import NewRecordRow from "@/components/collections/NewRecordRow";
import EmptyState from "@/components/collections/EmptyState";
import NoResults from "@/components/collections/NoResults";

// Import UI components
import { Loader } from "@/components/ui/loader";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

// Import custom hooks
import { useRecordForm } from "@/hooks/useRecordForm";
import { useRecordFilter } from "@/hooks/useRecordFilter";

interface CollectionDataViewProps {
  id: string;
}

const CollectionDataView = ({ id }: CollectionDataViewProps) => {
  const {
    fetchRecords,
    currentCollection,
    records,
    deleteRecord,
    createRecord,
    updateRecord,
    validateRecord
  } = useCollection();
  const [isLoading, setIsLoading] = useState(true);

  // Use custom hooks for form and filtering
  const form = useRecordForm({ validateRecord, createRecord, updateRecord });
  const filter = useRecordFilter(records);

  // Load collection data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchRecords(id);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Handle record deletion
  const handleDelete = async (recordId: string) => {
    await deleteRecord(id, recordId);
  };

  // Derived state
  const hasNewRecord = !!form.newRecordId;
  const hasAnyRecords = filter.hasRecords(hasNewRecord ? 1 : 0);
  const hasFilteredRecords = filter.hasFilteredRecords(hasNewRecord ? 1 : 0);

  if (!currentCollection) {
    return null; // Collection should be loaded by parent component
  }

  return (
    <>
      {isLoading ? (
        <div className="flex flex-col flex-1 items-center justify-center">
          <Loader />
        </div>
      ) : !hasAnyRecords ? (
        <EmptyState
          collectionName={currentCollection.name}
          onCreateRecord={() => form.createNewRecord(currentCollection)}
        />
      ) : hasFilteredRecords ? (
        <div className="flex-1">
          {/* Error Display */}
          <ErrorDisplay errors={form.errors} />

          {/* Records Table */}
          <Table>
            <TableHeader>
              <TableRow>
                {currentCollection.fields.map((field) => (
                  <TableHead key={field.id} className="text-xs">
                    {field.name}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </TableHead>
                ))}
                <TableHead className="text-xs text-right w-[100px]">Actions</TableHead>
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
              {filter.filteredRecords.map((record) => (
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
      ) : (
        <NoResults />
      )}
    </>
  );
};

export default CollectionDataView;
