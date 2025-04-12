import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useCollection } from "@/contexts/CollectionContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { SchemaForm } from "@/components/SchemaForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import Container from "@/components/common/Container";
import { PrimaryHeader } from "@/components/common/PrimaryHeader";
import { SecondaryHeader } from "@/components/common/SecondaryHeader";

const SchemaEditor = () => {
  const { slug } = useParams<{ slug: string }>();
  const {
    fetchCollection,
    currentCollection,
    loading
  } = useCollection();

  useEffect(() => {
    fetchCollection(slug);
  }, [slug]);

  if (loading && !currentCollection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!currentCollection) {
    return (
      <Container>
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
            <SchemaForm collection={currentCollection} />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default SchemaEditor;
