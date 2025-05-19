// API Configuration
export const API_BASE_URL = import.meta.env.VITE_BASE_BE_URL || 'http://localhost:8080';

// API Endpoints
export const ENDPOINTS = {
    // User related
    USER_PROFILE: '/api/users/{userId}',
    USER_SETTINGS: '/api/v1/user-settings',
    USER_NOTIFICATIONS: '/api/v1/user/{userId}/notifications',

    // Authentication
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth/logout',

    // Projects
    PROJECTS: '/api/v1/projects',
    PROJECT_DETAIL: '/api/v1/projects/{projectId}',
};

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 30000; // 30 seconds 