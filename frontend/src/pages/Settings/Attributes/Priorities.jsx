import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../../utils/AuthUtils';
import { BASE_API_URL } from '../../../common/constants';

const defaultPriority = {
  color: '#cccccc',
  name: '',
  order: 0
};

function Priorities({ projectId }) {
  const [priorities, setPriorities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newPriority, setNewPriority] = useState(defaultPriority);
  const [editingPriority, setEditingPriority] = useState(null);

  const fetchPriorities = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching priorities for project: ${projectId}`);
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/priorities`,
        null,
        true
      );
      if (res && res.ok) {
        const responseJson = await res.json();
        console.log('Priorities response:', responseJson);
        
        // Handle the API response format
        if (responseJson.statusCode === 200 && responseJson.data) {
          // Use the data array from the response
          setPriorities(Array.isArray(responseJson.data) ? responseJson.data : []);
        } else {
          // Fallback to the old format
          setPriorities(Array.isArray(responseJson) ? responseJson : []);
        }
      } else {
        console.error(`Error fetching priorities:`, res.status, res.statusText);
        setPriorities([]);
      }
    } catch (err) {
      console.error('Error fetching priorities:', err);
      setError('Failed to fetch priorities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchPriorities();
    // eslint-disable-next-line
  }, [projectId]);

  const handleAddClick = () => {
    setIsAdding(true);
    setNewPriority({
      ...defaultPriority,
      name: '',
      color: '#cccccc',
      order: priorities.length > 0 ? Math.max(...priorities.map(p => p.order || 0)) + 1 : 0
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPriority((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddPriority = async () => {
    if (!newPriority.name) {
      setError('Priority name is required');
      return;
    }

    console.log('Sending priority:', newPriority);

    try {
      setLoading(true);
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/priorities`,
        null,
        true,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPriority)
        }
      );
      
      if (res && res.ok) {
        setIsAdding(false);
        fetchPriorities();
        setError(null);
      } else {
        try {
          const errorResponse = await res.text();
          console.error('Error response:', errorResponse);
          setError(`Failed to add priority: ${errorResponse || res.statusText}`);
        } catch {
          setError(`Failed to add priority: ${res.statusText}`);
        }
      }
    } catch (err) {
      console.error('Error adding priority:', err);
      setError('Failed to add priority: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (priority) => {
    setEditingPriority({...priority});
  };

  const handleCancelEdit = () => {
    setEditingPriority(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingPriority((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdatePriority = async (priorityId, updated) => {
    if (!updated.name) {
      setError('Priority name is required');
      return;
    }

    try {
      setLoading(true);
      console.log(`Updating priority ${priorityId}:`, updated);
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/priorities/${priorityId}`,
        null,
        true,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        }
      );
      
      if (res && res.ok) {
        const responseJson = await res.json();
        console.log('Update response:', responseJson);
        fetchPriorities();
        setError(null);
      } else {
        try {
          const errorResponse = await res.text();
          console.error('Error updating priority:', errorResponse);
          setError(`Failed to update priority: ${errorResponse || res.statusText}`);
        } catch {
          setError(`Failed to update priority: ${res.statusText}`);
        }
      }
    } catch (err) {
      console.error('Error updating priority:', err);
      setError('Failed to update priority: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPriority.name) {
      setError('Priority name is required');
      return;
    }

    await handleUpdatePriority(editingPriority.id, editingPriority);
    setEditingPriority(null);
  };

  const handleDeletePriority = async (priorityId) => {
    if (!window.confirm('Delete this priority?')) return;
    
    try {
      setLoading(true);
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/priorities/${priorityId}`,
        null,
        true,
        { method: 'DELETE' }
      );
      
      if (res && res.ok) {
        fetchPriorities();
        setError(null);
      } else {
        try {
          const errorResponse = await res.text();
          console.error('Error deleting priority:', errorResponse);
          setError(`Failed to delete priority: ${errorResponse || res.statusText}`);
        } catch {
          setError(`Failed to delete priority: ${res.statusText}`);
        }
      }
    } catch (err) {
      console.error('Error deleting priority:', err);
      setError('Failed to delete priority: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-teal-600 mb-2">Priorities</h2>
      <p className="mb-6 text-gray-600">Specify the priorities your issues will have.</p>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading && <div>Loading...</div>}
      
      <div className="mb-8">
        <div className="flex items-center justify-between bg-gray-200 px-4 py-2 rounded-t">
          <span className="font-semibold text-base">ISSUE PRIORITIES</span>
          <button
            className="bg-teal-400 text-white px-4 py-1 rounded hover:bg-teal-500"
            onClick={handleAddClick}
          >
            ADD NEW PRIORITY
          </button>
        </div>
        <table className="w-full bg-white">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4 text-left">Color</th>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {priorities.map((priority) => (
              editingPriority && editingPriority.id === priority.id ? (
                <tr key={priority.id} className="border-b bg-gray-50">
                  <td className="py-2 px-4">
                    <input type="color" name="color" value={editingPriority.color} onChange={handleEditInputChange} />
                  </td>
                  <td className="py-2 px-4">
                    <input type="text" name="name" value={editingPriority.name} onChange={handleEditInputChange} className="border px-2 py-1 rounded w-full" placeholder="Name" />
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button className="bg-teal-500 text-white px-3 py-1 rounded mr-2" onClick={handleSaveEdit}>Save</button>
                    <button className="text-gray-500 hover:underline" onClick={handleCancelEdit}>Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={priority.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">
                    <span className="inline-block w-6 h-6 rounded" style={{ background: priority.color }}></span>
                  </td>
                  <td className="py-2 px-4">{priority.name}</td>
                  <td className="py-2 px-4 text-right">
                    <button className="text-blue-500 hover:underline mr-2" onClick={() => handleEditClick(priority)}>Edit</button>
                    <button className="text-red-500 hover:underline mr-2" onClick={() => handleDeletePriority(priority.id)}>Delete</button>
                  </td>
                </tr>
              )
            ))}
            {isAdding && (
              <tr>
                <td className="py-2 px-4">
                  <input type="color" name="color" value={newPriority.color} onChange={handleInputChange} />
                </td>
                <td className="py-2 px-4">
                  <input type="text" name="name" value={newPriority.name} onChange={handleInputChange} className="border px-2 py-1 rounded w-full" placeholder="Name" />
                </td>
                <td className="py-2 px-4 text-right">
                  <button className="bg-teal-500 text-white px-3 py-1 rounded mr-2" onClick={handleAddPriority}>Save</button>
                  <button className="text-gray-500 hover:underline" onClick={() => setIsAdding(false)}>Cancel</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Priorities; 