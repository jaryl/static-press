import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getDataUrl = (slug: string): string => {
  const baseUrl = import.meta.env.VITE_DATA_URL;
  return baseUrl ? `${baseUrl}/${slug}.json` : `/api/collections/${slug}/json`;
};
