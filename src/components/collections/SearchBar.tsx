import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const SearchBar = memo(({ value, onChange, placeholder = "Search records..." }: SearchBarProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-9 py-1.5 h-8 bg-background/10 border border-border/50 rounded-lg text-xs"
      />
    </div>
  );
});

export default SearchBar;
