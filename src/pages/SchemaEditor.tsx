import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/sidebar';
import { SchemaForm } from '@/components/schemas/SchemaForm';
import { Spinner } from '@/components/ui/spinner';
import Container from '@/components/layout/Container';
import { PrimaryHeader } from '@/components/layout/PrimaryHeader';
import { SecondaryHeader } from '@/components/layout/SecondaryHeader';
import { useSchemaLoader } from '@/hooks/use-schema-loader';
import { GenericErrorDisplay } from '@/components/layout/GenericErrorDisplay';
import React from 'react';

const SchemaEditor = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { schema, isLoading, error } = useSchemaLoader(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const mainContent: React.ReactNode = (() => {
    if (error) {
      const description = slug
        ? `There was a problem loading the schema data for '${slug}'.`
        : 'There was a problem loading the schema data.';
      const handleBackToDashboard = () => navigate('/dashboard');

      return (
        <GenericErrorDisplay
          title="Error Loading Schema"
          description={description}
          errorMessage={error}
          actionButtonLabel="Back to Dashboard"
          onActionClick={handleBackToDashboard}
        />
      );
    }

    return (
      <SchemaForm
        collection={{
          id: schema!.slug,
          name: schema!.name,
          slug: schema!.slug,
          description: schema!.description,
          fields: schema!.fields.map(field => ({
            id: field.id,
            name: field.name,
            type: field.type,
            required: field.required,
            options: field.options,
            timezoneAware: field.timezoneAware,
          }))
        }}
      />
    );
  })();

  return (
    <Container>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {!error && schema && (
          <>
            <PrimaryHeader
              title="Schema Editor"
              subtitle={schema.name}
              backLink={`/collections/${schema.slug}`}
            />
            <SecondaryHeader>
              Define the structure and fields for this collection
            </SecondaryHeader>
          </>
        )}
        <main className={`flex-1 overflow-y-auto ${error ? 'flex items-center justify-center' : ''}`}>
          <div className={!error ? "container max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6" : ""}>
            {mainContent}
          </div>
        </main>
      </div>
    </Container>
  );
};

export default SchemaEditor;
