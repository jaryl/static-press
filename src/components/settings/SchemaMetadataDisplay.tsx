import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SchemaMetadata {
  lastModified: string;
  isPublic: boolean;
}

interface SchemaMetadataDisplayProps {
  metadata: SchemaMetadata | null;
  isLoading: boolean;
  error: string | null;
  useRemoteData: boolean;
}

const SchemaMetadataDisplay: React.FC<SchemaMetadataDisplayProps> = ({ metadata, isLoading, error, useRemoteData }) => {

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <>
      {isLoading && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Loading schema metadata...</span>
          </div>
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      )}
      {error && !isLoading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Metadata</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!isLoading && !error && metadata && (
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <dt className="text-xs font-medium text-muted-foreground">Last Modified</dt>
            <dd className="text-xs text-foreground">{formatDateTime(metadata.lastModified)}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-medium text-muted-foreground">Public Access</dt>
            <dd className={`text-xs font-semibold ${metadata.isPublic ? 'text-destructive' : 'text-success'}`}>
              {metadata.isPublic ? 'Publicly Readable' : 'Private'}
            </dd>
          </div>

          {metadata.isPublic && (
            <Alert variant="default" className="mt-4">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-700">Warning</AlertTitle>
              <AlertDescription>
                Your <code className="font-mono text-sm">schema.json</code> file is publicly readable. This might expose your content structure. It's recommended to keep it private.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
      {!isLoading && !error && !metadata && useRemoteData && (
        <p className="text-sm text-muted-foreground italic pt-4">Schema metadata not available.</p>
      )}
      {!useRemoteData && (
        <p className="text-sm text-muted-foreground italic pt-4">Schema information is only available when VITE_USE_REMOTE_DATA is true.</p>
      )}
    </>
  );
};

export default SchemaMetadataDisplay;
