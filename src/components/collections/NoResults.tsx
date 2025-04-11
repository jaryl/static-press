import { memo } from "react";

interface NoResultsProps {
  message?: string;
  helpText?: string;
}

/**
 * Component to display when search returns no matching records
 */
const NoResults = memo(({
  message = "No records match your search",
  helpText = "Try a different search term"
}: NoResultsProps) => {
  return (
    <div className="bg-muted/30 p-6 text-center m-6 rounded-md flex flex-1 items-center justify-center">
      <div>
        <p className="text-lg font-medium">{message}</p>
        <p className="text-sm text-muted-foreground mt-1">{helpText}</p>
      </div>
    </div>
  );
});

export default NoResults;
