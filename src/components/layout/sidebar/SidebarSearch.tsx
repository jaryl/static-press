import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SidebarSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function SidebarSearch({ searchTerm, onSearchChange }: SidebarSearchProps) {
  return (
    <div className="px-3 pb-4">
      <div className="relative flex items-center">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
        <Input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 py-1.5 h-9 bg-background/10 text-sidebar-foreground border border-border/50 rounded-lg text-xs"
        />
      </div>
    </div>
  );
}
