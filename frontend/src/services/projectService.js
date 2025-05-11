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

export const projectService = {
    // Get all projects with pagination
    getAllProjects: async (page = 0, size = 10) => {
        try {
            const response = await api.get('/v1/projects', {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching projects:', error.response?.data || error.message);
            throw error;
        }
    },

    // Get project by ID
    getProjectById: async (id) => {
        try {
            const response = await api.get(`/v1/projects/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching project by ID:', error.response?.data || error.message);
            throw error;
        }
    },

    // Get projects by user ID
    getProjectsByUser: async (userId) => {
        try {
            // If userId is not provided, get the current user's ID
            if (!userId) {
                const currentUserData = localStorage.getItem('userData');
                if (currentUserData) {
                    const userData = JSON.parse(currentUserData);
                    userId = userData.userId;
                }
                if (!userId) {
                    userId = localStorage.getItem('userId');
                }
                if (!userId) {
                    throw new Error('User ID not available');
                }
            }
            const response = await api.get(`/v1/projects/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user projects:', error.response?.data || error.message);
            throw error;
        }
    },

    // Create new project
    createProject: async (projectData) => {
        try {
            console.log('Creating project with data:', projectData);
            const response = await api.post('/v1/projects', projectData);
            console.log('Project created successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating project:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    },

    // Update project
    updateProject: async (id, projectData) => {
        try {
            const response = await api.put(`/v1/projects/${id}`, projectData);
            return response.data;
        } catch (error) {
            console.error('Error updating project:', error.response?.data || error.message);
            throw error;
        }
    },

    // Delete project
    deleteProject: async (id) => {
        try {
            await api.delete(`/v1/projects/${id}`);
        } catch (error) {
            console.error('Error deleting project:', error.response?.data || error.message);
            throw error;
        }
    },

    // Get public projects with pagination
    getPublicProjects: async (page = 0, size = 10) => {
        try {
            const response = await api.get(`/v1/projects/public`, {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching public projects:', error.response?.data || error.message);
            throw error;
        }
    },

    // Get projects that can be duplicated
    getProjectsForDuplication: async () => {
        try {
            const response = await api.get('/v1/projects', {
                params: { page: 0, size: 100 } // Get all projects
            });
            console.log('Projects API Response:', response.data);

            // Check if response has data and content
            if (response.data && response.data.data && response.data.data.content) {
                return response.data.data.content;
            }

            // If none of the above, return empty array
            console.warn('Unexpected API response format:', response.data);
            return [];
        } catch (error) {
            console.error('Error fetching projects for duplication:', error.response?.data || error.message);
            throw error;
        }
    },

    // Duplicate project
    duplicateProject: async (projectId, formData) => {
        try {
            const response = await api.post(`/v1/projects/${projectId}/duplicate`, formData);
            return response.data;
        } catch (error) {
            console.error('Error duplicating project:', error.response?.data || error.message);
            throw error;
        }
    },

    getProjectNotificationSetting: async (projectId) => {
        try {
            const response = await api.get(`/v1/notifications/settings/project/${projectId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching notification settings:', error.response?.data || error.message);
            throw error;
        }
    },

    updateNotificationSetting: async (projectId, setting) => {
        try {
            const response = await api.put('/v1/notifications/settings', {
                projectId,
                notificationType: setting
            });
            return response.data;
        } catch (error) {
            console.error('Error updating notification settings:', error.response?.data || error.message);
            throw error;
        }
    },

    // Get projects where user is an assignee
    getAssignedProjects: async () => {
        try {
            const response = await api.get('/v1/projects/assigned');
            return response.data;
        } catch (error) {
            console.error('Error fetching assigned projects:', error.response?.data || error.message);
            throw error;
        }
    },

    // Get projects where user is a watcher
    getWatchedProjects: async () => {
        try {
            const response = await api.get('/v1/projects/watched');
            return response.data;
        } catch (error) {
            console.error('Error fetching watched projects:', error.response?.data || error.message);
            throw error;
        }
    },

    // Get projects user is a member of
    getJoinedProjects: async () => {
        try {
            const response = await api.get('/v1/projects/joined');
            return response.data;
        } catch (error) {
            console.error('Error fetching joined projects:', error.response?.data || error.message);
            throw error;
        }
    }
}; 