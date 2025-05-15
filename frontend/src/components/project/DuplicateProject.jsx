import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';

const DuplicateProject = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [projectType, setProjectType] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isPublic: true,
        ownerId: localStorage.getItem("userId")
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('Loading projects...');
            const projects = await projectService.getProjectsForDuplication();
            console.log('Projects data:', projects);

            if (!Array.isArray(projects)) {
                console.error('Projects data is not an array:', projects);
                setError('Invalid projects data format');
                setProjects([]);
                return;
            }

            if (projects.length === 0) {
                console.log('No projects found');
                setError('No projects available to duplicate');
            } else {
                console.log('Found projects:', projects);
                setProjects(projects);
            }
        } catch (err) {
            console.error('Error loading projects:', err);
            setError('Failed to load projects');
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const handleProjectSelect = (e) => {
        const projectId = e.target.value;
        setSelectedProject(projectId);
        const selected = projects.find(p => p.id === Number(projectId));
        if (selected) {
            // Determine if the source project has a specific type (Scrum or Kanban)
            let detectedType = null;
            if (selected.projectType) {
                detectedType = selected.projectType.toLowerCase();
            }

            setProjectType(detectedType);
            setFormData({
                name: `${selected.name} (Copy)`,
                description: selected.description,
                isPublic: selected.isPublic,
                ownerId: localStorage.getItem("userId")
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleVisibilityChange = (isPublic) => {
        setFormData(prev => ({
            ...prev,
            isPublic
        }));
    };

    const handleSubmit = async () => {
        if (!selectedProject || !formData.name || !formData.description) {
            setError('Please fill in all required fields');
            return;
        }

        if (!formData.ownerId) {
            // Try to get the userId again
            const userId = localStorage.getItem("userId");
            if (userId) {
                setFormData(prev => ({
                    ...prev,
                    ownerId: userId
                }));
            } else {
                setError('Error: User ID not found. Please try logging in again.');
                return;
            }
        }

        try {
            setLoading(true);
            setError(null);

            console.log('Duplicating project with data:', formData);
            const response = await projectService.duplicateProject(selectedProject, formData);
            console.log('Project duplicated successfully:', response);

            // Get project ID from the response
            let projectId = null;

            // Handle different response formats
            if (response && response.id) {
                projectId = response.id;
            } else if (response && response.data && response.data.id) {
                projectId = response.data.id;
            }

            if (projectId) {
                // Enable corresponding module based on project type if detected
                if (projectType === 'scrum' || projectType === 'kanban') {
                    try {
                        console.log(`Enabling ${projectType} module for project ${projectId}`);
                        // Enable the appropriate module
                        await projectService.enableProjectModules(
                            projectId,
                            [projectType] // Enable only the selected project type module
                        );
                        console.log(`${projectType} module enabled successfully`);
                    } catch (moduleErr) {
                        console.error(`Error enabling ${projectType} module:`, moduleErr);
                        // Continue with navigation even if module enabling fails
                        // The user can enable modules manually later
                    }
                }

                // Luôn chuyển đến trang chi tiết dự án
                navigate(`/projects/${projectId}`);
            } else {
                // Fallback to projects page if no projectId
                navigate('/projects');
            }
        } catch (err) {
            console.error('Error duplicating project:', err);
            let errorMessage = 'Failed to duplicate project';

            // Try to extract a more descriptive error message
            if (err.response?.data?.message) {
                errorMessage = `Error: ${err.response.data.message}`;
            } else if (err.message) {
                errorMessage = `Error: ${err.message}`;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Add a retry button handler
    const handleRetry = () => {
        loadProjects();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-3xl mx-auto px-4 py-10">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-teal-500">Duplicate Project</h1>
                    <p className="text-gray-600 mt-2">Start clean and keep your configuration</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex justify-between items-center">
                        <span>{error}</span>
                        <button
                            onClick={handleRetry}
                            className="ml-4 bg-red-200 hover:bg-red-300 text-red-800 font-bold py-1 px-3 rounded text-sm"
                        >
                            Retry
                        </button>
                    </div>
                )}

                <div className="mb-8">
                    <select
                        value={selectedProject}
                        onChange={handleProjectSelect}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none"
                    >
                        <option value="">Choose an existing project to duplicate</option>
                        {projects && projects.length > 0 ? (
                            projects.map(project => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>No projects available</option>
                        )}
                    </select>
                </div>

                <div className="mb-6">
                    <p className="text-gray-700 mb-2">New project details</p>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Project Name (Required)"
                        className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none"
                    />

                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Project Description (Required)"
                        rows="4"
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none"
                    />
                </div>

                <div className="mb-8">
                    <div className="flex">
                        <button
                            type="button"
                            onClick={() => handleVisibilityChange(true)}
                            className={`flex-1 p-3 rounded-l text-center uppercase text-sm font-medium ${formData.isPublic ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                        >
                            Public Project
                        </button>
                        <button
                            type="button"
                            onClick={() => handleVisibilityChange(false)}
                            className={`flex-1 p-3 rounded-r text-center uppercase text-sm font-medium ${!formData.isPublic ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                        >
                            Private Project
                        </button>
                    </div>
                </div>

                <div className="flex justify-between">
                    <button
                        onClick={() => navigate('/projects/new')}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded uppercase text-sm font-medium hover:bg-gray-300 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-3 bg-teal-400 text-white rounded uppercase text-sm font-medium hover:bg-teal-500 transition-colors"
                    >
                        Create Project
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DuplicateProject; 