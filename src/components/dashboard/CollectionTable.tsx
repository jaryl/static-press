import React from 'react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, Pencil, ExternalLink } from 'lucide-react';
import { Collection } from '@/types';
import { getDataUrl } from '@/lib/utils';

interface CollectionTableProps {
  collections: Collection[];
}

export const CollectionTable: React.FC<CollectionTableProps> = ({ collections }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[70%]">Name</TableHead>
          <TableHead className="w-[30%]">Slug</TableHead>
          <TableHead className="w-[20%] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {collections.map((collection) => (
          <TableRow key={collection.slug}>
            <TableCell className="font-medium py-3">
              <div className="flex flex-col">
                <Link to={`/collections/${collection.slug}`} className="hover:underline text-sm">
                  {collection.name}
                </Link>
                <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {collection.description || 'No description'}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-xs font-mono py-3">
              <a
                href={getDataUrl(collection.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                <span>{collection.slug}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </TableCell>
            <TableCell className="text-right">
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
