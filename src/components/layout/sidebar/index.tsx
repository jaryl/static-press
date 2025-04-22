import { useState, useEffect, Suspense } from "react";
import { useCollection } from "@/contexts/CollectionContext";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import SidebarHeader from './SidebarHeader';
import SidebarSearch from './SidebarSearch';
import SidebarNavLinks from './SidebarNavLinks';
import SidebarCollections from './SidebarCollections';
import SidebarFooter from './SidebarFooter';

// Key for storing sidebar state in localStorage
const SIDEBAR_STATE_KEY = 'static-press-sidebar-open';

// Simple placeholder loading component
const CollectionsLoading = ({ isOpen }: { isOpen: boolean }) => (
  <div className={`px-4 mt-5 ${isOpen ? '' : 'flex flex-col items-center'}`}>
    <div className={`h-4 w-20 bg-muted rounded animate-pulse ${isOpen ? 'mb-3' : 'mb-2 h-5 w-5 rounded-full'}`}></div>
    <div className={`h-8 w-full bg-muted rounded animate-pulse ${isOpen ? 'mb-2' : 'h-8 w-8 rounded-full'}`}></div>
    <div className={`h-8 w-full bg-muted rounded animate-pulse ${isOpen ? '' : 'h-8 w-8 rounded-full'}`}></div>
  </div>
);

export function Sidebar() {
  const { collections, createCollection } = useCollection();
  const { logout } = useAuth();
  // Initialize from localStorage, defaulting to true if not found
  const [isOpen, setIsOpen] = useState(() => {
    // Only access localStorage after component mounts (to avoid SSR issues)
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
      return savedState === null ? true : savedState === 'true';
    }
    return true;
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STATE_KEY, String(isOpen));
  }, [isOpen]);

  const handleToggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Filter collections based on search term
  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`flex flex-col bg-sidebar border-r border-border ${isOpen ? 'w-60' : 'w-16'}`}>
      <SidebarHeader isOpen={isOpen} onToggle={handleToggleSidebar} />

      {isOpen && <SidebarSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />}

      <Separator className="bg-border/50" />

      <ScrollArea className="flex-1">
        <div className="py-2 flex flex-col justify-start">
          <SidebarNavLinks isOpen={isOpen} />

          <Suspense fallback={<CollectionsLoading isOpen={isOpen} />}>
            <SidebarCollections
              isOpen={isOpen}
              collections={filteredCollections}
              createCollection={createCollection}
            />
          </Suspense>
        </div>
      </ScrollArea>

      <Separator className="bg-border/50" />

      {isOpen && <SidebarFooter isOpen={isOpen} onLogout={logout} />}
    </div>
  );
}
