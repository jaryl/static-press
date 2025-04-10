import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";

interface SidebarFooterProps {
  isOpen: boolean;
  onLogout: () => void;
}

export function SidebarFooter({ isOpen, onLogout }: SidebarFooterProps) {
  return (
    <div className={`mt-auto p-2 flex ${isOpen ? 'justify-between' : 'justify-center'}`}>
      <Link to="/settings">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Settings size={16} />
        </Button>
      </Link>
      {isOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onLogout}
          className="h-8 w-8 rounded-full text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut size={16} />
        </Button>
      )}
    </div>
  );
}
