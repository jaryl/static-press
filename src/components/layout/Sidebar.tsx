import { useState, useEffect } from "react";
import { useCollection } from "@/contexts/CollectionContext";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarSearch } from "./SidebarSearch";
import { SidebarNavLinks } from "./SidebarNavLinks";
import { SidebarCollections } from "./SidebarCollections";
import { SidebarFooter } from "./SidebarFooter";
import { CollectionSchema } from "@/services/collectionService";

export function Sidebar() {
  const { collections, fetchCollections, createCollection } = useCollection();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleToggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Filter collections based on search term
  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`h-screen flex flex-col bg-sidebar border-r border-border ${isOpen ? 'w-60' : 'w-16'}`}>
      <SidebarHeader isOpen={isOpen} onToggle={handleToggleSidebar} />

      {isOpen && <SidebarSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />}

      <Separator className="bg-border/50" />

      <ScrollArea className="flex-1">
        <div className="py-2 flex flex-col justify-between">
          <SidebarNavLinks isOpen={isOpen} />

          <SidebarCollections
            isOpen={isOpen}
            collections={filteredCollections}
            createCollection={createCollection}
          />
        </div>
      </ScrollArea>

      <Separator className="bg-border/50" />

      <SidebarFooter isOpen={isOpen} onLogout={logout} />
    </div>
  );
}
