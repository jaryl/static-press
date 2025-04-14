import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface PrimaryHeaderProps {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-1 sm:gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-sm sm:text-base font-medium">
            {title}
            {subtitle && (
              <span className="text-xs sm:text-sm text-muted-foreground ml-2">
                {subtitle}
              </span>
            )}
          </h1>
        </div>

        <div className="flex items-center gap-2 mt-1 sm:mt-0">
          {backLink && (
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground" asChild>
              <Link to={backLink}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Link>
            </Button>
          )}
          {children}
        </div>
      </div>
    </header>
  );
};
