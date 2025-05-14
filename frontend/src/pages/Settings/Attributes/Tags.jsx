import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../../utils/AuthUtils';
import { BASE_API_URL } from '../../../common/constants';

const defaultTag = {
  color: '#cccccc',
  name: ''
};

function Tags({ projectId }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTag, setNewTag] = useState(defaultTag);
  const [editingTag, setEditingTag] = useState(null);

  const fetchTags = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching tags for project: ${projectId}`);
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/tags`,
        null,
        true
      );
      if (res && res.ok) {
        const responseJson = await res.json();
        console.log('Tags response:', responseJson);
        
        // Handle the API response format
        if (responseJson.statusCode === 200 && responseJson.data) {
          // Use the data array from the response
          setTags(Array.isArray(responseJson.data) ? responseJson.data : []);
        } else {
          // Fallback to the old format
          setTags(Array.isArray(responseJson) ? responseJson : []);
        }
      } else {
        console.error(`Error fetching tags:`, res.status, res.statusText);
        setTags([]);
      }
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError('Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchTags();
    // eslint-disable-next-line
  }, [projectId]);

  const handleAddClick = () => {
    setIsAdding(true);
    setNewTag({
      ...defaultTag,
      name: '',
      color: '#cccccc'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTag((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = async () => {
    if (!newTag.name) {
      setError('Tag name is required');
      return;
    }

    console.log('Sending tag:', newTag);

    try {
      setLoading(true);
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/tags`,
        null,
        true,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTag)
        }
      );
      
      if (res && res.ok) {
        setIsAdding(false);
        fetchTags();
        setError(null);
      } else {
        try {
          const errorResponse = await res.text();
          console.error('Error response:', errorResponse);
          setError(`Failed to add tag: ${errorResponse || res.statusText}`);
        } catch {
          setError(`Failed to add tag: ${res.statusText}`);
        }
      }
    } catch (err) {
      console.error('Error adding tag:', err);
      setError('Failed to add tag: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (tag) => {
    setEditingTag({...tag});
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingTag((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateTag = async (tagId, updated) => {
    if (!updated.name) {
      setError('Tag name is required');
      return;
    }

    try {
      setLoading(true);
      console.log(`Updating tag ${tagId}:`, updated);
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/tags/${tagId}`,
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
        fetchTags();
        setError(null);
      } else {
        try {
          const errorResponse = await res.text();
          console.error('Error updating tag:', errorResponse);
          setError(`Failed to update tag: ${errorResponse || res.statusText}`);
        } catch {
          setError(`Failed to update tag: ${res.statusText}`);
        }
      }
    } catch (err) {
      console.error('Error updating tag:', err);
      setError('Failed to update tag: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingTag.name) {
      setError('Tag name is required');
      return;
    }

    await handleUpdateTag(editingTag.id, editingTag);
    setEditingTag(null);
  };

  const handleDeleteTag = async (tagId) => {
    if (!window.confirm('Delete this tag?')) return;
    
    try {
      setLoading(true);
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/tags/${tagId}`,
        null,
        true,
        { method: 'DELETE' }
      );
      
      if (res && res.ok) {
        fetchTags();
        setError(null);
      } else {
        try {
          const errorResponse = await res.text();
          console.error('Error deleting tag:', errorResponse);
          setError(`Failed to delete tag: ${errorResponse || res.statusText}`);
        } catch {
          setError(`Failed to delete tag: ${res.statusText}`);
        }
      }
    } catch (err) {
      console.error('Error deleting tag:', err);
      setError('Failed to delete tag: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-teal-600 mb-2">Tags</h2>
      <p className="mb-6 text-gray-600">Specify the tags for your issues.</p>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading && <div>Loading...</div>}
      
      <div className="mb-8">
        <div className="flex items-center justify-between bg-gray-200 px-4 py-2 rounded-t">
          <span className="font-semibold text-base">TAGS</span>
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
            {tags.map((tag) => (
              editingTag && editingTag.id === tag.id ? (
                <tr key={tag.id} className="border-b bg-gray-50">
                  <td className="py-2 px-4">
                    <input type="color" name="color" value={editingTag.color} onChange={handleEditInputChange} />
                  </td>
                  <td className="py-2 px-4">
                    <input type="text" name="name" value={editingTag.name} onChange={handleEditInputChange} className="border px-2 py-1 rounded w-full" placeholder="Name" />
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button className="bg-teal-500 text-white px-3 py-1 rounded mr-2" onClick={handleSaveEdit}>Save</button>
                    <button className="text-gray-500 hover:underline" onClick={handleCancelEdit}>Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={tag.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">
                    <span className="inline-block w-6 h-6 rounded" style={{ background: tag.color }}></span>
                  </td>
                  <td className="py-2 px-4">{tag.name}</td>
                  <td className="py-2 px-4 text-right">
                    <button className="text-blue-500 hover:underline mr-2" onClick={() => handleEditClick(tag)}>Edit</button>
                    <button className="text-red-500 hover:underline mr-2" onClick={() => handleDeleteTag(tag.id)}>Delete</button>
                  </td>
                </tr>
              )
            ))}
            {isAdding && (
              <tr>
                <td className="py-2 px-4">
                  <input type="color" name="color" value={newTag.color} onChange={handleInputChange} />
                </td>
                <td className="py-2 px-4">
                  <input type="text" name="name" value={newTag.name} onChange={handleInputChange} className="border px-2 py-1 rounded w-full" placeholder="Name" />
                </td>
                <td className="py-2 px-4 text-right">
                  <button className="bg-teal-500 text-white px-3 py-1 rounded mr-2" onClick={handleAddTag}>Save</button>
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

export default Tags; 