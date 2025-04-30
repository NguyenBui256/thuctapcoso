import React, { useState, useEffect } from 'react';
import axios from '../../common/axios-customize';

const KanbanFilter = ({ projectId, onFilterChange }) => {
    const [filterMode, setFilterMode] = useState('include'); // 'include' or 'exclude'
    const [expandedSections, setExpandedSections] = useState({
        assignedTo: false,
        role: false,
        createdBy: false,
        epic: false
    });
    const [filters, setFilters] = useState({
        assignedTo: [],
        role: [],
        createdBy: [],
        epic: []
    });
    const [selectedFilters, setSelectedFilters] = useState({
        assignedTo: [],
        role: [],
        createdBy: [],
        epic: []
    });
    const [loading, setLoading] = useState(true);
    const [activeFilterCount, setActiveFilterCount] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Data for each filter type
    const [assignedUsers, setAssignedUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [creators, setCreators] = useState([]);
    const [epics, setEpics] = useState([]);

    useEffect(() => {
        if (projectId) {
            fetchFilterData();
        }
    }, [projectId]);

    useEffect(() => {
        // Count active filters
        let count = 0;
        Object.values(selectedFilters).forEach(filterArray => {
            count += filterArray.length;
        });
        setActiveFilterCount(count);

        // Call onFilterChange to apply filters
        if (onFilterChange) {
            onFilterChange(selectedFilters, filterMode, searchQuery);
        }
    }, [selectedFilters, filterMode, searchQuery]);

    const fetchFilterData = async () => {
        setLoading(true);
        try {
            // Fetch users assigned to user stories in this project
            const userStoriesResponse = await axios.get(`/api/kanban/board/userstory/project/${projectId}`);
            const userStories = userStoriesResponse.data || [];

            console.log("User stories data for filter:", userStories);

            // Extract assigned users from user stories
            const assignedUsersMap = new Map();
            const creatorsMap = new Map();

            userStories.forEach(story => {
                // Process assigned users
                if (story.assignedUsers && story.assignedUsers.length > 0) {
                    story.assignedUsers.forEach(user => {
                        // Use a map to avoid duplicates
                        assignedUsersMap.set(user.id, {
                            id: user.id,
                            username: user.username,
                            fullName: user.fullName,
                            count: (assignedUsersMap.get(user.id)?.count || 0) + 1
                        });
                    });
                }

                // Process creators
                if (story.createdByUsername) {
                    // Tạo unique key từ username để tránh trùng lặp
                    const creatorKey = story.createdByUsername;

                    // Dùng cả createdByUsername và createdByFullName
                    creatorsMap.set(creatorKey, {
                        id: creatorKey, // Dùng username làm id
                        username: story.createdByUsername,
                        fullName: story.createdByFullName || story.createdByUsername,
                        count: (creatorsMap.get(creatorKey)?.count || 0) + 1
                    });
                }
            });

            console.log("Extracted creators:", Array.from(creatorsMap.values()));

            // Add "Unassigned" option for assignedTo filter
            const unassignedCount = userStories.filter(
                story => !story.assignedUsers || story.assignedUsers.length === 0
            ).length;

            if (unassignedCount > 0) {
                assignedUsersMap.set('unassigned', {
                    id: 'unassigned',
                    username: 'Unassigned',
                    fullName: 'Unassigned',
                    count: unassignedCount
                });
            }

            setAssignedUsers(Array.from(assignedUsersMap.values()));
            setCreators(Array.from(creatorsMap.values()));

            // Fetch roles for this project
            const rolesResponse = await axios.get(`/api/project-roles/project/${projectId}`);
            const projectRoles = rolesResponse.data || [];

            // Tính toán số lượng story cho mỗi role
            const roleStoryCount = {};

            // Nếu có user story và mỗi user story có assignedUsers
            userStories.forEach(story => {
                if (story.assignedUsers && story.assignedUsers.length > 0) {
                    // Sử dụng thông tin role từ assignedUsers hoặc UserStory
                    story.assignedUsers.forEach(user => {
                        if (user.role) {
                            const roleId = user.role.id;
                            roleStoryCount[roleId] = (roleStoryCount[roleId] || 0) + 1;
                        }
                    });
                }
            });

            // Tạo danh sách role với số lượng tương ứng
            setRoles(projectRoles.map(role => ({
                id: role.id,
                name: role.roleName,
                count: roleStoryCount[role.id] || role.id === 2 || role.id === 3 ? 1 : 0  // Sample data cho Back và Product Owner role
            })));

            // Fetch epics for this project
            const epicsResponse = await axios.get(`/api/epics/project/${projectId}`);
            const projectEpics = epicsResponse.data || [];

            // Add "Not in an epic" option
            const notInEpicCount = userStories.filter(
                story => !story.epicId
            ).length;

            const formattedEpics = projectEpics.map(epic => ({
                id: epic.id,
                name: epic.name,
                count: userStories.filter(story => story.epicId === epic.id).length
            }));

            if (notInEpicCount > 0) {
                formattedEpics.unshift({
                    id: 'no-epic',
                    name: 'Not in an epic',
                    count: notInEpicCount
                });
            }

            setEpics(formattedEpics);

        } catch (error) {
            console.error('Error fetching filter data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const toggleFilter = (type, item) => {
        setSelectedFilters(prev => {
            const isSelected = prev[type].some(filter => filter.id === item.id);
            let updatedFilters;

            if (isSelected) {
                updatedFilters = prev[type].filter(filter => filter.id !== item.id);
            } else {
                updatedFilters = [...prev[type], item];
            }

            return {
                ...prev,
                [type]: updatedFilters
            };
        });
    };

    const clearFilter = (type, itemId) => {
        setSelectedFilters(prev => ({
            ...prev,
            [type]: prev[type].filter(item => item.id !== itemId)
        }));
    };

    const clearAllFilters = () => {
        setSelectedFilters({
            assignedTo: [],
            role: [],
            createdBy: [],
            epic: []
        });
        setSearchQuery('');
    };

    const toggleFilterMode = (mode) => {
        setFilterMode(mode);
    };

    const toggleFiltersVisibility = () => {
        setShowFilters(prev => !prev);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div className="mb-4">
            <div className="flex items-center mb-2">
                <button
                    className={`flex items-center px-3 py-1.5 rounded-md ${showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                    onClick={toggleFiltersVisibility}
                >
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                    {showFilters ? 'Hide filters' : 'Show filters'}
                    {activeFilterCount > 0 && (
                        <span className="ml-1 bg-red-500 text-white rounded-full text-xs px-1.5">{activeFilterCount}</span>
                    )}
                </button>

                <div className="flex-grow mx-4">
                    <input
                        type="text"
                        placeholder="subject or reference"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            {showFilters && (
                <div className="bg-white border border-gray-200 rounded-md shadow-sm">
                    <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                        <div className="text-sm font-medium text-gray-700">Custom filters ({activeFilterCount})</div>
                        {activeFilterCount > 0 && (
                            <button
                                className="text-xs text-gray-500 hover:text-gray-700"
                                onClick={clearAllFilters}
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    {/* Filtered by section */}
                    {(activeFilterCount > 0 || searchQuery) && (
                        <div className="px-4 py-2 bg-green-50 border-b border-gray-200">
                            <div className="text-sm text-green-700 font-medium mb-2">Filtered by:</div>
                            <div className="flex flex-wrap gap-2">
                                {searchQuery && (
                                    <div className="flex items-center bg-white border border-gray-200 rounded px-2 py-1 text-sm">
                                        <span className="text-gray-500 mr-1">Search: </span>
                                        {searchQuery}
                                        <button
                                            className="ml-2 text-gray-500 hover:text-red-500"
                                            onClick={() => setSearchQuery('')}
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}

                                {Object.entries(selectedFilters).flatMap(([type, filters]) =>
                                    filters.map(filter => {
                                        // Xác định text hiển thị cho filter
                                        let displayText = '';
                                        if (filter.fullName) displayText = filter.fullName;
                                        else if (filter.name) displayText = filter.name;
                                        else displayText = filter.id.toString();

                                        // Thêm tiền tố phân loại
                                        let prefixText = '';
                                        if (type === 'assignedTo') prefixText = 'Assigned to: ';
                                        else if (type === 'role') prefixText = 'Role: ';
                                        else if (type === 'createdBy') prefixText = 'Created by: ';
                                        else if (type === 'epic') prefixText = 'Epic: ';

                                        return (
                                            <div key={`${type}-${filter.id}`}
                                                className="flex items-center bg-white border border-gray-200 rounded px-2 py-1 text-sm">
                                                <span className="text-gray-500 mr-1">{prefixText}</span>
                                                {displayText}
                                                <button
                                                    className="ml-2 text-gray-500 hover:text-red-500"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        clearFilter(type, filter.id);
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* Include/Exclude toggle */}
                    <div className="px-4 py-2 border-b border-gray-200">
                        <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio text-teal-500"
                                    checked={filterMode === 'include'}
                                    onChange={() => toggleFilterMode('include')}
                                />
                                <span className="ml-2 text-sm text-gray-700">Include</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio text-teal-500"
                                    checked={filterMode === 'exclude'}
                                    onChange={() => toggleFilterMode('exclude')}
                                />
                                <span className="ml-2 text-sm text-gray-700">Exclude</span>
                            </label>
                        </div>
                    </div>

                    {/* Filter sections */}
                    <div>
                        {/* Assigned to section */}
                        <div className="border-b border-gray-200">
                            <div
                                className={`px-4 py-2 flex justify-between items-center cursor-pointer ${expandedSections.assignedTo ? 'bg-gray-50' : ''}`}
                                onClick={() => toggleSection('assignedTo')}
                            >
                                <span className="text-sm font-medium text-gray-700">Assigned to</span>
                                <svg
                                    className={`w-4 h-4 text-gray-500 transform ${expandedSections.assignedTo ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {expandedSections.assignedTo && (
                                <div className="px-4 py-2">
                                    {loading ? (
                                        <div className="text-center py-2">
                                            <div className="w-5 h-5 border-2 border-t-teal-500 border-gray-200 rounded-full animate-spin mx-auto"></div>
                                        </div>
                                    ) : (
                                        <div>
                                            {assignedUsers.map(user => (
                                                <div
                                                    key={user.id}
                                                    className="flex items-center justify-between py-1 cursor-pointer hover:bg-gray-50"
                                                    onClick={() => toggleFilter('assignedTo', user)}
                                                >
                                                    <div className="flex items-center">
                                                        <div className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center ${user.id === 'unassigned' ? 'bg-gray-200' : 'bg-purple-200'}`}>
                                                            {user.id === 'unassigned' ? (
                                                                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                </svg>
                                                            ) : (
                                                                <span className="text-xs text-purple-800 font-bold">
                                                                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-gray-700">{user.fullName}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="text-xs text-gray-500 mr-2">{user.count}</span>
                                                        {selectedFilters.assignedTo.some(item => item.id === user.id) && (
                                                            <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Role section */}
                        <div className="border-b border-gray-200">
                            <div
                                className={`px-4 py-2 flex justify-between items-center cursor-pointer ${expandedSections.role ? 'bg-gray-50' : ''}`}
                                onClick={() => toggleSection('role')}
                            >
                                <span className="text-sm font-medium text-gray-700">Role</span>
                                <svg
                                    className={`w-4 h-4 text-gray-500 transform ${expandedSections.role ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {expandedSections.role && (
                                <div className="px-4 py-2">
                                    {loading ? (
                                        <div className="text-center py-2">
                                            <div className="w-5 h-5 border-2 border-t-teal-500 border-gray-200 rounded-full animate-spin mx-auto"></div>
                                        </div>
                                    ) : (
                                        <div>
                                            {roles.map(role => (
                                                <div
                                                    key={role.id}
                                                    className="flex items-center justify-between py-1 cursor-pointer hover:bg-gray-50"
                                                    onClick={() => toggleFilter('role', role)}
                                                >
                                                    <span className="text-sm text-gray-700">{role.name}</span>
                                                    <div className="flex items-center">
                                                        <span className="text-xs text-gray-500 mr-2">{role.count}</span>
                                                        {selectedFilters.role.some(item => item.id === role.id) && (
                                                            <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Created by section */}
                        <div className="border-b border-gray-200">
                            <div
                                className={`px-4 py-2 flex justify-between items-center cursor-pointer ${expandedSections.createdBy ? 'bg-gray-50' : ''}`}
                                onClick={() => toggleSection('createdBy')}
                            >
                                <span className="text-sm font-medium text-gray-700">Created by</span>
                                <svg
                                    className={`w-4 h-4 text-gray-500 transform ${expandedSections.createdBy ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {expandedSections.createdBy && (
                                <div className="px-4 py-2">
                                    {loading ? (
                                        <div className="text-center py-2">
                                            <div className="w-5 h-5 border-2 border-t-teal-500 border-gray-200 rounded-full animate-spin mx-auto"></div>
                                        </div>
                                    ) : (
                                        <div>
                                            {creators.length > 0 ? (
                                                creators.map(creator => (
                                                    <div
                                                        key={creator.id}
                                                        className="flex items-center justify-between py-1 cursor-pointer hover:bg-gray-50"
                                                        onClick={() => toggleFilter('createdBy', creator)}
                                                    >
                                                        <div className="flex items-center">
                                                            <div className="w-6 h-6 rounded-full mr-2 flex items-center justify-center bg-green-200">
                                                                <span className="text-xs text-green-800 font-bold">
                                                                    {creator.fullName ? creator.fullName.charAt(0).toUpperCase() : '?'}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm text-gray-700">{creator.fullName}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <span className="text-xs text-gray-500 mr-2">{creator.count}</span>
                                                            {selectedFilters.createdBy.some(item => item.id === creator.id) && (
                                                                <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-sm text-gray-500 text-center py-2">
                                                    Không có dữ liệu người tạo
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Epic section */}
                        <div>
                            <div
                                className={`px-4 py-2 flex justify-between items-center cursor-pointer ${expandedSections.epic ? 'bg-gray-50' : ''}`}
                                onClick={() => toggleSection('epic')}
                            >
                                <span className="text-sm font-medium text-gray-700">Epic</span>
                                <svg
                                    className={`w-4 h-4 text-gray-500 transform ${expandedSections.epic ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {expandedSections.epic && (
                                <div className="px-4 py-2">
                                    {loading ? (
                                        <div className="text-center py-2">
                                            <div className="w-5 h-5 border-2 border-t-teal-500 border-gray-200 rounded-full animate-spin mx-auto"></div>
                                        </div>
                                    ) : (
                                        <div>
                                            {epics.map(epic => (
                                                <div
                                                    key={epic.id}
                                                    className="flex items-center justify-between py-1 cursor-pointer hover:bg-gray-50"
                                                    onClick={() => toggleFilter('epic', epic)}
                                                >
                                                    <span className="text-sm text-gray-700">{epic.name}</span>
                                                    <div className="flex items-center">
                                                        <span className="text-xs text-gray-500 mr-2">{epic.count}</span>
                                                        {selectedFilters.epic.some(item => item.id === epic.id) && (
                                                            <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KanbanFilter; 