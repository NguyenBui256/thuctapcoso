// Define fallback URLs in case environment variables are not set
const DEFAULT_API_URL = import.meta.env.VITE_BASE_API_URL || 'http://localhost:8080/api';
const DEFAULT_BE_URL = import.meta.env.VITE_BASE_BE_URL || 'http://localhost:8080';

// Get API URLs from environment variables with fallbacks
export const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || DEFAULT_API_URL;
export const BASE_BE_URL = import.meta.env.VITE_BASE_BE_URL || DEFAULT_BE_URL;

// Log API URLs for debugging
console.log('API URLs:', {
    BASE_API_URL,
    BASE_BE_URL,
    env_var_exists: !!import.meta.env.VITE_BASE_API_URL
});