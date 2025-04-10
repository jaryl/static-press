
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
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Collections</h1>
              <p className="text-muted-foreground mt-1">
                Manage your data collections and schemas
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search collections..."
                  className="pl-9 w-full sm:w-[250px] bg-secondary border-0"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="saas-button-primary">
                    <Plus className="mr-2 h-4 w-4" />
                    New Collection
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle>Create New Collection</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateCollection} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name" 
                        value={newCollection.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        required
                        className="saas-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug (URL identifier)</Label>
                      <Input 
                        id="slug" 
                        value={newCollection.slug}
                        onChange={(e) => setNewCollection({...newCollection, slug: e.target.value})}
                        required
                        className="saas-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        value={newCollection.description}
                        onChange={(e) => setNewCollection({...newCollection, description: e.target.value})}
                        className="saas-input"
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button type="submit" className="saas-button-primary">Create Collection</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Button 
                variant="outline" 
                onClick={() => fetchCollections()}
                disabled={loading}
                className="bg-secondary border-0 hover:bg-secondary/80"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {loading && collections.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-10 w-10 animate-spin text-primary/70" />
            </div>
          ) : filteredCollections.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCollections.map((collection) => (
                <Card key={collection.id} className="bg-card border-border overflow-hidden shadow-md">
                  <CollectionCard collection={collection} />
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border p-8 text-center">
              {searchTerm ? (
                <div>
                  <p className="text-lg font-medium">No collections match your search</p>
                  <p className="text-muted-foreground mt-1">Try a different search term</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium">No collections yet</p>
                  <p className="text-muted-foreground mt-1">Create your first collection to get started</p>
                  <Button className="saas-button-primary mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
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
