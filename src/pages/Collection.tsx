
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCollection } from "@/contexts/CollectionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  ArrowLeft,
  Edit,
  Plus,
  Search,
  Trash2,
  Save,
  X,
  FileJson,
  Inbox
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RecordData, FieldDefinition } from "@/services/collectionService";

const Collection = () => {
  const { id } = useParams<{ id: string }>();
  const {
    fetchCollection,
    fetchRecords,
    currentCollection,
    records,
    loading,
    deleteRecord,
    createRecord,
    updateRecord,
    validateRecord
  } = useCollection();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [newRecordId, setNewRecordId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<RecordData>({});
  const [formErrors, setFormErrors] = useState<string[]>([]);

  useEffect(() => {
    fetchCollection(id);
    fetchRecords(id);
  }, [id, fetchCollection, fetchRecords]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter records based on search term
  const filteredRecords = records.filter(record => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();

    // Search through all field values
    return Object.entries(record.data).some(([_, value]) => {
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(searchLower);
    });
  });

  const startEditing = (recordId: string, initialData: RecordData = {}) => {
    setEditingRecordId(recordId);
    setEditFormData({...initialData});
    setFormErrors([]);
  };

  const cancelEditing = () => {
    setEditingRecordId(null);
    setNewRecordId(null);
    setFormErrors([]);
  };

  const handleCreateNewRecord = () => {
    if (!currentCollection) return;
    
    const tempId = `new-${Date.now()}`;
    setNewRecordId(tempId);
    
    // Initialize with empty values
    const initialData: RecordData = {};
    currentCollection.fields.forEach(field => {
      if (field.type === 'boolean') {
        initialData[field.name] = false;
      } else {
        initialData[field.name] = '';
      }
    });
    
    setEditFormData(initialData);
  };

  const handleDelete = async (recordId: string) => {
    await deleteRecord(id, recordId);
  };

  const handleFieldChange = (field: FieldDefinition, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [field.name]: value
    }));
    setFormErrors([]);
  };

  const handleSave = async () => {
    if (!currentCollection) return;
    
    const errors = validateRecord(editFormData, currentCollection.fields);
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      if (newRecordId) {
        await createRecord(id, editFormData);
        setNewRecordId(null);
      } else if (editingRecordId) {
        await updateRecord(id, editingRecordId, editFormData);
        setEditingRecordId(null);
      }
    } catch (error) {
      console.error("Error saving record:", error);
    }
  };

  // Format special field types for display
  const formatFieldValue = (fieldName: string, value: any) => {
    if (!currentCollection) return String(value);

    const field = currentCollection.fields.find(f => f.name === fieldName);

    if (!field) return String(value);

    if (value === undefined || value === null) {
      return <span className="text-gray-400">—</span>;
    }

    switch (field.type) {
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'date':
        try {
          return new Date(value).toLocaleDateString();
        } catch (e) {
          return value;
        }
      default:
        return String(value);
    }
  };

  // Render field input based on field type
  const renderFieldInput = (field: FieldDefinition) => {
    const value = editFormData[field.name] !== undefined ? editFormData[field.name] : '';
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <Input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            className="h-8 text-xs py-0 w-full"
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field, e.target.value ? Number(e.target.value) : null)}
            className="h-8 text-xs py-0 w-full"
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            className="h-8 text-xs py-0 w-full"
          />
        );
      case 'boolean':
        return (
          <Checkbox
            checked={!!value}
            onCheckedChange={(checked) => handleFieldChange(field, checked)}
          />
        );
      case 'select':
        return (
          <Select
            value={value ? String(value) : undefined}
            onValueChange={(value) => handleFieldChange(field, value)}
          >
            <SelectTrigger className="h-8 text-xs w-full">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            className="text-xs min-h-0 h-8 py-1.5 resize-none w-full"
          />
        );
    }
  };

  const renderEmptyState = () => {
    return (
      <div className="flex flex-col items-center justify-center bg-muted/20 p-12 m-6 rounded-lg border border-dashed border-muted animate-fade-in">
        <div className="bg-primary/5 p-4 rounded-full mb-5">
          <FileJson className="h-10 w-10 text-primary/60" />
        </div>
        <h3 className="text-lg font-medium mb-2">No records yet</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
          {currentCollection?.name} doesn't have any records yet. Create your first record to start collecting data.
        </p>
        <Button onClick={handleCreateNewRecord} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Create your first record
        </Button>
      </div>
    );
  };

  if (!id || !currentCollection) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          {loading ? (
            <div className="h-8 w-8 animate-spin text-primary/70" />
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

  const hasRecords = records.length > 0 || newRecordId;
  const hasFilteredRecords = filteredRecords.length > 0 || newRecordId;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="page-header">
          <div className="flex items-center gap-4">
            <h1 className="text-base font-medium">{currentCollection.name}</h1>
            <Badge variant="outline" className="text-[10px] h-6">
              {records.length} {records.length === 1 ? 'record' : 'records'}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/schema/${id}`}>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Edit className="mr-1 h-3.5 w-3.5" />
                Schema
              </Button>
            </Link>

            {hasRecords && (
              <Button 
                size="sm" 
                onClick={handleCreateNewRecord} 
                className="h-8 text-xs"
                disabled={!!newRecordId}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                New Record
              </Button>
            )}
          </div>
        </div>

        <div className="secondary-header">
          <div className="text-xs text-muted-foreground">
            {currentCollection.description && currentCollection.description}
          </div>

          {hasRecords && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-9 py-1.5 h-8 bg-background/10 border border-border/50 rounded-lg text-xs"
              />
            </div>
          )}
        </div>

        <div className="p-0">
          {loading && records.length === 0 && !newRecordId ? (
            <div className="flex items-center justify-center h-64">
              <div className="h-8 w-8 animate-spin text-primary/70" />
            </div>
          ) : !hasRecords ? (
            renderEmptyState()
          ) : hasFilteredRecords ? (
            <div>
              {formErrors.length > 0 && (
                <div className="mx-6 my-3 p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                  <p className="font-medium text-xs text-destructive mb-1">Please fix the following errors:</p>
                  <ul className="list-disc pl-5 text-xs text-destructive">
                    {formErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
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
                  {newRecordId && (
                    <TableRow className="bg-primary/5">
                      {currentCollection.fields.map((field) => (
                        <TableCell key={`new-${field.id}`} className="text-xs p-2">
                          {renderFieldInput(field)}
                        </TableCell>
                      ))}
                      <TableCell className="text-right space-x-1 p-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleSave}
                          className="h-6 w-6 p-0 text-primary hover:text-primary"
                        >
                          <Save size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEditing}
                          className="h-6 w-6 p-0 text-muted-foreground"
                        >
                          <X size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id} className={editingRecordId === record.id ? "bg-primary/5" : undefined}>
                      {currentCollection.fields.map((field) => (
                        <TableCell key={`${record.id}-${field.id}`} className="text-xs p-2">
                          {editingRecordId === record.id ? (
                            renderFieldInput(field)
                          ) : (
                            formatFieldValue(field.name, record.data[field.name])
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-right space-x-1 p-2">
                        {editingRecordId === record.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleSave}
                              className="h-6 w-6 p-0 text-primary hover:text-primary"
                            >
                              <Save size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEditing}
                              className="h-6 w-6 p-0 text-muted-foreground"
                            >
                              <X size={14} />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditing(record.id, record.data)}
                              className="h-6 w-6 p-0"
                              disabled={!!editingRecordId || !!newRecordId}
                            >
                              <Edit size={14} />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-6 w-6 p-0 text-destructive"
                                  disabled={!!editingRecordId || !!newRecordId}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-base">Delete Record</AlertDialogTitle>
                                  <AlertDialogDescription className="text-xs">
                                    This action cannot be undone. This will permanently delete this record.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="text-xs h-7">Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(record.id)}
                                    className="bg-destructive hover:bg-destructive/90 text-xs h-7"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="bg-muted/30 p-6 text-center m-6 rounded-md">
              <div>
                <p className="text-sm font-medium">No records match your search</p>
                <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collection;
