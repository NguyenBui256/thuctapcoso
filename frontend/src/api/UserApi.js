import { API_BASE_URL } from '../constants/apiConfig';
import { fetchWithAuth } from '../utils/AuthUtils'

export const UserApi = {
    // Get current user profile
    getCurrentUserProfile: async () => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/me`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching current user profile:', error);
            return { error: true, message: error.message };
        }
    },

    // Get user profile by ID
    getUserProfile: async (userId) => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/${userId}`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching user profile for ID ${userId}:`, error);
            return { error: true, message: error.message };
        }
    },

    // Get user notifications (for timeline)
    getUserNotifications: async (userId) => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/user/${userId}/notifications`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching notifications for user ID ${userId}:`, error);
            return { error: true, message: error.message };
        }
    },

    // Get user settings
    getUserSettings: async () => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/user-settings`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching user settings:', error);
            return { error: true, message: error.message };
        }
    },

    // Update user settings
    updateUserSettings: async (updateData) => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/user-settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating user settings:', error);
            return { error: true, message: error.message };
        }
    },

    // Get user contacts (collaborators)
    getUserContacts: async (userId) => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/users/${userId}/contacts`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching contacts for user ID ${userId}:`, error);
            return [];
        }
    },

    // Get user stories assigned to user
    getAssignedUserStories: async (userId) => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/users/${userId}/assigned-userstories`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching assigned user stories for user ID ${userId}:`, error);
            return [];
        }
    }
}; 