import { useEffect, useState } from "react";
import { useCollection } from "@/contexts/CollectionContext";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/Sidebar";
import { Plus, Eye, FileJson, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";
import Container from "@/components/common/Container";
import { Spinner } from "@/components/ui/spinner";
import { PrimaryHeader } from "@/components/common/PrimaryHeader";
import { SecondaryHeader } from "@/components/common/SecondaryHeader";
import NoResults from "@/components/common/NoResults";
import { getDataUrl } from "@/lib/utils";
import { NewCollectionDialog, CollectionFormData } from '@/components/common/CollectionForm';

const Dashboard = () => {
  const { collections, fetchCollections, loading, createCollection } = useCollection();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({
    id: `col-${Date.now()}`,
    name: "",
    slug: "",
    description: "",
    fields: []
  });

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleCreateCollectionSubmit = async (data: CollectionFormData) => {
    try {
      await createCollection({
        ...data,
        fields: data.fields || []
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  const filteredCollections = collections.filter(collection => {
    // Ensure searchTerm is treated as a string
    const search = String(searchTerm).toLowerCase();
    return (
      collection.name.toLowerCase().includes(search) ||
      (collection.description?.toLowerCase() || '').includes(search)
    );
  });

  return (
    <Container>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <PrimaryHeader
          title="Collections"
        >
          {/* New Collection Button */}
          <NewCollectionDialog
            onSubmit={handleCreateCollectionSubmit}
            isOpen={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          />
        </PrimaryHeader>
        <SecondaryHeader
          description="Manage your data collections and schemas"
          searchTerm={searchTerm}
          hasRecords={collections.length > 0}
          searchPlaceholder="Search collections..."
          onSearch={handleSearch}
        />

        {loading && collections.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <Spinner />
          </div>
        ) : filteredCollections.length > 0 ? (
          <Card className="bg-card border-border overflow-hidden shadow-sm m-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium">Collection</TableHead>
                  <TableHead className="text-xs font-medium">Slug</TableHead>
                  <TableHead className="text-xs font-medium">Fields</TableHead>
                  <TableHead className="text-xs font-medium w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCollections.map((collection) => (
                  <TableRow key={collection.slug} className="hover:bg-muted/30">
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">{collection.name}</span>
                        <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {collection.description || "No description"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{collection.slug}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {collection.fields?.length || 0} fields
                    </TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                asChild
                              >
                                <Link to={`/collections/${collection.slug}`}>
                                  <Eye className="h-3.5 w-3.5" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p className="text-xs">View records</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                asChild
                              >
                                <a href={getDataUrl(collection.slug)} target="_blank" rel="noopener noreferrer">
                                  <FileJson className="h-3.5 w-3.5" />
                                </a>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p className="text-xs">View JSON</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                asChild
                              >
                                <Link to={`/schema/${collection.slug}`}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p className="text-xs">Edit schema</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : searchTerm ? (
          <NoResults
            message="No collections match your search"
            helpText="Try a different search term"
          />
        ) : (
          <Card className="bg-card border-border p-6 text-center">
            <div>
              <p className="text-sm font-medium">No collections yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first collection to get started</p>
              <Button className="mt-4 text-xs h-7" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                Create Collection
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Container>
  );
};

export default Dashboard;
