
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Edit, ExternalLink, Trash2 } from "lucide-react";
import { CollectionSchema } from "@/services/collectionService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCollection } from "@/contexts/CollectionContext";

interface CollectionCardProps {
  collection: CollectionSchema;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const { deleteCollection } = useCollection();

  const handleDelete = async () => {
    await deleteCollection(collection.id);
  };

  return (
    <Card className="overflow-hidden border-gray-200 hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{collection.name}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {collection.fields.length} {collection.fields.length === 1 ? 'field' : 'fields'}
          </Badge>
        </div>
        <CardDescription className="text-sm text-muted-foreground truncate">
          {collection.description || 'No description provided'}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-2">
        <div className="text-xs text-muted-foreground">
          <span className="block">
            Created: {new Date(collection.createdAt).toLocaleDateString()}
          </span>
          <span className="block">
            Last Updated: {new Date(collection.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-3 pb-3">
        <div className="flex gap-2">
          <Link to={`/collections/${collection.id}`}>
            <Button size="sm" variant="default">
              <ExternalLink size={14} className="mr-1" />
              View Records
            </Button>
          </Link>
          <Link to={`/schema/${collection.id}`}>
            <Button size="sm" variant="outline">
              <Edit size={14} className="mr-1" />
              Edit Schema
            </Button>
          </Link>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-white">
              <Trash2 size={14} className="mr-1" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the{" "}
                <strong>{collection.name}</strong> collection and all its records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
