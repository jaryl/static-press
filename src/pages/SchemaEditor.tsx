
import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useCollection } from "@/contexts/CollectionContext";
import { Sidebar } from "@/components/Sidebar";
import { SchemaForm } from "@/components/SchemaForm";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const SchemaEditor = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    fetchCollection, 
    currentCollection, 
    loading 
  } = useCollection();

  useEffect(() => {
    if (id) {
      fetchCollection(id);
    }
  }, [id, fetchCollection]);

  if (!id) {
    return <Navigate to="/dashboard" replace />;
  }

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
      <div className="flex-1 overflow-auto">
        <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6">
          <div className="mb-6">
            <Link 
              to={`/collections/${id}`} 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to collection
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Schema: {currentCollection.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Define the structure and fields for this collection
            </p>
          </div>

          <Separator className="my-6" />

          <SchemaForm collection={currentCollection} />
        </div>
      </div>
    </div>
  );
};

export default SchemaEditor;
