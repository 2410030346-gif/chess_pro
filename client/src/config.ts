// Environment configuration
export const config = {
  // Use environment variable if available, otherwise use localhost for development
  apiUrl: (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001',
  
  // For production, you'll set VITE_API_URL to your deployed backend
  // Example: https://chess-pro-backend.onrender.com
};
