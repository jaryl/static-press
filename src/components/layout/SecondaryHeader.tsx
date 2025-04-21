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
  // Check if the header is effectively empty
  const hasSearchBar = onSearch && hasRecords;
  const isEmpty = !description && !children && !hasSearchBar;

  // If the header is empty, don't render it
  if (isEmpty) return null;

  return (
    <header className={`sticky top-[42px] sm:top-14 px-3 sm:px-6 py-2 sm:py-3 sm:min-h-11 border-b border-border bg-background flex-none z-40 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        {description && (
          <div className="text-xs text-muted-foreground leading-tight">
            {description}
          </div>
        )}

        {children && (
          <div className="text-xs text-muted-foreground leading-tight">
            {children}
          </div>
        )}

        {hasSearchBar && (
          <div className="relative sm:ml-auto sm:self-center">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              className="w-full sm:w-[220px] pl-8 sm:pl-9 py-1 sm:py-1 h-8 sm:h-9 bg-background/10 text-xs border border-border/50 rounded-md sm:rounded-lg"
              value={searchTerm}
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        )}
      </div>
    </header>
  );
};
