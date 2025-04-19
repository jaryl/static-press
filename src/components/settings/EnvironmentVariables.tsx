import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface EnvVarInfo {
  value: string | undefined;
  description: string;
}

interface EnvironmentVariablesProps { }

const EnvironmentVariables: React.FC<EnvironmentVariablesProps> = () => {
  const clientEnvVars: { [key: string]: EnvVarInfo } = {
    VITE_API_BASE_URL: {
      value: import.meta.env.VITE_API_BASE_URL,
      description: "The base URL for the backend API functions."
    },
    VITE_S3_ENDPOINT_URL: {
      value: import.meta.env.VITE_S3_ENDPOINT_URL,
      description: "The S3-compatible storage endpoint URL (used for direct uploads/display if applicable)."
    },
    VITE_S3_BUCKET_NAME: {
      value: import.meta.env.VITE_S3_BUCKET_NAME,
      description: "The name of the S3 bucket used for storage."
    },
    VITE_DEV_SERVER_URL: {
      value: import.meta.env.VITE_DEV_SERVER_URL,
      description: "The URL of the local development API server (used only in development)."
    }
  };

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base">Environment Configuration</CardTitle>
        <CardDescription className="text-xs">Client-side environment variables (from `.env`).</CardDescription>
      </CardHeader>
      <CardContent className="px-4 py-3 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(clientEnvVars).map(([key, { value, description }]) => (
            <div key={key} className="space-y-1">
              <dt className="text-xs font-medium text-foreground">{key}</dt>
              <dd className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded break-words">
                {value || <span className="italic">Not Set</span>}
              </dd>
              <p className="text-xs text-muted-foreground pt-0.5">{description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnvironmentVariables;
