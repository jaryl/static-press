import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ExternalLink, AlertCircle } from 'lucide-react';

interface SchemaActionsProps {
  onViewSchema: () => void;
  viewLoading: boolean;
  viewError: string | null;
  metadataLoading: boolean;
}

const SchemaActions: React.FC<SchemaActionsProps> = ({
  onViewSchema,
  viewLoading,
  viewError,
  metadataLoading
}) => {
  const buttonsDisabled = viewLoading || metadataLoading;

  return (
    <div className="pt-4 space-y-2">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onViewSchema}
          disabled={buttonsDisabled}
        >
          {viewLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ExternalLink className="mr-2 h-4 w-4" />
          )}
          View Schema
        </Button>
      </div>

      {/* Action Errors */}
      {viewError && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>View Schema Error</AlertTitle>
          <AlertDescription>{viewError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SchemaActions;
