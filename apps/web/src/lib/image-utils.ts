import { env } from '@/config/env';

/**
 * Normalizes and constructs a full image URL from a path.
 * Handles duplicate /api prefixes and ensures base URL formatting.
 */
export const getImageUrl = (path?: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Handle double /api issue: if path already starts with /api, remove it since baseUrl will add it
  const cleanPath = path.startsWith('/api/') ? path.replace('/api', '') : path;
  const baseUrl = env.API_URL.endsWith('/') ? env.API_URL.slice(0, -1) : env.API_URL;
  
  return `${baseUrl}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
};
