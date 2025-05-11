import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { FiEye, FiUserCheck, FiUsers, FiLock } from 'react-icons/fi';

const ProjectsDashboard = () => {
    const [assignedProjects, setAssignedProjects] = useState([]);
    const [watchedProjects, setWatchedProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const [assignedData, watchedData] = await Promise.all([
                projectService.getAssignedProjects(),
                projectService.getWatchedProjects()
            ]);

            console.log('Assigned projects response:', assignedData);
            console.log('Watched projects response:', watchedData);

            // Make sure we're getting the correct data structure and it's an array
            const assignedArray = Array.isArray(assignedData.data) ? assignedData.data :
                (assignedData.data?.data || []);

            const watchedArray = Array.isArray(watchedData.data) ? watchedData.data :
                (watchedData.data?.data || []);

            setAssignedProjects(assignedArray);
            setWatchedProjects(watchedArray);
        } catch (err) {
            setError('Failed to fetch projects');
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleManageProjects = () => {
        navigate('/projects/manage');
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
                    <h1 className="text-2xl font-bold text-gray-800">Projects Dashboard</h1>
                    <button
                        onClick={handleManageProjects}
                        className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition-colors flex items-center"
                    >
                        <FiUsers className="mr-2" /> MANAGE PROJECTS
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Assigned Projects */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center mb-4">
                            <FiUserCheck className="text-teal-500 mr-2" size={20} />
                            <h2 className="text-xl font-semibold">Working on</h2>
                        </div>

                        {!assignedProjects || assignedProjects.length === 0 ? (
                            <div className="text-center text-gray-500 py-6">
                                <p>You have no hidden items</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {assignedProjects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="flex items-center p-3 border-b hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/projects/${project.id}`)}
                                    >
                                        <div className={`w-10 h-10 ${getIconColor(project.id)} rounded-full flex items-center justify-center mr-3`}>
                                            <span className="text-sm font-semibold">
                                                {project.name ? project.name.substring(0, 2).toUpperCase() : 'P'}
                                            </span>
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center">
                                                <h3 className="font-medium text-gray-800">{project.name || 'Unnamed Project'}</h3>
                                                {project.isPublic === false && (
                                                    <FiLock className="ml-2 text-gray-500" size={14} />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 truncate">{project.description || 'No description'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Watched Projects */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center mb-4">
                            <FiEye className="text-blue-500 mr-2" size={20} />
                            <h2 className="text-xl font-semibold">Watching</h2>
                        </div>

                        {!watchedProjects || watchedProjects.length === 0 ? (
                            <div className="text-center text-gray-500 py-6">
                                <p>You have no hidden items</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {watchedProjects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="flex items-center p-3 border-b hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/projects/${project.id}`)}
                                    >
                                        <div className={`w-10 h-10 ${getIconColor(project.id)} rounded-full flex items-center justify-center mr-3`}>
                                            <span className="text-sm font-semibold">
                                                {project.name ? project.name.substring(0, 2).toUpperCase() : 'P'}
                                            </span>
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center">
                                                <h3 className="font-medium text-gray-800">{project.name || 'Unnamed Project'}</h3>
                                                {project.isPublic === false && (
                                                    <FiLock className="ml-2 text-gray-500" size={14} />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 truncate">{project.description || 'No description'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectsDashboard; 