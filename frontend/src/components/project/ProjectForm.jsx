import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/projectService';

const ProjectForm = ({ projectId, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isPublic: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (projectId) {
            loadProject();
        }
    }, [projectId]);

    const loadProject = async () => {
        try {
            const project = await projectService.getProjectById(projectId);
            setFormData({
                name: project.name,
                description: project.description,
                isPublic: project.isPublic
            });
        } catch (err) {
            setError('Failed to load project');
            console.error('Error loading project:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (projectId) {
                await projectService.updateProject(projectId, formData);
            } else {
                await projectService.createProject(formData);
            }
            onSuccess();
        } catch (err) {
            setError('Failed to save project');
            console.error('Error saving project:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4">
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-2 rounded bg-dark-component text-white"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="w-full p-2 rounded bg-dark-component text-white"
                    rows="4"
                />
            </div>
            <div className="mb-4">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        name="isPublic"
                        checked={formData.isPublic}
                        onChange={handleChange}
                        className="mr-2"
                    />
                    <span className="text-sm">Public Project</span>
                </label>
            </div>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
                {loading ? 'Saving...' : projectId ? 'Update Project' : 'Create Project'}
            </button>
        </form>
    );
};

export default ProjectForm;