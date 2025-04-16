import React from 'react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, Pencil, ExternalLink } from 'lucide-react';
import { useCollection } from '@/contexts/CollectionContext';
import type { CollectionSchema } from '@/types';

interface CollectionTableProps {
  collections: CollectionSchema[];
}

export const CollectionTable: React.FC<CollectionTableProps> = ({ collections }) => {
  const { getRawCollectionUrl } = useCollection();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60%] sm:w-[70%] px-3 sm:px-4">Name</TableHead>
          <TableHead className="hidden sm:table-cell w-[30%] px-3 sm:px-4">Slug</TableHead>
          <TableHead className="w-[40%] sm:w-[20%] text-right px-3 sm:px-4">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {collections.map((collection) => (
          <TableRow key={collection.slug}>
            <TableCell className="font-medium py-2 sm:py-3 px-3 sm:px-4">
              <div className="flex flex-col">
                <Link to={`/collections/${collection.slug}`} className="hover:underline text-sm">
                  {collection.name}
                </Link>
                <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1 pr-2">
                  {collection.description || 'No description'}
                </span>
              </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell text-xs font-mono py-2 sm:py-3 px-3 sm:px-4">
              {getRawCollectionUrl(collection.slug) ? (
                <a
                  href={getRawCollectionUrl(collection.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors duration-150"
                >
                  <span>{collection.slug}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-muted-foreground">{collection.slug}</span>
              )}
            </TableCell>
            <TableCell className="text-right py-2 sm:py-3 px-3 sm:px-4">
              <TooltipProvider delayDuration={200}>
                <div className="flex items-center justify-end space-x-1">
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
  );
};
