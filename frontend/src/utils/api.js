// API utility functions to handle API calls

// Using relative URL to leverage the proxy configured in vite.config.js
const API_BASE_URL = 'http://localhost:8080/api';

// Mock user ID for testing - in real app, this would come from auth
const mockUserId = 3;

// Standard fetch options with user headers
const getOptions = (method = 'GET') => ({
  method,
  headers: {
    'User-Id': mockUserId,
    'Content-Type': 'application/json'
  }
});

// Fetch projects
export const fetchProjects = async () => {
  const response = await fetch(`${API_BASE_URL}/projects`, getOptions());
  
  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (data && data.result === 'success' && Array.isArray(data.data)) {
    return data.data;
  } else {
    throw new Error("Invalid API response format");
  }
};

// Fetch project activities
export const fetchProjectActivities = async (projectId) => {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/activities`, 
    getOptions()
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch activities: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (data && data.result === 'success' && Array.isArray(data.data)) {
    return data.data;
  } else {
    return [];
  }
};

// Fetch project members
export const fetchProjectMembers = async (projectId) => {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/members`,
    getOptions()
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch project members: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (data && data.result === 'success' && Array.isArray(data.data)) {
    return data.data;
  } else {
    return [];
  }
};

// Debug function to test API connection
export const testApiConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, getOptions());
    const text = await response.text();
    
    try {
      const data = JSON.parse(text);
      return { success: response.ok, data };
    } catch (e) {
      return { success: false, error: 'Invalid JSON response', text };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export default {
  fetchProjects,
  fetchProjectActivities,
  fetchProjectMembers,
  testApiConnection
}; 