import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../../utils/AuthUtils';
import { BASE_API_URL } from '../../../common/constants';

const STATUS_TYPES = [
  { type: 'userstory', label: 'USER STORY STATUSES' },
  { type: 'task', label: 'TASK STATUSES' },
  { type: 'issue', label: 'ISSUE STATUSES' }
];

const defaultStatus = {
  color: '#cccccc',
  name: '',
  slug: '',
  closed: false,
  archived: false,
  order: 0,
  type: '',
};

function Statuses({ projectId }) {
  const [statuses, setStatuses] = useState({ userstory: [], task: [], issue: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addingType, setAddingType] = useState(null);
  const [newStatus, setNewStatus] = useState(defaultStatus);
  const [editingStatus, setEditingStatus] = useState(null);

  const fetchStatuses = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = {};
      for (const { type } of STATUS_TYPES) {
        console.log(`Fetching statuses for type: ${type}`);
        const res = await fetchWithAuth(
          `${BASE_API_URL}/v1/projects/${projectId}/statuses?type=${type}`,
          null,
          true
        );
        if (res && res.ok) {
          const responseJson = await res.json();
          console.log(`Response for ${type}:`, responseJson);
          
          // Handle the new API response format
          if (responseJson.statusCode === 200 && responseJson.data) {
            // Use the data array from the response
            result[type] = Array.isArray(responseJson.data) ? responseJson.data : [];
          } else {
            // Fallback to the old format or empty array if data is not available
            result[type] = Array.isArray(responseJson) ? responseJson : [];
          }
        } else {
          console.error(`Error fetching ${type} statuses:`, res.status, res.statusText);
          result[type] = [];
        }
      }
      setStatuses(result);
    } catch (err) {
      console.error('Error fetching statuses:', err);
      setError('Failed to fetch statuses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchStatuses();
    // eslint-disable-next-line
  }, [projectId]);

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const handleAddClick = (type) => {
    setAddingType(type);
    setNewStatus({
      ...defaultStatus,
      type: type,
      name: '',
      slug: '',
      color: '#cccccc',
      order: 0,
      closed: false,
      archived: false
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setNewStatus((prev) => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value
    }));
  };

  const handleAddStatus = async () => {
    if (!newStatus.name) {
      setError('Status name is required');
      return;
    }

    const statusToSend = {
      ...newStatus
    };

    if (!statusToSend.slug) {
      statusToSend.slug = generateSlug(statusToSend.name);
    }

    console.log('Sending status:', statusToSend);

    try {
      setLoading(true);
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/statuses`,
        null,
        true,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(statusToSend)
        }
      );
      
      if (res && res.ok) {
        setAddingType(null);
        fetchStatuses();
        setError(null);
      } else {
        try {
          const errorResponse = await res.text();
          console.error('Error response:', errorResponse);
          setError(`Failed to add status: ${errorResponse || res.statusText}`);
        } catch {
          setError(`Failed to add status: ${res.statusText}`);
        }
      }
    } catch (err) {
      console.error('Error adding status:', err);
      setError('Failed to add status: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (statusId, updated) => {
    if (!updated.name) {
      setError('Status name is required');
      return;
    }

    try {
      setLoading(true);
      console.log(`Updating status ${statusId}:`, updated);
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/statuses/${statusId}`,
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
        fetchStatuses();
        setError(null);
      } else {
        try {
          const errorResponse = await res.text();
          console.error('Error updating status:', errorResponse);
          setError(`Failed to update status: ${errorResponse || res.statusText}`);
        } catch {
          setError(`Failed to update status: ${res.statusText}`);
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStatus = async (statusId) => {
    if (!window.confirm('Delete this status?')) return;
    
    try {
      setLoading(true);
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/statuses/${statusId}`,
        null,
        true,
        { method: 'DELETE' }
      );
      
      if (res && res.ok) {
        fetchStatuses();
        setError(null);
      } else {
        try {
          const errorResponse = await res.text();
          console.error('Error deleting status:', errorResponse);
          setError(`Failed to delete status: ${errorResponse || res.statusText}`);
        } catch {
          setError(`Failed to delete status: ${res.statusText}`);
        }
      }
    } catch (err) {
      console.error('Error deleting status:', err);
      setError('Failed to delete status: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (status) => {
    setEditingStatus({...status});
  };

  const handleCancelEdit = () => {
    setEditingStatus(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setEditingStatus((prev) => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingStatus.name) {
      setError('Status name is required');
      return;
    }

    // Generate slug if it's empty
    if (!editingStatus.slug) {
      editingStatus.slug = generateSlug(editingStatus.name);
    }

    await handleUpdateStatus(editingStatus.id, editingStatus);
    setEditingStatus(null);
  };

  const renderTable = (type, label) => {
    const typeStatuses = Array.isArray(statuses[type]) ? statuses[type] : [];
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between bg-gray-200 px-4 py-2 rounded-t">
          <span className="font-semibold text-base">{label}</span>
          <button
            className="bg-teal-400 text-white px-4 py-1 rounded hover:bg-teal-500"
            onClick={() => handleAddClick(type)}
          >
            ADD NEW STATUS
          </button>
        </div>
        <table className="w-full bg-white">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4 text-left">Color</th>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Slug</th>
              <th className="py-2 px-4 text-left">Closed</th>
              <th className="py-2 px-4 text-left">Archived</th>
              <th className="py-2 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {typeStatuses.map((status) => (
              editingStatus && editingStatus.id === status.id ? (
                <tr key={status.id} className="border-b bg-gray-50">
                  <td className="py-2 px-4">
                    <input type="color" name="color" value={editingStatus.color} onChange={handleEditInputChange} />
                  </td>
                  <td className="py-2 px-4">
                    <input type="text" name="name" value={editingStatus.name} onChange={handleEditInputChange} className="border px-2 py-1 rounded w-full" placeholder="Name" />
                  </td>
                  <td className="py-2 px-4">
                    <input type="text" name="slug" value={editingStatus.slug} onChange={handleEditInputChange} className="border px-2 py-1 rounded w-full" placeholder="Slug" />
                  </td>
                  <td className="py-2 px-4">
                    <input type="checkbox" name="closed" checked={editingStatus.closed} onChange={handleEditInputChange} />
                  </td>
                  <td className="py-2 px-4">
                    <input type="checkbox" name="archived" checked={editingStatus.archived} onChange={handleEditInputChange} />
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button className="bg-teal-500 text-white px-3 py-1 rounded mr-2" onClick={handleSaveEdit}>Save</button>
                    <button className="text-gray-500 hover:underline" onClick={handleCancelEdit}>Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={status.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">
                    <span className="inline-block w-6 h-6 rounded" style={{ background: status.color }}></span>
                  </td>
                  <td className="py-2 px-4">{status.name}</td>
                  <td className="py-2 px-4">{status.slug}</td>
                  <td className="py-2 px-4">{status.closed ? '✓' : ''}</td>
                  <td className="py-2 px-4">{status.archived ? '✓' : ''}</td>
                  <td className="py-2 px-4 text-right">
                    <button className="text-blue-500 hover:underline mr-2" onClick={() => handleEditClick(status)}>Edit</button>
                    <button className="text-red-500 hover:underline mr-2" onClick={() => handleDeleteStatus(status.id)}>Delete</button>
                  </td>
                </tr>
              )
            ))}
            {addingType === type && (
              <tr>
                <td className="py-2 px-4">
                  <input type="color" name="color" value={newStatus.color} onChange={handleInputChange} />
                </td>
                <td className="py-2 px-4">
                  <input type="text" name="name" value={newStatus.name} onChange={handleInputChange} className="border px-2 py-1 rounded w-full" placeholder="Name" />
                </td>
                <td className="py-2 px-4">
                  <input type="text" name="slug" value={newStatus.slug} onChange={handleInputChange} className="border px-2 py-1 rounded w-full" placeholder="Slug" />
                </td>
                <td className="py-2 px-4">
                  <input type="checkbox" name="closed" checked={newStatus.closed} onChange={handleInputChange} />
                </td>
                <td className="py-2 px-4">
                  <input type="checkbox" name="archived" checked={newStatus.archived} onChange={handleInputChange} />
                </td>
                <td className="py-2 px-4 text-right">
                  <button className="bg-teal-500 text-white px-3 py-1 rounded mr-2" onClick={handleAddStatus}>Save</button>
                  <button className="text-gray-500 hover:underline" onClick={() => setAddingType(null)}>Cancel</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-teal-600 mb-2">Statuses</h2>
      <p className="mb-6 text-gray-600">Add, remove or edit the color and name of the statuses your user stories, tasks and issues will go through.</p>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading && <div>Loading...</div>}
      {STATUS_TYPES.map(({ type, label }) => renderTable(type, label))}
    </div>
  );
}

export default Statuses; 