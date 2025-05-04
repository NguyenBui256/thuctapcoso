import { BASE_API_URL } from '../common/constants';
import { fetchWithAuth } from '../utils/AuthUtils';

export const updateIssue = async (issueId, updateData) => {
  try {
    const response = await fetchWithAuth(`${BASE_API_URL}/v1/issue/${issueId}`, window.location, true, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    return response.json();
  } catch (error) {
    console.error('Error updating issue:', error);
    throw error;
  }
}; 