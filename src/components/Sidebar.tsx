import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCollection } from "@/contexts/CollectionContext";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Database, 
  LayoutDashboard, 
  Menu, 
  PlusCircle,
  Settings,
  LogOut,
  Search,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Sidebar() {
  const { collections, fetchCollections, createCollection } = useCollection();
  const { logout } = useAuth();
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

  const sidebarLinks = [
    { 
      path: "/dashboard", 
      icon: <LayoutDashboard size={16} />, 
      label: "Dashboard"
    }
  ];

  return (
    <div className={cn(
      "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
      isOpen ? "w-56" : "w-14"
    )}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-3 h-header">
        <div className={cn("flex items-center gap-2", !isOpen && "hidden")}>
          <Database className="h-5 w-5 text-sidebar-primary" />
          <h1 className="font-medium text-base text-sidebar-foreground">DataScribe</h1>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleToggleSidebar}
          className="h-7 w-7 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Menu size={16} />
        </Button>
      </div>
      
      {/* Search Bar */}
      {isOpen && (
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8 w-full bg-sidebar-accent text-sidebar-foreground border-none text-xs h-8"
            />
          </div>
        </div>
      )}

      <Separator className="bg-sidebar-border my-2" />

      {/* Navigation Links */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 px-2">
          {sidebarLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent group h-8",
                  location.pathname === link.path && "bg-sidebar-accent text-sidebar-primary",
                  !isOpen && "justify-center px-0"
                )}
              >
                <span className={cn(
                  "mr-2 text-muted-foreground group-hover:text-sidebar-foreground",
                  location.pathname === link.path && "text-sidebar-primary"
                )}>
                  {link.icon}
                </span>
                {isOpen && (
                  <span className="flex-1 text-left text-xs">{link.label}</span>
                )}
              </Button>
            </Link>
          ))}
          
          {isOpen && (
            <div className="mt-6">
              <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-xs font-medium text-sidebar-foreground/70">Collections</h3>
                <Dialog open={isNewCollectionOpen} onOpenChange={setIsNewCollectionOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-sidebar-foreground hover:bg-sidebar-accent rounded-full"
                    >
                      <PlusCircle size={12} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle className="text-md">New Collection</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleNewCollectionSubmit} className="space-y-4">
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
                        <Button type="submit" className="saas-button-primary text-xs h-8">Create</Button>
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
                        "w-full justify-start text-xs font-normal text-sidebar-foreground hover:bg-sidebar-accent group h-7",
                        location.pathname === `/collections/${collection.id}` && "bg-sidebar-accent text-sidebar-primary"
                      )}
                    >
                      <Database size={12} className={cn(
                        "mr-2 text-muted-foreground group-hover:text-sidebar-foreground",
                        location.pathname === `/collections/${collection.id}` && "text-sidebar-primary"
                      )} />
                      <span className="truncate">{collection.name}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {!isOpen && (
            <div className="mt-6 flex flex-col items-center">
              <div className="mb-2 text-sidebar-foreground/70">
                <Database size={14} />
              </div>
              {collections.map((collection) => (
                <Link key={collection.id} to={`/collections/${collection.id}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-7 w-7 mb-1 text-sidebar-foreground hover:bg-sidebar-accent rounded-full",
                      location.pathname === `/collections/${collection.id}` && "bg-sidebar-accent text-sidebar-primary"
                    )}
                    title={collection.name}
                  >
                    <span className="truncate text-xs">{collection.name.charAt(0).toUpperCase()}</span>
                  </Button>
                </Link>
              ))}
              <Dialog open={isNewCollectionOpen} onOpenChange={setIsNewCollectionOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 mt-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-full"
                  >
                    <PlusCircle size={12} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-md">New Collection</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleNewCollectionSubmit} className="space-y-4">
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
                      <Button type="submit" className="saas-button-primary text-xs h-8">Create</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Icons-only Footer */}
      <div className="mt-auto p-2 border-t border-sidebar-border flex items-center justify-center gap-2">
        <Link to="/settings">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-sidebar-foreground hover:bg-sidebar-accent"
            title="Settings"
          >
            <Settings size={16} />
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => logout()}
          className="h-8 w-8 rounded-full text-sidebar-foreground hover:bg-sidebar-accent"
          title="Logout"
        >
          <LogOut size={16} />
        </Button>
      </div>
    </div>
  );
}
