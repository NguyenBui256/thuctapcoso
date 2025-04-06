import axios from 'axios';

const API_URL = 'http://localhost:8080/api/projects';

// Create axios instance with default config
const api = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export const projectService = {
    // Get all projects with pagination
    getAllProjects: async (page = 0, size = 10) => {
        const response = await api.get(`/api/projects?page=${page}&size=${size}`);
        return response.data;
    },

    // Get project by ID
    getProjectById: async (id) => {
        const response = await api.get(`/api/projects/${id}`);
        return response.data;
    },

    // Get projects by user ID
    getProjectsByUser: async (userId) => {
        const response = await api.get(`/api/projects/user/${userId}`);
        return response.data;
    },

    // Create new project
    createProject: async (project) => {
        const response = await api.post('/api/projects', project);
        return response.data;
    },

    // Update project
    updateProject: async (id, projectData) => {
        const response = await api.put(`/api/projects/${id}`, projectData);
        return response.data;
    },

    // Delete project
    deleteProject: async (id) => {
        await api.delete(`/api/projects/${id}`);
    },

    // Get public projects with pagination
    getPublicProjects: async (page = 0, size = 10) => {
        const response = await api.get(`/api/projects/public?page=${page}&size=${size}`);
        return response.data;
    },

    // Get projects for duplication
    getProjectsForDuplication: async () => {
        const response = await api.get('/api/projects/duplicate');
        return response.data;
    },

    // Duplicate project
    duplicateProject: async (projectId, formData) => {
        const response = await api.post(`/api/projects/${projectId}/duplicate`, formData);
        return response.data;
    },

    getProjectNotificationSetting: async (projectId) => {
        const response = await api.get(`/api/notifications/settings/project/${projectId}`);
        return response.data;
    },

    updateNotificationSetting: async (projectId, setting) => {
        const response = await api.put('/api/notifications/settings', {
            projectId,
            notificationType: setting
        });
        return response.data;
    }
}; 