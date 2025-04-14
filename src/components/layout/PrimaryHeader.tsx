import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export interface PrimaryHeaderProps {
  title: string;
  subtitle?: string | React.ReactNode;
  backLink?: string;
  children?: React.ReactNode;
  className?: string;
}

export const PrimaryHeader = ({
  title,
  subtitle,
  backLink,
  children,
  className
}: PrimaryHeaderProps) => {
  return (
    <header className={`sticky top-0 px-3 sm:px-6 py-2 sm:py-3 border-b border-border bg-background z-50 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
        <div className="flex items-center justify-between grow">
          <h1 className="text-sm sm:text-base font-medium">
            {title}
            {subtitle && (
              <span className="text-xs sm:text-sm text-muted-foreground ml-2">
                {subtitle}
              </span>
            )}
          </h1>

          {backLink && (
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground ml-2" asChild>
              <Link to={backLink}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Link>
            </Button>
          )}
        </div>

        {children && (
          <div className="flex items-center gap-2 justify-start sm:justify-end flex-wrap mt-2 sm:mt-0">
            {children}
          </div>
        )}
      </div>
    </header>
  );
};
