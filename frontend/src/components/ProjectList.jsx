import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { FiLock } from 'react-icons/fi';

const ProjectList = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;

    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
    }, [currentPage]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await projectService.getAllProjects(currentPage, pageSize);
            console.log('API Response:', response); // Debug log

            // Check if response is valid
            if (response && response.data) {
                const projectsData = response.data.content || [];
                const totalPagesData = response.data.totalPages || 0;

                console.log('Projects data:', projectsData); // Debug log
                console.log('Total pages:', totalPagesData); // Debug log

                setProjects(projectsData);
                setTotalPages(totalPagesData);
            } else {
                console.error('Invalid response format:', response);
                setError('Invalid response format from server');
            }
        } catch (err) {
            setError('Failed to fetch projects');
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page - 1);
    };

    const handleCreateProject = () => {
        navigate('/projects/new');
    };

    // Function to determine the color for project icon background
    const getIconColor = (projectId) => {
        const colors = ['bg-blue-200', 'bg-green-200', 'bg-purple-200', 'bg-pink-200'];
        return colors[projectId % colors.length];
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return <div className="text-red-500 text-center">{error}</div>;

    console.log('Current projects state:', projects); // Debug log

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">My projects</h1>
                    <button
                        onClick={handleCreateProject}
                        className="bg-teal-400 text-white px-4 py-2 rounded hover:bg-teal-500 transition-colors uppercase text-sm font-semibold"
                    >
                        New Project
                    </button>
                </div>

                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-3/4 pr-0 md:pr-8">
                        {!projects || projects.length === 0 ? (
                            <div className="bg-white rounded-lg shadow p-6 text-center">
                                <p className="text-gray-500">No projects found. Create your first project!</p>
                            </div>
                        ) : (
                            <div>
                                {projects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="bg-white border-b last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/projects/${project.id}`)}
                                    >
                                        <div className="flex items-center p-4">
                                            <div className={`w-12 h-12 ${getIconColor(project.id)} rounded flex items-center justify-center mr-4`}>
                                                <span className="text-lg font-semibold">
                                                    {project.name.substring(0, 2).toLowerCase()}
                                                </span>
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex items-center">
                                                    <h2 className="text-md font-semibold text-gray-800">{project.name}</h2>
                                                    {!project.isPublic && (
                                                        <FiLock className="ml-2 text-gray-500" size={14} />
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">{project.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-4 flex justify-between items-center">
                                <button
                                    onClick={() => handlePageChange(currentPage)}
                                    disabled={currentPage === 0}
                                    className={`px-3 py-1 rounded ${currentPage === 0
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    Previous
                                </button>

                                <span className="text-sm text-gray-600">
                                    Page {currentPage + 1} of {totalPages}
                                </span>

                                <button
                                    onClick={() => handlePageChange(currentPage + 2)}
                                    disabled={currentPage === totalPages - 1}
                                    className={`px-3 py-1 rounded ${currentPage === totalPages - 1
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="w-full md:w-1/4 mt-6 md:mt-0">
                        <div className="bg-white rounded-lg p-4 text-sm text-gray-600">
                            <p>Reorder your projects to set at the top the most used ones.</p>
                            <p className="mt-2">The top 4 projects will appear in the top navigation bar project list</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectList;
