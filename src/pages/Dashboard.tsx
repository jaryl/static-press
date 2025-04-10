
import { useEffect, useState } from "react";
import { useCollection } from "@/contexts/CollectionContext";
import { CollectionCard } from "@/components/CollectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/Sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, RefreshCw, Search } from "lucide-react";
import { Card } from "@/components/ui/card";

const Dashboard = () => {
  const { collections, fetchCollections, loading, createCollection } = useCollection();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({
    name: "",
    slug: "",
    description: "",
    fields: []
  });

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCollection({
      ...newCollection,
      fields: []
    });
    setNewCollection({
      name: "",
      slug: "",
      description: "",
      fields: []
    });
    setIsCreateDialogOpen(false);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleNameChange = (value: string) => {
    setNewCollection({
      ...newCollection,
      name: value,
      slug: generateSlug(value)
    });
  };

  const filteredCollections = collections.filter(collection => 
    collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="page-header">
          <h1 className="text-md font-medium">Collections</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search collections..."
                className="pl-7 h-7 w-[200px] bg-secondary border-0 text-xs"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fetchCollections()}
              disabled={loading}
              className="h-7 w-7 p-0 bg-secondary border-0"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
            </Button>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-7 text-xs">
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  New Collection
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-md">Create New Collection</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateCollection} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-xs">Name</Label>
                    <Input 
                      id="name" 
                      value={newCollection.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                      className="saas-input text-xs h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug" className="text-xs">Slug (URL identifier)</Label>
                    <Input 
                      id="slug" 
                      value={newCollection.slug}
                      onChange={(e) => setNewCollection({...newCollection, slug: e.target.value})}
                      required
                      className="saas-input text-xs h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-xs">Description</Label>
                    <Textarea 
                      id="description" 
                      value={newCollection.description}
                      onChange={(e) => setNewCollection({...newCollection, description: e.target.value})}
                      className="saas-input text-xs"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button type="submit" className="text-xs h-7">Create Collection</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="secondary-header">
          <div className="text-xs text-muted-foreground">
            Manage your data collections and schemas
          </div>
        </div>

        <div className="p-6">
          {loading && collections.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
            </div>
          ) : filteredCollections.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCollections.map((collection) => (
                <Card key={collection.id} className="bg-card border-border overflow-hidden shadow-sm">
                  <CollectionCard collection={collection} />
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border p-6 text-center">
              {searchTerm ? (
                <div>
                  <p className="text-sm font-medium">No collections match your search</p>
                  <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium">No collections yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Create your first collection to get started</p>
                  <Button className="mt-4 text-xs h-7" onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Create Collection
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
