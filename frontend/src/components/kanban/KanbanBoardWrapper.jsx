import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from '../../common/axios-customize';
import CreateUserStoryModal from './CreateUserStoryModal';

const KanbanBoardWrapper = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [columns, setColumns] = useState([]);
    const [swimlanes, setSwimlanes] = useState([]);
    const [userStories, setUserStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [zoomLevel, setZoomLevel] = useState('compact');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newSwimlaneName, setNewSwimlaneName] = useState('');
    const [showUserStoryModal, setShowUserStoryModal] = useState(false);
    const [modalInitialStatus, setModalInitialStatus] = useState('NEW');
    const [modalInitialSwimlaneId, setModalInitialSwimlaneId] = useState(null);
    const [expandedColumns, setExpandedColumns] = useState({});
    const [draggingItemId, setDraggingItemId] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            if (!projectId) {
                setError('Invalid project ID');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const swimlanesResponse = await axios.get(`/api/kanban-swimlands/project/${projectId}`);
                const fetchedSwimlanes = swimlanesResponse.data?.map(lane => ({
                    ...lane,
                    expanded: true
                })) || [];

                if (fetchedSwimlanes.length === 0) {
                    setSwimlanes([]);
                    setColumns([]);
                    setUserStories([]);
                    setLoading(false);
                    return;
                }

                const defaultColumns = [
                    { id: 1, name: 'NEW', status: 1, color: 'bg-blue-400' },
                    { id: 2, name: 'READY', status: 2, color: 'bg-red-500' },
                    { id: 3, name: 'IN PROGRESS', status: 3, color: 'bg-orange-400' },
                    { id: 4, name: 'READY FOR TEST', status: 4, color: 'bg-yellow-400' },
                    { id: 5, name: 'DONE', status: 5, color: 'bg-green-500' },
                    { id: 6, name: 'ARCHIVED', status: 6, color: 'bg-gray-400' }
                ];

                // Initialize all columns as expanded
                const initialExpandedState = {};
                defaultColumns.forEach(col => {
                    initialExpandedState[col.id] = true;
                });
                setExpandedColumns(initialExpandedState);

                const userStoriesResponse = await axios.get(`/api/kanban/board/userstory/project/${projectId}`);
                const fetchedUserStories = userStoriesResponse.data || [];

                // Associate user stories with valid swimlanes
                if (fetchedUserStories.length > 0 && fetchedSwimlanes.length > 0) {
                    // Check if there are stories with swimlaneId that doesn't exist in fetchedSwimlanes
                    const validSwimlaneIds = fetchedSwimlanes.map(lane => lane.id);
                    const fixedUserStories = fetchedUserStories.map(story => {
                        if (!validSwimlaneIds.includes(story.swimlaneId)) {
                            return {
                                ...story,
                                swimlaneId: fetchedSwimlanes[0].id // Assign to first swimlane if invalid
                            };
                        }
                        return story;
                    });
                    setUserStories(fixedUserStories);
                } else {
                    setUserStories(fetchedUserStories);
                }

                setSwimlanes(fetchedSwimlanes);
                setColumns(defaultColumns);

            } catch (error) {
                console.error('Error fetching kanban data:', error);
                setError('Failed to load Kanban board data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [projectId, refreshTrigger]);

    const handleCreateSwimland = async (e) => {
        e.preventDefault();
        if (!newSwimlaneName.trim()) return;

        try {
            const response = await axios.post('/api/kanban-swimlands', {
                name: newSwimlaneName,
                projectId: parseInt(projectId),
                order: swimlanes.length + 1
            });

            setSwimlanes([...swimlanes, { ...response.data, expanded: true }]);
            setNewSwimlaneName("");
            setShowCreateModal(false);
        } catch (error) {
            console.error('Error creating swimlane:', error);
            alert('Failed to create swimlane. Please try again.');
        }
    };

    const toggleSwimLane = (swimlaneId) => {
        setSwimlanes(swimlanes.map(lane =>
            lane.id === swimlaneId ? { ...lane, expanded: !lane.expanded } : lane
        ));
    };

    const toggleColumn = (columnId) => {
        setExpandedColumns(prev => ({
            ...prev,
            [columnId]: !prev[columnId]
        }));
    };

    const onDragStart = (start) => {
        const id = start.draggableId.split('-')[1];
        setDraggingItemId(id);
        document.body.classList.add('is-dragging');
    };

    const onDragEnd = async (result) => {
        setDraggingItemId(null);
        document.body.classList.remove('is-dragging');

        const { destination, source, draggableId } = result;

        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
            return;
        }

        try {
            const userStoryId = parseInt(draggableId.split('-')[1]);
            const [_, columnId, __, swimlaneId] = destination.droppableId.split('-');
            const newStatusId = parseInt(columnId);
            const newSwimlaneId = parseInt(swimlaneId);

            // Add the position parameter for exact placement
            const position = destination.index;

            // Optimistically update the UI while preserving exact position
            const updatedUserStories = [...userStories];
            const storyIndex = updatedUserStories.findIndex(story => story.id === userStoryId);

            if (storyIndex !== -1) {
                const movedStory = { ...updatedUserStories[storyIndex] };

                // Remove the story from its current position
                updatedUserStories.splice(storyIndex, 1);

                // Update status and swimlane
                movedStory.statusId = newStatusId;
                movedStory.swimlaneId = newSwimlaneId;

                // Insert at the exact position in the destination
                const storiesInDestination = updatedUserStories.filter(
                    story => story.statusId === newStatusId && story.swimlaneId === newSwimlaneId
                );

                if (position === 0) {
                    // Place at beginning of destination stories
                    const insertAt = updatedUserStories.findIndex(
                        story => story.statusId === newStatusId && story.swimlaneId === newSwimlaneId
                    );

                    if (insertAt === -1) {
                        // No stories in destination yet, just append
                        updatedUserStories.push(movedStory);
                    } else {
                        updatedUserStories.splice(insertAt, 0, movedStory);
                    }
                } else if (position >= storiesInDestination.length) {
                    // Place at end of destination stories
                    const lastStoryIndex = updatedUserStories.findIndex(
                        story => story.statusId === newStatusId &&
                            story.swimlaneId === newSwimlaneId &&
                            storiesInDestination[storiesInDestination.length - 1]?.id === story.id
                    );

                    if (lastStoryIndex === -1) {
                        // No stories or couldn't find last one, just append
                        updatedUserStories.push(movedStory);
                    } else {
                        updatedUserStories.splice(lastStoryIndex + 1, 0, movedStory);
                    }
                } else {
                    // Place at specific position
                    const targetStoryId = storiesInDestination[position]?.id;
                    const targetIndex = updatedUserStories.findIndex(
                        story => story.id === targetStoryId
                    );

                    if (targetIndex === -1) {
                        // Fallback if we can't find the target position
                        updatedUserStories.push(movedStory);
                    } else {
                        updatedUserStories.splice(targetIndex, 0, movedStory);
                    }
                }
            }

            setUserStories(updatedUserStories);

            // Update backend with the position information
            await axios.put(`/api/kanban/board/userstory/${userStoryId}/position`, {
                statusId: newStatusId,
                swimlaneId: newSwimlaneId,
                position: position
            });

        } catch (error) {
            console.error('Error updating user story position:', error);
            // On error, refresh from server
            const userStoriesResponse = await axios.get(`/api/kanban/board/userstory/project/${projectId}`);
            setUserStories(userStoriesResponse.data || []);
        }
    };

    const getUserStoriesForColumn = (columnStatus, swimlaneId) => {
        return userStories.filter(story =>
            story.statusId === columnStatus && story.swimlaneId === swimlaneId
        );
    };

    const renderUserStories = (columnStatus, swimlaneId) => {
        const stories = getUserStoriesForColumn(columnStatus, swimlaneId);
        return stories.map((story, index) => (
            <Draggable
                key={`story-${story.id}`}
                draggableId={`story-${story.id}`}
                index={index}
            >
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`bg-white border border-gray-200 rounded mb-2 cursor-pointer ${snapshot.isDragging ? 'shadow-lg' : ''} ${zoomLevel !== 'compact' ? 'p-3' : 'p-2'}`}
                        onClick={() => navigate(`/projects/${projectId}/userstory/${story.id}`)}
                        style={{
                            ...provided.draggableProps.style,
                            opacity: draggingItemId === story.id.toString() && !snapshot.isDragging ? 0.5 : 1,
                            transform: provided.draggableProps.style?.transform,
                        }}
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-teal-600 font-medium">
                                #{story.id} {zoomLevel !== 'compact' && story.name}
                            </span>
                            <div className={`${zoomLevel === 'compact' ? 'w-6 h-6' : 'w-7 h-7'} ${story.id % 3 === 0 ? 'bg-gray-200' : 'bg-pink-200'} rounded-full flex items-center justify-center`}></div>
                        </div>

                        {/* Additional content based on zoom level */}
                        {zoomLevel !== 'compact' && (
                            <div className="mt-2">
                                <div className="flex items-center mt-1">
                                    <div className="w-6 h-6 bg-gray-100 rounded-full mr-2"></div>
                                    <span className="text-xs text-gray-500">Not assigned</span>
                                </div>

                                {zoomLevel === 'expanded' && story.description && (
                                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{story.description}</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Draggable>
        ));
    };

    const countStoriesInColumn = (columnStatus) => {
        return userStories.filter(story => story.statusId === columnStatus).length;
    };

    const handleOpenUserStoryModal = (status, swimlaneId) => {
        // Convert status name to status id
        const statusMap = {
            'NEW': 1,
            'READY': 2,
            'IN PROGRESS': 3,
            'READY FOR TEST': 4,
            'DONE': 5,
            'ARCHIVED': 6
        };
        setModalInitialStatus(statusMap[status] || 1);
        setModalInitialSwimlaneId(swimlaneId);
        setShowUserStoryModal(true);
    };

    const handleCloseUserStoryModal = (wasCreated = false) => {
        setShowUserStoryModal(false);
        if (wasCreated) {
            // Trigger refresh by incrementing refreshTrigger
            setRefreshTrigger(prev => prev + 1);
        }
    };

    const renderCreateSwimlaneModal = () => (
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full ${showCreateModal ? '' : 'hidden'}`}>
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Swimlane</h3>
                    <form onSubmit={handleCreateSwimland} className="mt-4">
                        <input
                            type="text"
                            value={newSwimlaneName}
                            onChange={(e) => setNewSwimlaneName(e.target.value)}
                            placeholder="Enter swimlane name"
                            className="w-full p-2 border rounded"
                            required
                        />
                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                            >
                                Create
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    // Add CSS for better drag and drop appearance
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            .task-card-dragging {
                opacity: 0.9 !important;
                transform: rotate(1deg);
                box-shadow: 0 5px 10px rgba(0,0,0,0.2) !important;
            }
            .column-drop-target-active {
                background-color: rgba(59, 130, 246, 0.1) !important;
                transition: background-color 0.2s ease;
            }
            .vertical-label {
                writing-mode: vertical-lr;
                transform: rotate(180deg);
                position: absolute;
                right: 0;
                top: 0;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 2px;
                font-size: 0.7rem;
                letter-spacing: 0.05em;
                font-weight: 500;
                z-index: 10;
            }
            
            /* Improved drop target indicator */
            .react-beautiful-dnd-placeholder {
                background-color: rgba(203, 213, 225, 0.4) !important;
                border: 2px dashed #64748b !important;
                margin-bottom: 8px !important;
                border-radius: 0.25rem !important;
            }
            
            /* CSS for proper dropdown positioning */
            .header-dropdown {
                position: absolute;
                top: auto;
                bottom: 100%;
                right: 0;
                margin-bottom: 5px;
                z-index: 50;
                box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
                border-radius: 0.375rem;
                background-color: white;
                border: 1px solid #e5e7eb;
                min-width: 10rem;
            }
            
            /* For dropdown arrows pointing down */
            .dropdown-arrow:after {
                content: '';
                position: absolute;
                bottom: -5px;
                right: 10px;
                width: 10px;
                height: 10px;
                background-color: white;
                transform: rotate(45deg);
                border-bottom: 1px solid #e5e7eb;
                border-right: 1px solid #e5e7eb;
            }
            
            /* General dropdown styling for all components */
            .dropdown-menu {
                position: absolute;
                bottom: 100%;
                right: 0;
                margin-bottom: 5px;
                z-index: 50;
                box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
                border-radius: 0.375rem;
                background-color: white;
                border: 1px solid #e5e7eb;
                min-width: 12rem;
            }
            
            /* Dropdown arrow for all dropdowns */
            .dropdown-arrow-down:after {
                content: '';
                position: absolute;
                bottom: -5px;
                right: 10px;
                width: 10px;
                height: 10px;
                background-color: white;
                transform: rotate(45deg);
                border-bottom: 1px solid #e5e7eb;
                border-right: 1px solid #e5e7eb;
            }

            /* Make sure the board fills the entire width */
            .kanban-board-container {
                width: 100%;
                padding-left: 1rem;
                padding-right: 0;
                overflow-x: auto;
            }

            /* Remove margin from last column */
            .kanban-column:last-child {
                margin-right: 0 !important;
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        }
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Kanban board...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
                    <h3 className="text-xl font-semibold text-red-500 mb-3">Error</h3>
                    <p className="text-gray-700 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!swimlanes || swimlanes.length === 0) {
        return (
            <div className="p-4 bg-gray-50 min-h-screen">
                <h1 className="text-2xl font-bold mb-6">Kanban</h1>
                <div className="flex items-center justify-center p-8">
                    <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
                        <h3 className="text-xl font-semibold mb-3">No Swimlanes</h3>
                        <p className="text-gray-600 mb-6">You don't have any swimlanes yet. Create one to get started.</p>
                        <button
                            className="bg-teal-400 px-4 py-2 rounded font-medium hover:bg-teal-500 transition-colors"
                            onClick={() => setShowCreateModal(true)}
                        >
                            Create Swimlane
                        </button>
                    </div>
                </div>

                {showCreateModal && renderCreateSwimlaneModal()}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-100">
            <div className="pl-4 pr-0 w-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg text-teal-600 font-medium">Kanban</h2>

                    <div className="flex items-center space-x-2">
                        <button className="flex items-center border border-gray-300 rounded px-2 py-1 text-xs">
                            <span className="text-teal-600 mr-1">!</span>
                            <span>Filters</span>
                        </button>

                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="subject or reference"
                                className="border border-gray-300 rounded px-2 py-1 text-xs w-40 pr-6"
                            />
                            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </button>
                        </div>

                        <div className="flex items-center ml-auto">
                            <span className="text-xs text-gray-500 mr-2">ZOOM:</span>
                            <div className="flex border border-gray-300 rounded-md overflow-hidden">
                                <button
                                    className={`px-2 py-0.5 text-xs ${zoomLevel === "compact" ? "bg-teal-500 text-white" : ""}`}
                                    onClick={() => setZoomLevel("compact")}
                                >
                                    Compact
                                </button>
                                <button
                                    className={`w-6 py-0.5 text-xs ${zoomLevel === "medium" ? "bg-teal-500 text-white" : ""}`}
                                    onClick={() => setZoomLevel("medium")}
                                >
                                    •
                                </button>
                                <button
                                    className={`w-6 py-0.5 text-xs ${zoomLevel === "expanded" ? "bg-teal-500 text-white" : ""}`}
                                    onClick={() => setZoomLevel("expanded")}
                                >
                                    ••
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                    {/* Column Headers Row */}
                    <div className="flex mb-1 overflow-x-auto w-full pr-0">
                        {columns.map((column, index) => (
                            <div
                                key={column.id}
                                className={`${expandedColumns[column.id] ? 'w-64' : 'w-10'} flex-shrink-0 transition-all duration-200 ${index < columns.length - 1 ? 'mr-1' : ''} relative`}
                            >
                                <div className="bg-gray-200 rounded-t-md px-2 py-1 flex items-center justify-between">
                                    {expandedColumns[column.id] ? (
                                        <>
                                            <div className="flex items-center">
                                                <div className={`w-4 h-4 ${getColumnColor(column.id)} rounded-sm mr-1`}></div>
                                                <span className="text-xs font-medium">{column.name}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <button
                                                    onClick={() => handleOpenUserStoryModal(column.name, swimlanes[0]?.id)}
                                                    className="text-gray-500 hover:text-gray-700"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                                    </svg>
                                                </button>
                                                <div className="w-5 h-5 flex items-center justify-center bg-gray-100 rounded text-xs">
                                                    {countStoriesInColumn(column.status) || 0}
                                                </div>
                                                <button
                                                    onClick={() => toggleColumn(column.id)}
                                                    className="text-gray-500 hover:text-gray-700"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => toggleColumn(column.id)}
                                            className="w-full flex justify-center text-gray-500 hover:text-gray-700"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                {/* Vertical label for specific columns (always visible) */}
                                {/* {(column.id === 3 || column.id === 5) && (
                                    <div className="absolute h-full" style={{ right: '-5px', zIndex: 20, top: '0' }}>
                                        {column.id === 3 && (
                                            <div className="bg-yellow-100 h-full w-4 flex items-center justify-center">
                                                <div className="transform -rotate-90 origin-center whitespace-nowrap text-[10px] text-yellow-800 font-medium">
                                                    READY FOR TEST
                                                </div>
                                            </div>
                                        )}
                                        {column.id === 5 && (
                                            <div className="bg-gray-100 h-full w-4 flex items-center justify-center">
                                                <div className="transform -rotate-90 origin-center whitespace-nowrap text-[10px] text-gray-700 font-medium">
                                                    ARCHIVED (ARCHIVED)
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )} */}
                            </div>
                        ))}
                    </div>

                    {/* Swimlanes */}
                    {swimlanes.map(swimlane => (
                        <div key={swimlane.id} className="mb-1 w-full">
                            {/* Swimlane Header */}
                            <div
                                className="flex items-center px-2 py-1 bg-gray-100 cursor-pointer"
                                onClick={() => toggleSwimLane(swimlane.id)}
                            >
                                <svg
                                    className={`w-3 h-3 mr-1 transform transition-transform ${swimlane.expanded ? 'rotate-90' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                                <span className="text-xs">{swimlane.name}</span>
                                {swimlane.default && (
                                    <span className="ml-2 text-xs bg-gray-200 px-1 py-0.5 rounded">Default</span>
                                )}
                            </div>

                            {/* Swimlane Content */}
                            {swimlane.expanded && (
                                <div className="flex overflow-x-auto relative w-full">
                                    {columns.map((column, index) => (
                                        <div
                                            key={`${swimlane.id}-${column.id}`}
                                            className={`${expandedColumns[column.id] ? 'w-64' : 'w-10'} flex-shrink-0 transition-all duration-200 ${index < columns.length - 1 ? 'mr-1' : ''} relative kanban-column`}
                                        >
                                            {expandedColumns[column.id] ? (
                                                <Droppable
                                                    droppableId={`column-${column.id}-swimlane-${swimlane.id}`}
                                                >
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.droppableProps}
                                                            className={`bg-gray-50 p-2 min-h-[80px] ${snapshot.isDraggingOver ? 'column-drop-target-active' : ''}`}
                                                        >
                                                            {renderUserStories(column.status, swimlane.id)}
                                                            {provided.placeholder}
                                                        </div>
                                                    )}
                                                </Droppable>
                                            ) : (
                                                <div className="bg-gray-50 min-h-[80px]"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </DragDropContext>

                {/* Create Swimlane Button */}
                <div className="mt-4">
                    <button
                        className="bg-teal-400 text-white px-3 py-1 rounded text-sm hover:bg-teal-500 transition-colors"
                        onClick={() => setShowCreateModal(true)}
                    >
                        Create Swimlane
                    </button>
                </div>
            </div>

            {/* Modals */}
            {showCreateModal && renderCreateSwimlaneModal()}

            <CreateUserStoryModal
                show={showUserStoryModal}
                onHide={handleCloseUserStoryModal}
                projectId={projectId}
                initialStatusId={modalInitialStatus}
                initialSwimlaneId={modalInitialSwimlaneId}
                onUserStoryCreated={() => handleCloseUserStoryModal(true)}
            />
        </div>
    );
};

// Helper function to get column color based on column ID
function getColumnColor(columnId) {
    switch (columnId) {
        case 1: return 'bg-blue-400';
        case 2: return 'bg-red-500';
        case 3: return 'bg-orange-400';
        case 4: return 'bg-yellow-400';
        case 5: return 'bg-green-500';
        case 6: return 'bg-gray-400';
        default: return 'bg-gray-500';
    }
}

export default KanbanBoardWrapper;
