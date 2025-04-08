import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/projectService';

const EmailNotifications = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        fetchProjects(currentPage);
    }, [currentPage]);

    const fetchProjects = async (page) => {
        try {
            setLoading(true);
            const response = await projectService.getAllProjects(page, pageSize);
            console.log('API Response:', response); // Debug log

            // Check if response is valid and has the expected structure
            if (!response || !response.data) {
                throw new Error('Invalid response format from server');
            }

            const { content, totalPages: total } = response.data;

            if (!Array.isArray(content)) {
                throw new Error('Projects data is not an array');
            }

            // Fetch notification settings for each project
            const projectsWithSettings = await Promise.all(content.map(async project => {
                try {
                    const setting = await projectService.getProjectNotificationSetting(project.id);
                    console.log(setting);
                    return {
                        ...project,
                        projectName: setting.data.projectName,
                        notification: setting.data.notificationType
                    };
                } catch (err) {
                    console.error(`Error fetching notification setting for project ${project.id}:`, err);
                    return {
                        ...project,
                        notification: 'none'
                    };
                }
            }));

            setProjects(projectsWithSettings);
            console.log(projectsWithSettings);
            setTotalPages(total);
        } catch (err) {
            setError('Failed to load projects');
            console.error('Error loading projects:', err);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationChange = async (projectId, value) => {
        try {
            // Update local state first for immediate UI feedback
            const updatedProjects = projects.map(project =>
                project.id === projectId
                    ? { ...project, notification: value }
                    : project
            );
            setProjects(updatedProjects);

            // Call API to save the notification setting
            await projectService.updateNotificationSetting(projectId, value);
        } catch (err) {
            console.error('Error updating notification settings:', err);
            // Revert changes on error
            fetchProjects(currentPage);
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="text-red-600">{error}</div>
                <button
                    onClick={() => fetchProjects(currentPage)}
                    className="mt-4 bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-teal-500">Email Notifications</h2>

            <div className="mb-8">
                <h3 className="text-lg font-medium mb-4 text-gray-700">Activity</h3>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 font-normal text-gray-600 w-1/3 pl-2">Project</th>
                                <th className="text-center py-3 font-normal text-gray-600">Receive All</th>
                                <th className="text-center py-3 font-normal text-gray-600">Only Involved</th>
                                <th className="text-center py-3 font-normal text-gray-600">No notifications</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map(project => (
                                <tr key={project.id} className="border-b">
                                    <td className="py-3 pl-2">{`${project.projectName}`}</td>
                                    <td className="text-center">
                                        <button
                                            onClick={() => handleNotificationChange(project.id, 'all')}
                                            className={`px-6 py-2 rounded ${project.notification === 'all'
                                                ? 'bg-teal-500 text-white'
                                                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                                }`}
                                        >
                                            All
                                        </button>
                                    </td>
                                    <td className="text-center">
                                        <button
                                            onClick={() => handleNotificationChange(project.id, 'involved')}
                                            className={`px-6 py-2 rounded ${project.notification === 'involved'
                                                ? 'bg-teal-500 text-white'
                                                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                                }`}
                                        >
                                            Involved
                                        </button>
                                    </td>
                                    <td className="text-center">
                                        <button
                                            onClick={() => handleNotificationChange(project.id, 'none')}
                                            className={`px-6 py-2 rounded ${project.notification === 'none'
                                                ? 'bg-teal-500 text-white'
                                                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                                }`}
                                        >
                                            None
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-4 flex justify-between items-center">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                            className={`px-3 py-1 rounded ${currentPage === 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Previous
                        </button>

                        <span className="text-sm text-gray-600">
                            Page {currentPage + 1} of {totalPages}
                        </span>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages - 1}
                            className={`px-3 py-1 rounded ${currentPage >= totalPages - 1
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailNotifications; 