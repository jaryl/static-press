import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

const AboutCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">About</CardTitle>
        <CardDescription className="text-xs">
          A simple serverless CMS that deploys as a static site - no traditional backend required
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2">
          <div className="space-y-0.5">
            <dt className="text-xs font-medium text-muted-foreground">Application</dt>
            <dd className="text-xs text-foreground">
              {import.meta.env.VITE_APP_REPOSITORY_URL ? (
                <a
                  href={import.meta.env.VITE_APP_REPOSITORY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  static-press <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                'static-press'
              )}
            </dd>
          </div>
          <div className="space-y-0.5">
            <dt className="text-xs font-medium text-muted-foreground">Version</dt>
            <dd className="text-xs text-foreground">
              {import.meta.env.VITE_APP_VERSION || 'N/A'}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};

export default AboutCard;
