
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCollection } from "@/contexts/CollectionContext";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Database, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  PlusCircle,
  Settings
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Sidebar() {
  const { collections, fetchCollections, createCollection } = useCollection();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({
    name: "",
    slug: "",
    description: "",
    fields: []
  });
  const location = useLocation();

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleNewCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCollection({
      ...newCollection,
      fields: [] // Start with no fields, they'll be added in schema editor
    });
    setNewCollection({
      name: "",
      slug: "",
      description: "",
      fields: []
    });
    setIsNewCollectionOpen(false);
  };

  const handleToggleSidebar = () => {
    setIsOpen(!isOpen);
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

  return (
    <div className={cn(
      "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 shadow-lg",
      isOpen ? "w-64" : "w-16"
    )}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4">
        <div className={cn("flex items-center gap-2", !isOpen && "hidden")}>
          <Database className="h-6 w-6 text-sidebar-primary" />
          <h1 className="font-bold text-lg text-sidebar-primary">DataScribe</h1>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleToggleSidebar}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Menu size={18} />
        </Button>
      </div>
      <Separator className="bg-sidebar-border" />

      {/* Navigation Links */}
      <ScrollArea className="flex-1 pt-4">
        <div className="space-y-1 px-2">
          <Link to="/dashboard">
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
                location.pathname === "/dashboard" && "bg-sidebar-accent",
                !isOpen && "justify-center"
              )}
            >
              <LayoutDashboard size={18} className={cn("mr-2", isOpen ? "mr-2" : "mr-0")} />
              {isOpen && <span>Dashboard</span>}
            </Button>
          </Link>
          
          {isOpen && (
            <div className="mt-6">
              <div className="flex items-center justify-between px-3 mb-2">
                <h3 className="text-sm font-medium text-sidebar-foreground opacity-70">Collections</h3>
                <Dialog open={isNewCollectionOpen} onOpenChange={setIsNewCollectionOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-sidebar-foreground hover:bg-sidebar-accent rounded-full"
                    >
                      <PlusCircle size={14} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Collection</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleNewCollectionSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input 
                          id="name" 
                          value={newCollection.name}
                          onChange={(e) => handleNameChange(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="slug">Slug (URL identifier)</Label>
                        <Input 
                          id="slug" 
                          value={newCollection.slug}
                          onChange={(e) => setNewCollection({...newCollection, slug: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                          id="description" 
                          value={newCollection.description}
                          onChange={(e) => setNewCollection({...newCollection, description: e.target.value})}
                        />
                      </div>
                      <div className="flex justify-end pt-4">
                        <Button type="submit">Create Collection</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-1">
                {collections.map((collection) => (
                  <Link key={collection.id} to={`/collections/${collection.id}`}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-sm font-normal text-sidebar-foreground hover:bg-sidebar-accent",
                        location.pathname === `/collections/${collection.id}` && "bg-sidebar-accent"
                      )}
                    >
                      <Database size={14} className="mr-2" />
                      <span className="truncate">{collection.name}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {!isOpen && (
            <div className="mt-6 flex flex-col items-center">
              <div className="mb-2 text-sidebar-foreground opacity-70">
                <Database size={16} />
              </div>
              {collections.map((collection) => (
                <Link key={collection.id} to={`/collections/${collection.id}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 mb-1 text-sidebar-foreground hover:bg-sidebar-accent rounded-full",
                      location.pathname === `/collections/${collection.id}` && "bg-sidebar-accent"
                    )}
                    title={collection.name}
                  >
                    <span className="truncate">{collection.name.charAt(0).toUpperCase()}</span>
                  </Button>
                </Link>
              ))}
              <Dialog open={isNewCollectionOpen} onOpenChange={setIsNewCollectionOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 mt-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-full"
                  >
                    <PlusCircle size={14} />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Collection</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleNewCollectionSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name" 
                        value={newCollection.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug (URL identifier)</Label>
                      <Input 
                        id="slug" 
                        value={newCollection.slug}
                        onChange={(e) => setNewCollection({...newCollection, slug: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        value={newCollection.description}
                        onChange={(e) => setNewCollection({...newCollection, description: e.target.value})}
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button type="submit">Create Collection</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* User Section */}
      <div className="mt-auto p-4 border-t border-sidebar-border">
        {isOpen ? (
          <div>
            <div className="flex items-center mb-4">
              <Card className="w-8 h-8 flex items-center justify-center rounded-full bg-sidebar-accent-foreground text-sidebar-primary font-medium">
                {user?.name?.charAt(0) || 'A'}
              </Card>
              <div className="ml-3">
                <p className="text-sm font-medium text-sidebar-foreground">{user?.name || 'Admin'}</p>
                <p className="text-xs text-sidebar-foreground opacity-70">{user?.role || 'Administrator'}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link to="/settings" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <Settings size={14} className="mr-1" />
                  Settings
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => logout()} 
                className="flex-1"
              >
                <LogOut size={14} className="mr-1" />
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Card className="w-8 h-8 flex items-center justify-center rounded-full bg-sidebar-accent-foreground text-sidebar-primary font-medium">
              {user?.name?.charAt(0) || 'A'}
            </Card>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => logout()}
              className="h-8 w-8"
            >
              <LogOut size={14} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
