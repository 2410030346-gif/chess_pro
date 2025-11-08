// Environment configuration
export const config = {
  // In production on Render, use relative URLs (same domain)
  // In development, use localhost
  apiUrl: process.env.NODE_ENV === 'production' 
    ? ''  // Empty string means same origin (relative URLs)
    : (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001',
};
