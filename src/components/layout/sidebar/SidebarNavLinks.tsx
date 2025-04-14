import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutDashboard } from "lucide-react";

interface NavLink {
  path: string;
  icon: React.ReactNode;
  label: string;
}

interface SidebarNavLinksProps {
  isOpen: boolean;
}

export default function SidebarNavLinks({ isOpen }: SidebarNavLinksProps) {
  const location = useLocation();

  const sidebarLinks: NavLink[] = [
    {
      path: "/dashboard",
      icon: <LayoutDashboard size={16} />,
      label: "Dashboard"
    }
  ];

  // Expanded view of navigation links
  if (isOpen) {
    return (
      <div className="flex flex-col space-y-2 px-2">
        {sidebarLinks.map((link) => (
          <Link key={link.path} to={link.path}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent h-8 px-3 py-5",
                location.pathname === link.path && "bg-sidebar-accent text-sidebar-primary"
              )}
            >
              <span className={cn(
                "mr-2",
                location.pathname === link.path && "text-sidebar-primary"
              )}>
                {link.icon}
              </span>
              <span className="flex-1 text-left text-sm">{link.label}</span>
            </Button>
          </Link>
        ))}
      </div>
    );
  }

  // Collapsed view of navigation links
  return (
    <div className="flex flex-col items-center space-y-2">
      {sidebarLinks.map((link) => (
        <Link key={link.path} to={link.path}>
          <Button
            variant="ghost"
            className={cn(
              "h-8 w-8 flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent",
              location.pathname === link.path && "bg-sidebar-accent text-sidebar-primary"
            )}
            title={link.label}
          >
            {link.icon}
          </Button>
        </Link>
      ))}
    </div>
  );
}
