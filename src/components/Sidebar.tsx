
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
  Settings,
  Search,
  Inbox
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

  const sidebarLinks = [
    { 
      path: "/dashboard", 
      icon: <LayoutDashboard size={18} />, 
      label: "Dashboard",
      count: null 
    },
    { 
      path: "#", 
      icon: <Inbox size={18} />, 
      label: "Inbox",
      count: 2 
    }
  ];

  return (
    <div className={cn(
      "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
      isOpen ? "w-64" : "w-16"
    )}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4">
        <div className={cn("flex items-center gap-2", !isOpen && "hidden")}>
          <Database className="h-6 w-6 text-sidebar-primary" />
          <h1 className="font-bold text-lg text-sidebar-foreground">DataScribe</h1>
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
      
      {/* Search Bar */}
      {isOpen && (
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9 w-full bg-sidebar-accent text-sidebar-foreground border-none text-sm h-9"
            />
          </div>
        </div>
      )}

      <Separator className="bg-sidebar-border my-2" />

      {/* Navigation Links */}
      <ScrollArea className="flex-1 pt-2">
        <div className="space-y-1 px-3">
          {sidebarLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent group",
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
                  <span className="flex-1 text-left">{link.label}</span>
                )}
                {isOpen && link.count && (
                  <span className="px-2 py-0.5 text-xs bg-sidebar-primary text-white rounded-full">
                    {link.count}
                  </span>
                )}
              </Button>
            </Link>
          ))}
          
          {isOpen && (
            <div className="mt-8">
              <div className="flex items-center justify-between px-3 mb-2">
                <h3 className="text-sm font-medium text-sidebar-foreground/70">Collections</h3>
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
                  <DialogContent className="bg-card border-border">
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
              </div>
              
              <div className="space-y-1">
                {collections.map((collection) => (
                  <Link key={collection.id} to={`/collections/${collection.id}`}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-sm font-normal text-sidebar-foreground hover:bg-sidebar-accent group",
                        location.pathname === `/collections/${collection.id}` && "bg-sidebar-accent text-sidebar-primary"
                      )}
                    >
                      <Database size={14} className={cn(
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
                <Database size={16} />
              </div>
              {collections.map((collection) => (
                <Link key={collection.id} to={`/collections/${collection.id}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 mb-1 text-sidebar-foreground hover:bg-sidebar-accent rounded-full",
                      location.pathname === `/collections/${collection.id}` && "bg-sidebar-accent text-sidebar-primary"
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
                <DialogContent className="bg-card border-border">
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
            </div>
          )}
        </div>
      </ScrollArea>

      {/* User Section */}
      <div className="mt-auto p-4 border-t border-sidebar-border">
        {isOpen ? (
          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-sidebar-foreground">{user?.name || 'Admin'}</p>
                <p className="text-xs text-sidebar-foreground/70">{user?.role || 'Administrator'}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link to="/settings" className="flex-1">
                <Button variant="outline" size="sm" className="w-full bg-sidebar-accent text-sidebar-foreground border-sidebar-border hover:bg-sidebar-border">
                  <Settings size={14} className="mr-1" />
                  Settings
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => logout()} 
                className="flex-1 bg-sidebar-accent text-sidebar-foreground border-sidebar-border hover:bg-sidebar-border"
              >
                <LogOut size={14} className="mr-1" />
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => logout()}
              className="h-8 w-8 bg-sidebar-accent text-sidebar-foreground border-sidebar-border hover:bg-sidebar-border"
            >
              <LogOut size={14} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
