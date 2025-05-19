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

            // Check if response has data property
            if (response.data && response.data.data) {
                // If data is wrapped in a content property
                if (response.data.data.content) {
                    return response.data.data.content;
                }
                // If data is an array directly
                if (Array.isArray(response.data.data)) {
                    return response.data.data;
                }
                return [];
            }

            // Check if response is an array directly
            if (Array.isArray(response.data)) {
                return response.data;
            }

            // If none of the above, return empty array
            console.warn('Unexpected API response format:', response.data);
            return [];
        } catch (error) {
            console.error('Error fetching projects for duplication:', error);
            return []; // Return empty array instead of throwing to prevent UI crashes
        }
    },

    // Duplicate project
    duplicateProject: async (projectId, formData) => {
        try {
            // Ensure ownerId is set
            if (!formData.ownerId) {
                const userId = localStorage.getItem("userId");
                if (!userId) {
                    throw new Error("User ID not found. Please try logging in again.");
                }
                formData = { ...formData, ownerId: userId };
            }

            console.log('Calling API to duplicate project:', projectId, 'with data:', formData);
            const response = await api.post(`/v1/projects/${projectId}/duplicate`, formData);
            console.log('Project duplication successful:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error duplicating project:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });

            // Add detailed error information
            if (error.response?.data?.message?.includes("is_on doesn't have a default value")) {
                console.error("This appears to be a database error with project modules. Please contact the administrator.");
            } else if (error.response?.data?.message?.includes("return value of \"edu.ptit.ttcs.entity.Project.getOwner()\" is null")) {
                console.error("Source project has a null owner. This should be fixed after this update.");
            }

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
    },

    // Get project roles
    getProjectRoles: async (projectId, userId) => {
        try {
            const response = await api.get(`/v1/user/${userId}/project/${projectId}/roles`);
            return response.data;
        } catch (error) {
            console.error('Error fetching project roles:', error.response?.data || error.message);
            throw error;
        }
    },

    // Update project member role
    updateMemberRole: async (projectId, memberId, roleId, userId) => {
        try {
            const response = await api.put(`/v1/user/${userId}/project/${projectId}/members/${memberId}`, {
                userId: memberId,
                roleId: roleId,
                isAdmin: false
            });
            return response.data;
        } catch (error) {
            console.error('Error updating member role:', error.response?.data || error.message);
            throw error;
        }
    },

    // Get project modules
    getProjectModules: async (projectId) => {
        try {
            const response = await api.get(`/v1/projects/${projectId}/modules`);
            return response.data;
        } catch (error) {
            console.error('Error fetching project modules:', error.response?.data || error.message);
            throw error;
        }
    },

    // Enable specific modules for a project (like Scrum or Kanban)
    enableProjectModules: async (projectId, moduleNames) => {
        try {
            // First get all modules
            const modulesResponse = await api.get(`/v1/projects/${projectId}/modules`);
            let moduleData = modulesResponse.data;

            console.log('Module data received:', moduleData);

            // Ensure moduleData is an array - handle different API response formats
            if (!Array.isArray(moduleData)) {
                // If moduleData is not an array, it might be wrapped in a data property
                if (moduleData && moduleData.data && Array.isArray(moduleData.data)) {
                    moduleData = moduleData.data;
                } else {
                    console.error('Unexpected module data format:', moduleData);
                    throw new Error('Invalid module data format from API');
                }
            }

            if (moduleData.length === 0) {
                console.warn('No modules found for project', projectId);
                return [];
            }

            // Prepare modules for update
            const updatedModules = moduleData.map(module => {
                const moduleName = module.module?.name?.toLowerCase() || '';
                return {
                    id: module.id,
                    module: {
                        id: module.module?.id || module.moduleId
                    },
                    isOn: moduleNames.includes(moduleName), // Enable only specified modules
                    projectId: parseInt(projectId)
                };
            });

            console.log('Updating modules with data:', updatedModules);

            // Update modules
            const response = await api.put(`/v1/projects/${projectId}/modules`, updatedModules);
            console.log('Modules updated successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error enabling project modules:', error);
            throw error;
        }
    }
}; 