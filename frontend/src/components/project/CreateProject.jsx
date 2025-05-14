import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectService } from '../../services/projectService';

const projectTypeInfo = {
    scrum: {
        name: 'Scrum',
        description: 'Prioritize and solve your tasks in short time cycles.',
        icon: (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 10V16L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    },
    kanban: {
        name: 'Kanban',
        description: 'Keep a constant workflow on independent tasks',
        icon: (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M26 4H6C4.89543 4 4 4.89543 4 6V26C4 27.1046 4.89543 28 6 28H26C27.1046 28 28 27.1046 28 26V6C28 4.89543 27.1046 4 26 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 10H28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 16H28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 22H28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    },
    duplicate: {
        name: 'Duplicate Project',
        description: 'Start clean and keep your configuration',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        )
    },
    import: {
        name: 'Import Project',
        description: 'Import your project from multiple platforms into Taiga',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
        )
    }
};

const CreateProject = () => {
    const navigate = useNavigate();
    const { projectType } = useParams();
    const typeInfo = projectTypeInfo[projectType];

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isPublic: true,
        logoUrl: '',
        type: projectType.toUpperCase(),
        projectType: projectType.toUpperCase(),
        ownerId: localStorage.getItem("userId")
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!typeInfo) {
        navigate('/projects/new');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await projectService.createProject(formData);
            console.log('Project created:', response);

            // Lấy projectId từ phản hồi API
            // API trả về đối tượng Project trực tiếp
            const projectId = response && response.id;

            if (projectId) {
                // Chuyển hướng đến trang tương ứng dựa trên loại project
                if (projectType === 'scrum') {
                    navigate(`/projects/${projectId}/backlog`);
                } else if (projectType === 'kanban') {
                    navigate(`/projects/${projectId}/kanban`);
                } else {
                    // Mặc định nếu không phải scrum hoặc kanban
                    navigate(`/projects/${projectId}`);
                }
            } else {
                // Nếu không có projectId, chuyển về trang projects
                navigate('/projects');
            }
        } catch (err) {
            setError('Failed to create project');
            console.error('Error creating project:', err);
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

    const handleVisibilityChange = (isPublic) => {
        setFormData(prev => ({
            ...prev,
            isPublic
        }));
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-3xl mx-auto px-4 py-10">
                <div className="text-center mb-6">
                    <div className="inline-block mb-2">
                        {typeInfo.icon}
                    </div>
                    <h1 className="text-3xl font-bold text-teal-500">{typeInfo.name}</h1>
                    <p className="text-gray-600 mt-2">{typeInfo.description}</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <div className="mb-6">
                    <p className="text-gray-700 mb-2">New project details</p>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Project Name (Required)"
                        required
                        className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none"
                    />

                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Project Description (Required)"
                        required
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
                            <div className="flex justify-center items-center space-x-2">
                                <span>Public Project</span>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleVisibilityChange(false)}
                            className={`flex-1 p-3 rounded-r text-center uppercase text-sm font-medium ${!formData.isPublic ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                        >
                            <div className="flex justify-center items-center space-x-2">
                                <span>Private Project</span>
                            </div>
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
                        disabled={loading}
                        className="px-6 py-3 bg-teal-400 text-white rounded uppercase text-sm font-medium hover:bg-teal-500 transition-colors disabled:bg-teal-300"
                    >
                        {loading ? 'Creating...' : 'Create Project'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateProject;
