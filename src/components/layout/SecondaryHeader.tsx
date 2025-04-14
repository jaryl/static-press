import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SecondaryHeaderProps {
  children?: React.ReactNode;
  className?: string;
  description?: string;
  hasRecords?: boolean;
  searchTerm?: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
}

export const SecondaryHeader = ({
  children,
  className = "",
  description,
  hasRecords,
  searchTerm,
  searchPlaceholder = "Search records...",
  onSearch
}: SecondaryHeaderProps) => {
  return (
    <header className={`sticky top-14 px-6 py-3 min-h-14 border-b border-border flex items-center justify-between bg-background z-40 ${className}`}>
      {description && (
        <div className="text-xs text-muted-foreground">
          {description}
        </div>
      )}

      {children && (
        <div className="text-xs text-muted-foreground">
          {children}
        </div>
      )}

      {onSearch && hasRecords && (
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="w-[200px] pl-8 py-0 h-7 bg-background/10 text-xs border border-border/50 rounded-lg"
            value={searchTerm}
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      )}
    </header>
  );
};
