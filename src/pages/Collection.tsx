
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCollection } from "@/contexts/CollectionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/Sidebar";
import { RecordItem } from "@/components/RecordItem";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RecordForm } from "@/components/RecordForm";
import { 
  ArrowLeft, 
  Edit, 
  Loader2, 
  Plus, 
  RefreshCw, 
  Search 
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const Collection = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    fetchCollection, 
    fetchRecords, 
    currentCollection, 
    records, 
    loading 
  } = useCollection();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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
    return Object.entries(record.data).some(([fieldName, value]) => {
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(searchLower);
    });
  });

  if (!id || !currentCollection) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          {loading ? (
            <Loader2 className="h-10 w-10 animate-spin text-primary/70" />
          ) : (
            <div className="text-center">
              <p className="text-xl font-medium">Collection not found</p>
              <Link to="/dashboard">
                <Button variant="link" className="mt-2">
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
        <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6">
          <div className="mb-6">
            <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to collections
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{currentCollection.name}</h1>
                <Badge variant="outline" className="text-xs">
                  {records.length} {records.length === 1 ? 'record' : 'records'}
                </Badge>
              </div>
              {currentCollection.description && (
                <p className="text-muted-foreground mt-1 max-w-2xl">{currentCollection.description}</p>
              )}
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              <Link to={`/schema/${id}`}>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Schema
                </Button>
              </Link>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Record
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Record</DialogTitle>
                  </DialogHeader>
                  <RecordForm 
                    collection={currentCollection}
                    onComplete={() => setIsCreateDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Separator className="my-6" />
          
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${currentCollection.name.toLowerCase()}...`}
                className="pl-9 w-full"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>

          {loading && records.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-10 w-10 animate-spin text-primary/70" />
            </div>
          ) : filteredRecords.length > 0 ? (
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <RecordItem 
                  key={record.id} 
                  record={record} 
                  collection={currentCollection} 
                />
              ))}
            </div>
          ) : (
            <div className="bg-muted/30 rounded-lg p-8 text-center">
              {searchTerm ? (
                <div>
                  <p className="text-lg font-medium">No records match your search</p>
                  <p className="text-muted-foreground mt-1">Try a different search term</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium">No records yet</p>
                  <p className="text-muted-foreground mt-1">Create your first record to get started</p>
                  <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Record
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collection;
