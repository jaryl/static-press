import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useCollection } from "@/contexts/CollectionContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { SchemaForm } from "@/components/SchemaForm";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const SchemaEditor = () => {
  const { id } = useParams<{ id: string }>();
  const {
    fetchCollection,
    currentCollection,
    loading
  } = useCollection();

  useEffect(() => {
    fetchCollection(id);
  }, [id, fetchCollection]);

  if (loading && !currentCollection) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary/70" />
        </div>
      </div>
    );
  }

  if (!currentCollection) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-medium">Collection not found</p>
            <Link to="/dashboard">
              <Button variant="link" className="mt-2">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="page-header border-b border-border">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-base font-medium">
              Schema Editor <span className="text-sm text-muted-foreground ml-2">{currentCollection.name}</span>
            </h1>

            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground" asChild>
              <Link to={`/collections/${id}`}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
        </header>

        <div className="secondary-header">
          <div className="text-xs text-muted-foreground">
            Define the structure and fields for this collection
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="container max-w-7xl mx-auto py-6">
            <SchemaForm collection={currentCollection} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemaEditor;
