import { useState, useMemo } from "react";
import { CollectionRecord } from "@/services/shared/types/collection";

export function useRecordFilter(records: CollectionRecord[]) {
  const [searchTerm, setSearchTerm] = useState("");

  // Memoize filtered records to avoid recalculation on every render
  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;

    const searchLower = searchTerm.toLowerCase();

    return records.filter(record => {
      // Search through all field values
      return Object.entries(record.data).some(([_, value]) => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchLower);
      });
    });
  }, [records, searchTerm]);

  // Calculate if there are any records (including potential new ones)
  const hasRecords = (additionalRecords: number) => {
    return records.length > 0 || additionalRecords > 0;
  };

  // Calculate if there are any filtered records
  const hasFilteredRecords = (additionalRecords: number) => {
    return filteredRecords.length > 0 || additionalRecords > 0;
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  return {
    searchTerm,
    filteredRecords,
    hasRecords,
    hasFilteredRecords,
    handleSearch
  };
}
