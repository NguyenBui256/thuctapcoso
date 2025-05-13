import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../../utils/AuthUtils';
import { BASE_API_URL } from '../../../common/constants';

const defaultType = {
  color: '#cccccc',
  name: '',
  order: 0
};

function Types({ projectId }) {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newType, setNewType] = useState(defaultType);
  const [editingType, setEditingType] = useState(null);

  const fetchTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching types for project: ${projectId}`);
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/types`,
        null,
        true
      );
      if (res && res.ok) {
        const responseJson = await res.json();
        console.log('Types response:', responseJson);
        
        // Handle the API response format
        if (responseJson.statusCode === 200 && responseJson.data) {
          // Use the data array from the response
          setTypes(Array.isArray(responseJson.data) ? responseJson.data : []);
        } else {
          // Fallback to the old format
          setTypes(Array.isArray(responseJson) ? responseJson : []);
        }
      } else {
        console.error(`Error fetching types:`, res.status, res.statusText);
        setTypes([]);
      }
    } catch (err) {
      console.error('Error fetching types:', err);
      setError('Failed to fetch types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchTypes();
    // eslint-disable-next-line
  }, [projectId]);

  const handleAddClick = () => {
    setIsAdding(true);
    setNewType({
      ...defaultType,
      name: '',
      color: '#cccccc',
      order: types.length > 0 ? Math.max(...types.map(t => t.order || 0)) + 1 : 0
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewType((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddType = async () => {
    if (!newType.name) {
      setError('Type name is required');
      return;
    }

    console.log('Sending type:', newType);

    try {
      setLoading(true);
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/types`,
        null,
        true,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newType)
        }
      );
      
      if (res && res.ok) {
        setIsAdding(false);
        fetchTypes();
        setError(null);
      } else {
        try {
          const errorResponse = await res.text();
          console.error('Error response:', errorResponse);
          setError(`Failed to add type: ${errorResponse || res.statusText}`);
        } catch {
          setError(`Failed to add type: ${res.statusText}`);
        }
      }
    } catch (err) {
      console.error('Error adding type:', err);
      setError('Failed to add type: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (type) => {
    setEditingType({...type});
  };

  const handleCancelEdit = () => {
    setEditingType(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingType((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateType = async (typeId, updated) => {
    if (!updated.name) {
      setError('Type name is required');
      return;
    }

    try {
      setLoading(true);
      console.log(`Updating type ${typeId}:`, updated);
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/types/${typeId}`,
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
        fetchTypes();
        setError(null);
      } else {
        try {
          const errorResponse = await res.text();
          console.error('Error updating type:', errorResponse);
          setError(`Failed to update type: ${errorResponse || res.statusText}`);
        } catch {
          setError(`Failed to update type: ${res.statusText}`);
        }
      }
    } catch (err) {
      console.error('Error updating type:', err);
      setError('Failed to update type: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingType.name) {
      setError('Type name is required');
      return;
    }

    await handleUpdateType(editingType.id, editingType);
    setEditingType(null);
  };

  const handleDeleteType = async (typeId) => {
    if (!window.confirm('Delete this type?')) return;
    
    try {
      setLoading(true);
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/types/${typeId}`,
        null,
        true,
        { method: 'DELETE' }
      );
      
      if (res && res.ok) {
        fetchTypes();
        setError(null);
      } else {
        try {
          const errorResponse = await res.text();
          console.error('Error deleting type:', errorResponse);
          setError(`Failed to delete type: ${errorResponse || res.statusText}`);
        } catch {
          setError(`Failed to delete type: ${res.statusText}`);
        }
      }
    } catch (err) {
      console.error('Error deleting type:', err);
      setError('Failed to delete type: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-teal-600 mb-2">Types</h2>
      <p className="mb-6 text-gray-600">Specify the types your issues could be.</p>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading && <div>Loading...</div>}
      
      <div className="mb-8">
        <div className="flex items-center justify-between bg-gray-200 px-4 py-2 rounded-t">
          <span className="font-semibold text-base">ISSUES TYPES</span>
          <button
            className="bg-teal-400 text-white px-4 py-1 rounded hover:bg-teal-500"
            onClick={handleAddClick}
          >
            ADD NEW
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
            {types.map((type) => (
              editingType && editingType.id === type.id ? (
                <tr key={type.id} className="border-b bg-gray-50">
                  <td className="py-2 px-4">
                    <input type="color" name="color" value={editingType.color} onChange={handleEditInputChange} />
                  </td>
                  <td className="py-2 px-4">
                    <input type="text" name="name" value={editingType.name} onChange={handleEditInputChange} className="border px-2 py-1 rounded w-full" placeholder="Name" />
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button className="bg-teal-500 text-white px-3 py-1 rounded mr-2" onClick={handleSaveEdit}>Save</button>
                    <button className="text-gray-500 hover:underline" onClick={handleCancelEdit}>Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={type.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">
                    <span className="inline-block w-6 h-6 rounded" style={{ background: type.color }}></span>
                  </td>
                  <td className="py-2 px-4">{type.name}</td>
                  <td className="py-2 px-4 text-right">
                    <button className="text-blue-500 hover:underline mr-2" onClick={() => handleEditClick(type)}>Edit</button>
                    <button className="text-red-500 hover:underline mr-2" onClick={() => handleDeleteType(type.id)}>Delete</button>
                  </td>
                </tr>
              )
            ))}
            {isAdding && (
              <tr>
                <td className="py-2 px-4">
                  <input type="color" name="color" value={newType.color} onChange={handleInputChange} />
                </td>
                <td className="py-2 px-4">
                  <input type="text" name="name" value={newType.name} onChange={handleInputChange} className="border px-2 py-1 rounded w-full" placeholder="Name" />
                </td>
                <td className="py-2 px-4 text-right">
                  <button className="bg-teal-500 text-white px-3 py-1 rounded mr-2" onClick={handleAddType}>Save</button>
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

export default Types; 