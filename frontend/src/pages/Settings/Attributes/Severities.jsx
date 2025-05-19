import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../../utils/AuthUtils';
import { BASE_API_URL } from '../../../common/constants';

const defaultSeverity = {
  color: '#cccccc',
  name: '',
  order: 0
};

function Severities({ projectId }) {
  const [severities, setSeverities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newSeverity, setNewSeverity] = useState(defaultSeverity);
  const [editingSeverity, setEditingSeverity] = useState(null);

  const fetchSeverities = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching severities for project: ${projectId}`);
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/severities`,
        null,
        true
      );
      if (res && res.ok) {
        const responseJson = await res.json();
        console.log('Severities response:', responseJson);
        
        // Handle the API response format
        if (responseJson.statusCode === 200 && responseJson.data) {
          // Use the data array from the response
          setSeverities(Array.isArray(responseJson.data) ? responseJson.data : []);
        } else {
          // Fallback to the old format
          setSeverities(Array.isArray(responseJson) ? responseJson : []);
        }
      } else {
        console.error(`Error fetching severities:`, res.status, res.statusText);
        setSeverities([]);
      }
    } catch (err) {
      console.error('Error fetching severities:', err);
      setError('Failed to fetch severities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchSeverities();
    // eslint-disable-next-line
  }, [projectId]);

  const handleAddClick = () => {
    setIsAdding(true);
    setNewSeverity({
      ...defaultSeverity,
      name: '',
      color: '#cccccc',
      order: severities.length > 0 ? Math.max(...severities.map(p => p.order || 0)) + 1 : 0
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSeverity((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSeverity = async () => {
    if (!newSeverity.name) {
      setError('Severity name is required');
      return;
    }

    console.log('Sending severity:', newSeverity);

    try {
      setLoading(true);
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/severities`,
        null,
        true,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSeverity)
        }
      );
      
      if (res && res.ok) {
        setIsAdding(false);
        fetchSeverities();
        setError(null);
      } else {
        try {
          const errorResponse = await res.text();
          console.error('Error response:', errorResponse);
          setError(`Failed to add severity: ${errorResponse || res.statusText}`);
        } catch {
          setError(`Failed to add severity: ${res.statusText}`);
        }
      }
    } catch (err) {
      console.error('Error adding severity:', err);
      setError('Failed to add severity: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (severity) => {
    setEditingSeverity({...severity});
  };

  const handleCancelEdit = () => {
    setEditingSeverity(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingSeverity((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateSeverity = async (severityId, updated) => {
    if (!updated.name) {
      setError('Severity name is required');
      return;
    }

    try {
      setLoading(true);
      console.log(`Updating severity ${severityId}:`, updated);
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/severities/${severityId}`,
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
        fetchSeverities();
        setError(null);
      } else {
        try {
          const errorResponse = await res.text();
          console.error('Error updating severity:', errorResponse);
          setError(`Failed to update severity: ${errorResponse || res.statusText}`);
        } catch {
          setError(`Failed to update severity: ${res.statusText}`);
        }
      }
    } catch (err) {
      console.error('Error updating severity:', err);
      setError('Failed to update severity: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingSeverity.name) {
      setError('Severity name is required');
      return;
    }

    await handleUpdateSeverity(editingSeverity.id, editingSeverity);
    setEditingSeverity(null);
  };

  const handleDeleteSeverity = async (severityId) => {
    if (!window.confirm('Delete this severity?')) return;
    
    try {
      setLoading(true);
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/severities/${severityId}`,
        null,
        true,
        { method: 'DELETE' }
      );
      
      if (res && res.ok) {
        fetchSeverities();
        setError(null);
      } else {
        try {
          const errorResponse = await res.text();
          console.error('Error deleting severity:', errorResponse);
          setError(`Failed to delete severity: ${errorResponse || res.statusText}`);
        } catch {
          setError(`Failed to delete severity: ${res.statusText}`);
        }
      }
    } catch (err) {
      console.error('Error deleting severity:', err);
      setError('Failed to delete severity: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-teal-600 mb-2">Severities</h2>
      <p className="mb-6 text-gray-600">Specify the severities your issues will have.</p>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading && <div>Loading...</div>}
      
      <div className="mb-8">
        <div className="flex items-center justify-between bg-gray-200 px-4 py-2 rounded-t">
          <span className="font-semibold text-base">ISSUE SEVERITIES</span>
          <button
            className="bg-teal-400 text-white px-4 py-1 rounded hover:bg-teal-500"
            onClick={handleAddClick}
          >
            ADD NEW SEVERITY
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
            {severities.map((severity) => (
              editingSeverity && editingSeverity.id === severity.id ? (
                <tr key={severity.id} className="border-b bg-gray-50">
                  <td className="py-2 px-4">
                    <input type="color" name="color" value={editingSeverity.color} onChange={handleEditInputChange} />
                  </td>
                  <td className="py-2 px-4">
                    <input type="text" name="name" value={editingSeverity.name} onChange={handleEditInputChange} className="border px-2 py-1 rounded w-full" placeholder="Name" />
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button className="bg-teal-500 text-white px-3 py-1 rounded mr-2" onClick={handleSaveEdit}>Save</button>
                    <button className="text-gray-500 hover:underline" onClick={handleCancelEdit}>Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={severity.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">
                    <span className="inline-block w-6 h-6 rounded" style={{ background: severity.color }}></span>
                  </td>
                  <td className="py-2 px-4">{severity.name}</td>
                  <td className="py-2 px-4 text-right">
                    <button className="text-blue-500 hover:underline mr-2" onClick={() => handleEditClick(severity)}>Edit</button>
                    <button className="text-red-500 hover:underline mr-2" onClick={() => handleDeleteSeverity(severity.id)}>Delete</button>
                  </td>
                </tr>
              )
            ))}
            {isAdding && (
              <tr>
                <td className="py-2 px-4">
                  <input type="color" name="color" value={newSeverity.color} onChange={handleInputChange} />
                </td>
                <td className="py-2 px-4">
                  <input type="text" name="name" value={newSeverity.name} onChange={handleInputChange} className="border px-2 py-1 rounded w-full" placeholder="Name" />
                </td>
                <td className="py-2 px-4 text-right">
                  <button className="bg-teal-500 text-white px-3 py-1 rounded mr-2" onClick={handleAddSeverity}>Save</button>
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

export default Severities; 