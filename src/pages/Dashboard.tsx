
import { useEffect, useState } from "react";
import { useCollection } from "@/contexts/CollectionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/layout/Sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Search, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";

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
          <h1 className="text-base font-medium">Collections</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="w-[280px] pl-9 py-0 h-8 bg-background/10 text-sidebar-foreground border border-border/50 rounded-lg text-xs"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 text-sm">
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  New Collection
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-base">Create New Collection</DialogTitle>
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
                      onChange={(e) => setNewCollection({ ...newCollection, slug: e.target.value })}
                      required
                      className="saas-input text-xs h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-xs">Description</Label>
                    <Textarea
                      id="description"
                      value={newCollection.description}
                      onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
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
            <Card className="bg-card border-border overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium">Name</TableHead>
                    <TableHead className="text-xs font-medium">Slug</TableHead>
                    <TableHead className="text-xs font-medium">Description</TableHead>
                    <TableHead className="text-xs font-medium">Fields</TableHead>
                    <TableHead className="text-xs font-medium w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCollections.map((collection) => (
                    <TableRow key={collection.id} className="hover:bg-muted/30">
                      <TableCell className="text-xs font-medium">{collection.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{collection.slug}</TableCell>
                      <TableCell className="text-xs max-w-[300px] truncate">
                        {collection.description || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {collection.fields?.length || 0} fields
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0" 
                          asChild
                        >
                          <a href={`/collections/${collection.id}`}>
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span className="sr-only">View collection</span>
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
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
