import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { FiLock, FiPlus } from 'react-icons/fi';

const ManageProjects = () => {
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

            // Fetch all joined projects
            const projectsData = await projectService.getJoinedProjects();
            console.log('Joined projects data:', projectsData);

            // Ensure data is in the correct format
            const projectsArray = Array.isArray(projectsData.data) ? projectsData.data :
                (projectsData.data?.data || []);

            // Client-side pagination
            const totalItems = projectsArray.length || 0;
            const startIdx = currentPage * pageSize;
            const endIdx = startIdx + pageSize;
            const paginatedProjects = projectsArray.slice(startIdx, endIdx) || [];
            const calculatedTotalPages = Math.ceil(totalItems / pageSize);

            setProjects(paginatedProjects);
            setTotalPages(calculatedTotalPages);
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
        const colors = ['bg-blue-200', 'bg-green-200', 'bg-purple-200', 'bg-pink-200', 'bg-yellow-200', 'bg-teal-200'];
        return colors[projectId % colors.length];
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
        </div>
    );

    if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Manage Projects</h1>
                    <button
                        onClick={handleCreateProject}
                        className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition-colors flex items-center"
                    >
                        <FiPlus className="mr-2" /> NEW PROJECT
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow">
                    {!projects || projects.length === 0 ? (
                        <div className="p-6 text-center">
                            <p className="text-gray-500">No projects found. Create your first project!</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                >
                                    <div className="flex items-center p-4">
                                        <div className={`w-12 h-12 ${getIconColor(project.id)} rounded flex items-center justify-center mr-4`}>
                                            <span className="text-lg font-semibold">
                                                {project.logoUrl ? (
                                                    <img src={project.logoUrl} alt="Project Logo" className="w-full h-full object-cover" />
                                                ) : (
                                                    project.name ? project.name.substring(0, 2).toUpperCase() : 'P'
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center">
                                                <h2 className="text-md font-semibold text-gray-800">{project.name || 'Unnamed Project'}</h2>
                                                {project.isPublic === false && (
                                                    <FiLock className="ml-2 text-gray-500" size={14} />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500">{project.description || 'No description'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 flex justify-between items-center border-t">
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
            </div>
        </div>
    );
};

export default ManageProjects; 