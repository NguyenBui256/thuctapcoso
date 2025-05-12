import React, { useState, useEffect } from 'react';
import { FiSave, FiX, FiPlus, FiHelpCircle } from 'react-icons/fi';
import { fetchWithAuth, getCurrentUserId } from '../../../utils/AuthUtils';
import { BASE_API_URL } from '../../../common/constants';
import { useNavigate } from 'react-router-dom';

const ProjectDetails = ({ projectId }) => {
  const navigate = useNavigate();
  const [project, setProject] = useState({
    name: '',
    description: '',
    logo: null,
    ownerUsername: '',
    tags: [],
    isPublic: true
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

          setProject({
            id: data.id,
            name: data.name,
            description: data.description || '',
            logo: data.logoUrl,
            tags: data.tags || [],
            ownerUsername: data.ownerUsername,
            isPrivate: data.isPublic || true
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
        tags: project.tags,
        isLookingForPeople: project.isLookingForPeople,
        lookingForDescription: project.lookingForDescription,
        receiveFeedback: project.receiveFeedback,
        isPrivate: project.isPrivate,
        logoUrl: project.logo
      };

      const response = await fetchWithAuth(
        `${BASE_API_URL}/api/v1/projects/${projectId}`,
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
          owner: updatedProject.owner || project.owner
        });
        // Show success message
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
            logo: reader.result
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
      logo: null
    }));
  };

  const handleVisibilityChange = (isPrivate) => {
    setProject(prev => ({
      ...prev,
      isPrivate
    }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading project details...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Project details</h1>

      <div className="grid grid-cols-3 gap-8">
        {/* Left column - Logo */}
        <div className="col-span-1">
          <div className="flex flex-col items-center">
            <div className="bg-teal-100 w-40 h-40 rounded-md flex items-center justify-center mb-4 overflow-hidden">
              {project.logo ? (
                <img src={project.logo} alt="Project logo" className="w-full h-full object-cover" />
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
                value={project.name}
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
                value={project.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {project.tags.map((tag, index) => (
                  <div key={index} className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddTag} className="flex items-center">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="ml-2 text-teal-500 hover:text-teal-600"
                >
                  Add tag +
                </button>
              </form>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex-shrink-0 overflow-hidden">
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Project owner</p>
                <p className="font-medium">{project.ownerUsername}</p>
                <button className="text-teal-500 text-sm">Change owner</button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">Is this project looking for people?</span>
                  <button className="text-gray-400" title="Show this project in the public listings">
                    <FiHelpCircle size={16} />
                  </button>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={project.isLookingForPeople}
                    onChange={() => handleToggleChange('isLookingForPeople')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {project.isLookingForPeople && (
                <div>
                  <label htmlFor="lookingForDescription" className="block text-sm font-medium text-gray-700 mb-1">Who are you looking for?</label>
                  <input
                    type="text"
                    id="lookingForDescription"
                    name="lookingForDescription"
                    value={project.lookingForDescription}
                    onChange={handleInputChange}
                    placeholder="Tôi cần người giỏi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Receive feedback from Taiga users?</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={project.receiveFeedback}
                    onChange={() => handleToggleChange('receiveFeedback')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="flex justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleVisibilityChange(false)}
                  className={`border border-gray-300 rounded-md px-4 py-2 ${!project.isPrivate ? 'bg-teal-500 text-white' : 'bg-white text-gray-700'}`}
                >
                  PUBLIC PROJECT
                </button>
                <button
                  onClick={() => handleVisibilityChange(true)}
                  className={`border border-gray-300 rounded-md px-4 py-2 ${project.isPrivate ? 'bg-teal-500 text-white' : 'bg-white text-gray-700'}`}
                >
                  PRIVATE PROJECT
                </button>
              </div>
              <div className="flex items-center">
                <button className="text-gray-500 flex items-center gap-1">
                  <FiHelpCircle size={16} />
                  <span className="text-sm">What's the difference between public and private projects?</span>
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