import axios from 'axios';
import { BASE_API_URL } from '../common/constants';

// Create axios instance with default config
const api = axios.create({
    baseURL: BASE_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Response interceptor error:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const userSettingsService = {
    getUserSettings: async () => {
        try {
            const response = await api.get('/v1/user-settings');
            return response.data;
        } catch (error) {
            console.error('Error fetching user settings:', error.response?.data || error.message);
            throw error;
        }
    },

    updateUserSettings: async (settings) => {
        try {
            const response = await api.put('/v1/user-settings', settings);
            return response.data;
        } catch (error) {
            console.error('Error updating user settings:', error.response?.data || error.message);
            throw error;
        }
    },

    changePassword: async (passwordData) => {
        try {
            const response = await api.post('/v1/user-settings/change-password', passwordData);
            return response.data;
        } catch (error) {
            console.error('Error changing password:', error.response?.data || error.message);
            throw error;
        }
    },

    getEmailNotifications: async () => {
        try {
            const response = await api.get('/v1/user-settings/email-notifications');
            return response.data;
        } catch (error) {
            console.error('Error fetching email notifications:', error.response?.data || error.message);
            throw error;
        }
    },

    updateEmailNotifications: async (notifications) => {
        const response = await api.put('/v1/user-settings/email-notifications', notifications);
        return response.data;
    }
};

export default userSettingsService; 