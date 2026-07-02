import {
  getOptimizedImageUrl,
  getThumbnailUrl,
  getPreviewUrl,
  getFullImageUrl,
  getOriginalImageUrl,
} from '../imageUtils';

// Mirrors the fallback inside imageUtils so tests pass regardless of .env values
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const S3_URL = 'https://bucket.s3.amazonaws.com/photos/item 1.jpg';
const ENCODED_S3_URL = encodeURIComponent(S3_URL);

describe('getOptimizedImageUrl', () => {
  it('returns an empty string for missing urls', () => {
    expect(getOptimizedImageUrl(null)).toBe('');
    expect(getOptimizedImageUrl(undefined)).toBe('');
    expect(getOptimizedImageUrl('')).toBe('');
  });

  it('builds a serve url with medium quality by default', () => {
    expect(getOptimizedImageUrl(S3_URL)).toBe(
      `${API_BASE_URL}/api/upload/image/serve?url=${ENCODED_S3_URL}&quality=medium`
    );
  });

  it('url-encodes the original image url', () => {
    const url = getOptimizedImageUrl(S3_URL);
    expect(url).toContain(ENCODED_S3_URL);
    expect(url).not.toContain('item 1.jpg');
  });

  it('appends maxWidth when provided', () => {
    const url = getOptimizedImageUrl(S3_URL, { quality: 'high', maxWidth: 1200 });
    expect(url).toContain('quality=high');
    expect(url).toContain('&maxWidth=1200');
  });

  it('omits maxWidth when not provided', () => {
    expect(getOptimizedImageUrl(S3_URL)).not.toContain('maxWidth');
  });
});

describe('preset helpers', () => {
  it('getThumbnailUrl uses low quality with 200px default width', () => {
    const url = getThumbnailUrl(S3_URL);
    expect(url).toContain('quality=low');
    expect(url).toContain('maxWidth=200');
  });

  it('getPreviewUrl uses medium quality with 600px default width', () => {
    const url = getPreviewUrl(S3_URL);
    expect(url).toContain('quality=medium');
    expect(url).toContain('maxWidth=600');
  });

  it('getFullImageUrl uses high quality without width cap', () => {
    const url = getFullImageUrl(S3_URL);
    expect(url).toContain('quality=high');
    expect(url).not.toContain('maxWidth');
  });

  it('getOriginalImageUrl requests the original quality', () => {
    expect(getOriginalImageUrl(S3_URL)).toContain('quality=original');
  });

  it('all presets return empty string for missing urls', () => {
    expect(getThumbnailUrl(null)).toBe('');
    expect(getPreviewUrl(undefined)).toBe('');
    expect(getFullImageUrl(null)).toBe('');
    expect(getOriginalImageUrl(undefined)).toBe('');
  });
});
