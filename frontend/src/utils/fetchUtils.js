import { API_BASE_URL, REQUEST_TIMEOUT } from '../constants/apiConfig';

/**
 * Fetch API wrapper with authentication
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
export const fetchWithAuth = async (url, options = {}) => {
    // Get token from localStorage or other storage
    const token = localStorage.getItem('accessToken');

    // Set default headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        // Make API call
        const response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
        });

        // Handle 401 Unauthorized error (token expired)
        if (response.status === 401) {
            // Attempt to refresh token or logout user
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
            return Promise.reject(new Error('Session expired'));
        }

        return response;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
};

/**
 * Fetch API wrapper without authentication
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
export const fetchWithoutAuth = async (url, options = {}) => {
    // Set default headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        // Make API call
        const response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
        });

        return response;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}; 