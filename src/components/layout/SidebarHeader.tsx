import { Database, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function SidebarHeader({ isOpen, onToggle }: SidebarHeaderProps) {
  // Expanded view
  if (isOpen) {
    return (
      <div className="flex items-center justify-between p-3 h-14">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-sidebar-primary" />
          <h1 className="font-medium text-base text-sidebar-foreground">StaticPress</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent rounded-full"
        >
          <Menu size={16} />
        </Button>
      </div>
    );
  }

  // Collapsed view
  return (
    <div className="flex flex-col items-center p-3 h-14">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="h-8 w-8 flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent rounded-full"
      >
        <Menu size={16} />
      </Button>
    </div>
  );
}
