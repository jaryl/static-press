import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Eye, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import SchemaMetadataDisplay from './SchemaMetadataDisplay';
import { schemaService } from '@/services/schemaService';

interface SchemaMetadata {
  lastModified: string;
  size: number;
  isPublic: boolean;
}

interface SchemaCardProps {
  useRemoteData: boolean;
  apiBaseUrl: string;
}

const SchemaCard: React.FC<SchemaCardProps> = ({ useRemoteData, apiBaseUrl }) => {
  const [schemaMetadata, setSchemaMetadata] = useState<SchemaMetadata | null>(null);
  const [metadataLoading, setMetadataLoading] = useState<boolean>(useRemoteData);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [viewLoading, setViewLoading] = useState<boolean>(false);
  const [viewError, setViewError] = useState<string | null>(null);
  const [fixLoading, setFixLoading] = useState<boolean>(false);
  const [fixError, setFixError] = useState<string | null>(null);

  const fetchSchemaMetadata = useCallback(async () => {
    if (!useRemoteData || !apiBaseUrl) {
      setMetadataLoading(false);
      return;
    }
    setMetadataLoading(true);
    setMetadataError(null);
    try {
      const data = await schemaService.getSchemaFileMetadata(apiBaseUrl);
      setSchemaMetadata(data);
    } catch (error: any) { // Type 'error' explicitly
      console.error('Failed to fetch schema metadata:', error);
      setMetadataError(error.message || 'Could not fetch schema metadata.');
    } finally {
      setMetadataLoading(false);
    }
  }, [useRemoteData, apiBaseUrl]); // Keep apiBaseUrl dependency

  useEffect(() => {
    fetchSchemaMetadata();
  }, [fetchSchemaMetadata]);

  const handleViewSchema = useCallback(async () => {
    if (!schemaMetadata || !apiBaseUrl) {
      setViewError('Schema metadata or API URL not available.');
      return;
    }
    setViewLoading(true);
    setViewError(null);
    try {
      const data = await schemaService.getSchemaPresignedUrl(apiBaseUrl);
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (error: any) { // Type 'error' explicitly
      console.error('Failed to view schema:', error);
      setViewError(error.message || 'Could not view schema.');
    } finally {
      setViewLoading(false);
    }
  }, [schemaMetadata, apiBaseUrl]);

  const handleFixIssues = useCallback(async () => {
    if (!apiBaseUrl) {
      setFixError('API Base URL is not configured.');
      return;
    }
    setFixLoading(true);
    setFixError(null);
    try {
      await schemaService.makeSchemaPrivate(apiBaseUrl);
      fetchSchemaMetadata();
    } catch (error: any) { // Type 'error' explicitly
      console.error('Failed to make schema private:', error);
      setFixError(error.message || 'Could not make schema private.');
    } finally {
      setFixLoading(false);
    }
  }, [apiBaseUrl, fetchSchemaMetadata]); // Add fetchSchemaMetadata dependency

  return (
    <Card>
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Schema Configuration</CardTitle>
          <CardDescription className="text-xs">
            Metadata about your content schema definition file.
          </CardDescription>
        </div>
        {/* View Schema Button */}
        {!metadataLoading && !metadataError && schemaMetadata && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewSchema}
            disabled={viewLoading || metadataLoading}
          >
            {viewLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            View Schema
          </Button>
        )}
      </CardHeader>
      <CardContent className="px-4 py-3 text-sm">
        {/* Display Metadata */}
        <SchemaMetadataDisplay
          metadata={schemaMetadata}
          isLoading={metadataLoading}
          error={metadataError}
          useRemoteData={useRemoteData}
        />

        {/* Conditional Destructive Alert for Public Schema */}
        {!metadataLoading && !metadataError && schemaMetadata && schemaMetadata.isPublic && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Security Issue</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span>
                Your <code className="font-mono text-xs">schema.json</code> is publicly readable. It's recommended to make it private.
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFixIssues}
                disabled={fixLoading || metadataLoading}
                className="mt-2 sm:mt-0 flex-shrink-0"
              >
                {fixLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-2 h-4 w-4" />
                )}
                Make Private
              </Button>
            </AlertDescription>
            {fixError && (
              <p className="text-xs text-destructive-foreground mt-1 flex items-center">
                <AlertCircle className="mr-1 h-3 w-3" /> Fix Error: {fixError}
              </p>
            )}
          </Alert>
        )}

        {/* Display viewError if View Schema button fails */}
        {viewError && (
          <p className="text-xs text-red-600 mt-1 flex items-center">
            <AlertCircle className="mr-1 h-3 w-3" /> View Error: {viewError}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SchemaCard;
