/**
 * Image utility functions for optimized image loading
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export type ImageQuality = 'low' | 'medium' | 'high' | 'original';

interface OptimizedImageOptions {
  quality?: ImageQuality;
  maxWidth?: number;
}

/**
 * Get an optimized image URL with quality and size parameters
 * 
 * @param imageUrl - The original S3 image URL
 * @param options - Optimization options
 * @returns Optimized image serve URL
 * 
 * Quality levels:
 * - low: 30% quality, max 400px width (thumbnails, lists)
 * - medium: 50% quality, max 800px width (cards, previews) [default]
 * - high: 75% quality, max 1200px width (detail views)
 * - original: No optimization (full quality, original size)
 */
export function getOptimizedImageUrl(
  imageUrl: string | undefined | null,
  options: OptimizedImageOptions = {}
): string {
  if (!imageUrl) return '';
  
  const { quality = 'medium', maxWidth } = options;
  
  let url = `${API_BASE_URL}/api/upload/image/serve?url=${encodeURIComponent(imageUrl)}&quality=${quality}`;
  
  if (maxWidth) {
    url += `&maxWidth=${maxWidth}`;
  }
  
  return url;
}

/**
 * Get a thumbnail image URL (low quality, small size)
 * Good for: avatars, list items, grid thumbnails
 */
export function getThumbnailUrl(imageUrl: string | undefined | null, maxWidth: number = 200): string {
  return getOptimizedImageUrl(imageUrl, { quality: 'low', maxWidth });
}

/**
 * Get a preview image URL (medium quality)
 * Good for: cards, previews, medium-sized displays
 */
export function getPreviewUrl(imageUrl: string | undefined | null, maxWidth: number = 600): string {
  return getOptimizedImageUrl(imageUrl, { quality: 'medium', maxWidth });
}

/**
 * Get a full-size image URL (high quality)
 * Good for: detail views, modals, full-screen displays
 */
export function getFullImageUrl(imageUrl: string | undefined | null): string {
  return getOptimizedImageUrl(imageUrl, { quality: 'high' });
}

/**
 * Get the original image URL (no optimization)
 * Good for: downloads, printing
 */
export function getOriginalImageUrl(imageUrl: string | undefined | null): string {
  return getOptimizedImageUrl(imageUrl, { quality: 'original' });
}

export default {
  getOptimizedImageUrl,
  getThumbnailUrl,
  getPreviewUrl,
  getFullImageUrl,
  getOriginalImageUrl
};
