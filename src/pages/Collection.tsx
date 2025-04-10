
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCollection } from "@/contexts/CollectionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/Sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RecordForm } from "@/components/RecordForm";
import { 
  ArrowLeft, 
  Edit, 
  Loader2, 
  Plus, 
  RefreshCw, 
  Search,
  Trash2 
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

const Collection = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    fetchCollection, 
    fetchRecords, 
    currentCollection, 
    records, 
    loading,
    deleteRecord
  } = useCollection();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<{ id: string, data: Record<string, any> } | null>(null);

  useEffect(() => {
    if (id) {
      fetchCollection(id);
      fetchRecords(id);
    }
  }, [id, fetchCollection, fetchRecords]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRefresh = () => {
    if (id) {
      fetchRecords(id);
    }
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

  const handleEdit = (record: { id: string, data: Record<string, any> }) => {
    setEditingRecord(record);
  };

  const handleDelete = async (recordId: string) => {
    if (id) {
      await deleteRecord(id, recordId);
    }
  };

  // Format special field types
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

  if (!id || !currentCollection) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="page-header">
          <div className="flex items-center gap-4">
            <h1 className="text-md font-medium">{currentCollection.name}</h1>
            <Badge variant="outline" className="text-xs h-5">
              {records.length} {records.length === 1 ? 'record' : 'records'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Link to={`/schema/${id}`}>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <Edit className="mr-1 h-3.5 w-3.5" />
                Schema
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="h-7 w-7 p-0"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
            </Button>
            
            <Button size="sm" onClick={() => setIsCreateDialogOpen(true)} className="h-7 text-xs">
              <Plus className="mr-1 h-3.5 w-3.5" />
              New Record
            </Button>
          </div>
        </div>
        
        <div className="secondary-header">
          <div className="text-xs text-muted-foreground">
            {currentCollection.description && currentCollection.description}
          </div>
          
          <div className="relative">
            <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder={`Search ${currentCollection.name.toLowerCase()}...`}
              className="pl-7 h-7 w-[200px] bg-secondary border-0 text-xs"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="p-0">
          {loading && records.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
            </div>
          ) : filteredRecords.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  {currentCollection.fields.map((field) => (
                    <TableHead key={field.id} className="text-xs">
                      {field.name}
                    </TableHead>
                  ))}
                  <TableHead className="text-xs text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    {currentCollection.fields.map((field) => (
                      <TableCell key={`${record.id}-${field.id}`} className="text-xs">
                        {formatFieldValue(field.name, record.data[field.name])}
                      </TableCell>
                    ))}
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(record)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit size={14} />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive">
                            <Trash2 size={14} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-md">Delete Record</AlertDialogTitle>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="bg-muted/30 p-6 text-center m-6 rounded-md">
              {searchTerm ? (
                <div>
                  <p className="text-sm font-medium">No records match your search</p>
                  <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium">No records yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Create your first record to get started</p>
                  <Button className="mt-4 text-xs h-7" onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Create Record
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-md">Create New Record</DialogTitle>
          </DialogHeader>
          <RecordForm 
            collection={currentCollection}
            onComplete={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-md">Edit Record</DialogTitle>
          </DialogHeader>
          {editingRecord && (
            <RecordForm 
              collection={currentCollection} 
              initialData={editingRecord.data} 
              recordId={editingRecord.id} 
              onComplete={() => setEditingRecord(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Collection;
