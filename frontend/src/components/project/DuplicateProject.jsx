import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';

const DuplicateProject = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isPublic: true
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
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
            setFormData({
                name: `${selected.name} (Copy)`,
                description: selected.description,
                isPublic: selected.isPublic
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

        try {
            await projectService.duplicateProject(selectedProject, formData);
            navigate('/projects');
        } catch (err) {
            setError('Failed to duplicate project');
            console.error('Error duplicating project:', err);
        }
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
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
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