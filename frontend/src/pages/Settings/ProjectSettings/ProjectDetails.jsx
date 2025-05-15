import React, { useState, useEffect } from 'react';
import { FiSave, FiX, FiPlus, FiHelpCircle } from 'react-icons/fi';
import { fetchWithAuth, getCurrentUserId } from '../../../utils/AuthUtils';
import { BASE_API_URL } from '../../../common/constants';
import { useNavigate } from 'react-router-dom';

const ProjectDetails = ({ projectId }) => {
  const navigate = useNavigate();
  const [project, setProject] = useState({
    id: null,
    name: '',
    description: '',
    logoUrl: null,
    ownerUsername: '',
    ownerId: null,
    isPublic: true,
    createdAt: null,
    updatedAt: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState(null);
  const userId = getCurrentUserId();

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchWithAuth(
          `${BASE_API_URL}/v1/projects/${projectId}`,
          `/projects/${projectId}/settings`,
          true
        );

        if (response && response.ok) {
          const data = await response.json();
          const projectData = data.data;
          setProject({
            id: projectData.id,
            name: projectData.name || '',
            description: projectData.description || '',
            logoUrl: projectData.logoUrl,
            ownerUsername: projectData.ownerUsername || '',
            ownerId: projectData.ownerId || null,
            isPublic: projectData.isPublic,
            createdAt: projectData.createdAt,
            updatedAt: projectData.updatedAt
          });
        } else {
          setError('Failed to fetch project details. Please try again.');
        }
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError('An error occurred while fetching project details.');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleChange = (name) => {
    setProject(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim()) {
      setProject(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setProject(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSaveProject = async () => {
    try {
      setSaving(true);
      setError(null);

      const projectDTO = {
        name: project.name,
        description: project.description,
        isPublic: project.isPublic,
        logoUrl: project.logoUrl
      };

      const response = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}`,
        `/projects/${projectId}/settings`,
        true,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(projectDTO)
        }
      );

      if (response && response.ok) {
        const updatedProject = await response.json();
        setProject({
          ...project,
          ...updatedProject,
          ownerUsername: updatedProject.ownerUsername || project.ownerUsername
        });
        alert('Project updated successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update project. Please try again.');
      }
    } catch (err) {
      console.error('Error updating project:', err);
      setError('An error occurred while updating the project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        setLoading(true);

        const response = await fetchWithAuth(
          `${BASE_API_URL}/api/v1/projects/${projectId}`,
          `/projects`,
          true,
          {
            method: 'DELETE'
          }
        );

        if (response && response.ok) {
          alert('Project deleted successfully!');
          // Navigate to projects page
          navigate('/projects');
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to delete project. Please try again.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error deleting project:', err);
        setError('An error occurred while deleting the project.');
        setLoading(false);
      }
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // For now, just read it as data URL for preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setProject(prev => ({
            ...prev,
            logoUrl: reader.result
          }));
        };
        reader.readAsDataURL(file);

        // In a real implementation, you would upload the file to the server
        // and get back a URL to store in the project object
      } catch (err) {
        console.error('Error handling logo change:', err);
        setError('Error uploading logo. Please try again.');
      }
    }
  };

  const handleUseDefaultLogo = () => {
    setProject(prev => ({
      ...prev,
      logoUrl: null
    }));
  };

  const handleVisibilityChange = (isPublic) => {
    setProject(prev => ({
      ...prev,
      isPublic
    }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading project details...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Project details</h1>

      <div className="grid grid-cols-3 gap-8">
        {/* Left column - Logo */}
        <div className="col-span-1">
          <div className="flex flex-col items-center">
            <div className="bg-teal-100 w-40 h-40 rounded-md flex items-center justify-center mb-4 overflow-hidden">
              {project.logoUrl ? (
                <img src={project.logoUrl} alt="Project logo" className="w-full h-full object-cover" />
              ) : (
                <div className="grid grid-cols-4 grid-rows-4 gap-1 p-2 w-full h-full">
                  {Array(16).fill().map((_, i) => (
                    <div key={i} className={`bg-teal-${Math.random() > 0.5 ? '400' : '200'} rounded-sm`}></div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => document.getElementById('logo-upload').click()}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mb-2 w-full text-center"
            >
              CHANGE LOGO
            </button>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
            <button
              onClick={handleUseDefaultLogo}
              className="text-teal-500 text-sm mb-4"
            >
              Use default image
            </button>
          </div>
        </div>

        {/* Right column - Project details form */}
        <div className="col-span-2">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Project name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={project.name || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={project.description || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex-shrink-0 overflow-hidden">
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Project owner</p>
                {project.ownerUsername && project.ownerId ? (
                  <a
                    href={`/users/${project.ownerId}`}
                    className="font-medium text-teal-600 hover:underline"
                  >
                    {project.ownerUsername}
                  </a>
                ) : (
                  <span className="font-medium">Unknown</span>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleVisibilityChange(true)}
                  className={`border border-gray-300 rounded-md px-4 py-2 ${project.isPublic ? 'bg-teal-500 text-white' : 'bg-white text-gray-700'}`}
                >
                  PUBLIC PROJECT
                </button>
                <button
                  onClick={() => handleVisibilityChange(false)}
                  className={`border border-gray-300 rounded-md px-4 py-2 ${!project.isPublic ? 'bg-teal-500 text-white' : 'bg-white text-gray-700'}`}
                >
                  PRIVATE PROJECT
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <button
                onClick={handleSaveProject}
                disabled={saving}
                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'SAVING...' : 'SAVE'}
              </button>

              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={handleDeleteProject}
                  className="text-red-500 hover:text-red-600"
                >
                  Delete this project
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails; 