import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { siteService } from "@/services/siteService";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { handleApiError, withLoading } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";

export function OnboardingFlow() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { error: contextError } = useOnboarding();
  const { toast } = useToast();

  // This is a temporary function for Phase 1
  // In Phase 2, we'll replace this with the proper onboarding UI
  const createDefaultSite = async () => {
    setError(null);
    withLoading(async () => {
      try {
        await siteService.createSite({
          id: "my-first-site",
          name: "My First Site",
          description: "Created during onboarding"
        });
        
        // Invalidate the sites query to refresh the list
        queryClient.invalidateQueries({ queryKey: ['sites'] });
        
        toast({
          title: "Site Created",
          description: "Your first site has been created successfully!",
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create site';
        setError(errorMessage);
        handleApiError('create site', err, null, toast);
      }
    }, setIsCreating);
  };

  // Display any errors from the context or local state
  const displayError = error || (contextError ? contextError.message : null);

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Static Press</CardTitle>
          <CardDescription>
            Let's get started by setting up your first site
          </CardDescription>
        </CardHeader>
        <CardContent>
          {displayError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-muted-foreground mb-4">
            No sites have been detected. You need to create at least one site before you can use Static Press.
          </p>
          <p className="text-sm text-muted-foreground">
            In the full onboarding flow, we will:
          </p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1 mt-2">
            <li>Check your S3 bucket configuration</li>
            <li>Help you create your first site</li>
            <li>Guide you through the initial setup</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={createDefaultSite} 
            disabled={isCreating}
          >
            {isCreating ? "Creating Site..." : "Create My First Site"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
