/**
 * Image loader utility to dynamically import images from the sample directory
 */

// Cache for imported images to avoid duplicate imports
const imageCache: Record<string, string> = {};

/**
 * Dynamically imports an image and returns its URL
 * @param imagePath The path to the image relative to the sample/images directory
 * @returns A promise that resolves to the image URL
 */
export const importImage = async (imagePath: string): Promise<string> => {
  if (!imagePath) {
    return '';
  }

  // Remove leading slash if present for consistency
  const normalizedPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

  // Check if the image is already in the cache
  if (imageCache[normalizedPath]) {
    return imageCache[normalizedPath];
  }

  try {
    // Dynamically import the image
    // Note: This requires the Vite's import.meta.glob feature
    const modules = import.meta.glob('/sample/images/**/*.*', { eager: true });

    // Find the matching module
    const matchingPath = Object.keys(modules).find(path =>
      path.endsWith(`/${normalizedPath}`) || path.endsWith(`/${imagePath}`)
    );

    if (matchingPath) {
      // TypeScript doesn't know the exact shape of the module
      const module = modules[matchingPath] as any;
      const imageUrl = module.default || '';

      // Cache the result
      imageCache[normalizedPath] = imageUrl;

      return imageUrl;
    }

    console.warn(`[ImageLoader] Image not found: ${normalizedPath}`);
    return '';
  } catch (error) {
    console.error(`[ImageLoader] Error importing image: ${normalizedPath}`, error);
    return '';
  }
};

/**
 * Gets the URL for an image, either from local imports or remote URL
 * @param imagePath The path to the image
 * @param isRemote Whether the image is remote (true) or local (false)
 * @param baseUrl The base URL for remote images
 * @returns The image URL
 */
export const getImageUrl = async (
  imagePath: string,
  isRemote: boolean = false,
  baseUrl: string = ''
): Promise<string> => {
  if (!imagePath) {
    return '';
  }

  // Handle absolute URLs (starting with http:// or https://)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // For remote images, construct the URL using the base URL
  if (isRemote && baseUrl) {
    // Remove leading slash if present for consistency
    const normalizedPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

    // Extract the base URL without the 'data' part
    const baseUrlWithoutTrailingSlash = baseUrl.endsWith('/')
      ? baseUrl.slice(0, -1)
      : baseUrl;

    const lastSlashIndex = baseUrlWithoutTrailingSlash.lastIndexOf('/');
    const baseUrlWithoutData = lastSlashIndex !== -1
      ? baseUrlWithoutTrailingSlash.substring(0, lastSlashIndex)
      : baseUrlWithoutTrailingSlash;

    // Construct the image URL using the base URL and the images directory
    return `${baseUrlWithoutData}/images/${normalizedPath}`;
  }

  // For local images, use the import mechanism
  return await importImage(imagePath);
};
