import { memo } from "react";
import SearchBar from "./SearchBar";

interface CollectionSecondaryHeaderProps {
  description?: string;
  hasRecords: boolean;
  searchTerm: string;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CollectionSecondaryHeader = memo(({
  description,
  hasRecords,
  searchTerm,
  onSearch
}: CollectionSecondaryHeaderProps) => {
  return (
    <div className="secondary-header">
      <div className="text-xs text-muted-foreground">
        {description}
      </div>

      {hasRecords && (
        <SearchBar
          value={searchTerm}
          onChange={onSearch}
        />
      )}
    </div>
  );
});

export default CollectionSecondaryHeader;
