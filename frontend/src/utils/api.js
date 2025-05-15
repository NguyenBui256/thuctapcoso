// API utility functions to handle API calls
import { BASE_API_URL } from '../common/constants';
import { fetchWithAuth, getCurrentUserId } from './AuthUtils';

// Using the BASE_API_URL from constants
const API_BASE_URL = BASE_API_URL;

// Fetch ALL projects user is a member of (including ones they created and ones they're members of)
export const fetchAllUserProjects = async () => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error("User ID not available. Please login again.");
  }

  const response = await fetchWithAuth(
    `${API_BASE_URL}/v1/projects/user/${userId}/projects/member`,
    '/projects',  // redirect here if auth fails
    true,         // is authentication compulsory
    { method: 'GET' }
  );

  if (!response || !response.ok) {
    throw new Error(`Failed to fetch projects: ${response?.statusText || 'Authentication failed'}`);
  }

  const responseData = await response.json();
  console.log('All user projects data:', responseData);

  // Handle nested response structure - data is in responseData.data.data
  if (responseData.data && Array.isArray(responseData.data.data)) {
    return responseData.data.data;
  } else {
    throw new Error("Invalid API response format");
  }
};

// Fetch projects for the current user (only projects they created)
export const fetchProjectsByUserId = async () => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error("User ID not available. Please login again.");
  }

  const response = await fetchWithAuth(
    `${API_BASE_URL}/v1/projects/user/${userId}`,
    '/projects',  // redirect here if auth fails
    true,         // is authentication compulsory
    { method: 'GET' }
  );

  if (!response || !response.ok) {
    throw new Error(`Failed to fetch projects: ${response?.statusText || 'Authentication failed'}`);
  }

  const data = await response.json();
  console.log(data);

  if (Array.isArray(data.data)) {
    return data.data;
  } else {
    throw new Error("Invalid API response format");
  }
};

export const fetchProjectById = async (projectId) => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error("User ID not available. Please login again.");
    }

    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/projects/${projectId}`,
      '/projects',  // redirect here if auth fails
      true,         // is authentication compulsory
      {
        method: 'GET'
      }
    );

    if (!response) {
      throw new Error('Authentication failed');
    }

    if (response.status === 403) {
      throw new Error('You do not have access to this project');
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.statusText || 'Server error'}`);
    }

    const data = await response.json();
    console.log('Project data:', data);

    // Handle the nested data structure properly
    if (data && data.data && data.status === 'success') {
      return data.data;
    } else if (data && data.data && data.data.data) {
      // Handle double-nested structure if present
      return data.data.data;
    } else {
      throw new Error(data.message || "Invalid API response format");
    }
  } catch (error) {
    console.error('Error in fetchProjectById:', error);
    throw error;
  }
}

// Fetch project activities
export const fetchProjectActivities = async (projectId) => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error("User ID not available. Please login again.");
  }

  const response = await fetchWithAuth(
    `${API_BASE_URL}/v1/user/${userId}/project/${projectId}/activities`,
    `/projects/${projectId}`,
    true,
    { method: 'GET' }
  );

  const data = await response.json();
  console.log(data);

  if (!response || !response.ok) {
    throw new Error(`Failed to fetch activities: ${response?.message || 'Authentication failed'}`);
  }

  // const data = await response.json();

  if (Array.isArray(data.data)) {
    return data.data;
  } else {
    return [];
  }
};

// Fetch project members
export const fetchProjectMembers = async (projectId) => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error("User ID not available. Please login again.");
  }

  const response = await fetchWithAuth(
    `${API_BASE_URL}/v1/user/${userId}/project/${projectId}/members`,
    `/projects/${projectId}`,
    true,
    { method: 'GET' }
  );

  if (!response || !response.ok) {
    throw new Error(`Failed to fetch project members: ${response?.message || 'Authentication failed'}`);
  }

  const data = await response.json();
  console.log("TEAM MEMBERS: ");
  console.log(data.data);


  if (Array.isArray(data.data)) {
    return data.data;
  } else {
    return [];
  }
};

// Debug function to test API connection
export const testApiConnection = async () => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      return { success: false, error: 'User ID not available' };
    }

    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/users/${userId}/projects`,
      '/projects',
      false,  // not compulsory for testing
      { method: 'GET' }
    );

    if (!response) {
      return { success: false, error: 'Authentication failed' };
    }

    const text = await response.text();

    try {
      const data = JSON.parse(text);
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: `Invalid JSON response: ${error.message}`, text };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export default {
  fetchProjectsByUserId,
  fetchProjectActivities,
  fetchProjectMembers,
  testApiConnection
}; 