import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useCollection } from "@/contexts/CollectionContext";
import { Sidebar } from "@/components/layout/sidebar";
import { SchemaForm } from "@/components/schemas/SchemaForm";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import Container from "@/components/layout/Container";
import { PrimaryHeader } from "@/components/layout/PrimaryHeader";
import { SecondaryHeader } from "@/components/layout/SecondaryHeader";

const SchemaEditor = () => {
  const { slug } = useParams<{ slug: string }>();
  const {
    fetchCollection,
    currentCollection,
    loading,
    error
  } = useCollection();

  useEffect(() => {
    if (slug) fetchCollection(slug);
  }, [slug, fetchCollection]);

  if (loading && !currentCollection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!loading && !currentCollection) {
    return (
      <Container>
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-medium">Collection not found</p>
            {/* Optionally display context error message here? */}
            <Link to="/dashboard">
              <Button variant="link" className="mt-2">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  if (!currentCollection) {
    console.error("SchemaEditor: Reached rendering stage but currentCollection is null.");
    return (
      <Container>
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-medium text-destructive">Error loading collection schema.</p>
            <Link to="/dashboard">
              <Button variant="link" className="mt-2">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PrimaryHeader
          title="Schema Editor"
          subtitle={currentCollection.name}
          backLink={`/collections/${currentCollection.slug}`}
        />

        <SecondaryHeader>
          Define the structure and fields for this collection
        </SecondaryHeader>

        <div className="flex-1 overflow-auto">
          <div className="container max-w-7xl mx-auto py-6">
            <SchemaForm
              collection={{
                id: currentCollection.slug,
                name: currentCollection.name,
                slug: currentCollection.slug,
                description: currentCollection.description,
                fields: currentCollection.fields.map(field => ({
                  id: field.id,
                  name: field.name,
                  type: field.type,
                  required: field.required,
                  options: field.options
                }))
              }}
            />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default SchemaEditor;
