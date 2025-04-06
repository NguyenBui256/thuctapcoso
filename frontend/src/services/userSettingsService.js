import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const userSettingsService = {
    getUserSettings: async () => {
        const response = await axios.get(`${API_URL}/user-settings`);
        return response.data;
    },

    updateUserSettings: async (settings) => {
        const response = await axios.put(`${API_URL}/user-settings`, settings);
        return response.data;
    },

    changePassword: async (passwordData) => {
        const response = await axios.post(`${API_URL}/user-settings/change-password`, passwordData);
        return response.data;
    },

    getEmailNotifications: async () => {
        const response = await axios.get(`${API_URL}/user-settings/email-notifications`);
        return response.data;
    },

    updateEmailNotifications: async (notifications) => {
        const response = await axios.put(`${API_URL}/user-settings/email-notifications`, notifications);
        return response.data;
    }
};

export default userSettingsService; 