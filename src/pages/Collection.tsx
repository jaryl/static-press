import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCollection } from "@/contexts/CollectionContext";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/Sidebar";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Import custom hooks
import { useRecordForm } from "@/hooks/useRecordForm";
import { useRecordFilter } from "@/hooks/useRecordFilter";

// Import collection components
import RecordRow from "@/components/collections/RecordRow";
import NewRecordRow from "@/components/collections/NewRecordRow";
import EmptyState from "@/components/collections/EmptyState";
import CollectionHeader from "@/components/collections/CollectionHeader";
import CollectionSecondaryHeader from "@/components/collections/CollectionSecondaryHeader";
import NoResults from "@/components/collections/NoResults";

// Import UI components
import Loader from "@/components/ui/Loader";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

const Collection = () => {
  const { id } = useParams<{ id: string }>();
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

  // Use custom hooks for form and filtering
  const form = useRecordForm({ validateRecord, createRecord, updateRecord });
  const filter = useRecordFilter(records);

  // Load collection data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchCollection(id);
        await fetchRecords(id);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  // Handle record deletion
  const handleDelete = async (recordId: string) => {
    await deleteRecord(id!, recordId);
  };

  // If collection is not found
  if (!id || !currentCollection) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
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
      </div>
    );
  }

  // Derived state
  const hasNewRecord = !!form.newRecordId;
  const hasAnyRecords = filter.hasRecords(hasNewRecord ? 1 : 0);
  const hasFilteredRecords = filter.hasFilteredRecords(hasNewRecord ? 1 : 0);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {/* Collection Header */}
        <CollectionHeader
          id={id}
          name={currentCollection.name}
          recordCount={records.length}
          hasRecords={hasAnyRecords}
          isCreating={hasNewRecord}
          onCreateRecord={() => form.createNewRecord(currentCollection)}
        />

        {/* Secondary Header with Search */}
        <CollectionSecondaryHeader
          description={currentCollection.description}
          hasRecords={hasAnyRecords}
          searchTerm={filter.searchTerm}
          onSearch={filter.handleSearch}
        />

        {/* Main Content Area */}
        <div className="p-0">
          {isLoading ? (
            <Loader />
          ) : !hasAnyRecords ? (
            <EmptyState
              collectionName={currentCollection.name}
              onCreateRecord={() => form.createNewRecord(currentCollection)}
            />
          ) : hasFilteredRecords ? (
            <div>
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
        </div>
      </div>
    </div>
  );
};

export default Collection;
