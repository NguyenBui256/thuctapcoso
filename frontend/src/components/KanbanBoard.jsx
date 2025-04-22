import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useParams } from 'react-router-dom';
import KanbanColumn from './KanbanColumn';
import axios from '../common/axios-customize';
import './KanbanBoard.css';

const KanbanBoard = () => {
    const { projectId } = useParams();
    const [columns, setColumns] = useState({});
    const [userStories, setUserStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCompactView, setIsCompactView] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch swimlands (columns/statuses)
                const statusesResponse = await axios.get(`/api/project-settings/${projectId}/statuses`);
                const fetchedColumns = statusesResponse.data || {};

                // Fetch all user stories for the project
                const userStoriesResponse = await axios.get(`/api/projects/${projectId}/user-stories`);
                const fetchedUserStories = userStoriesResponse.data || [];

                setColumns(fetchedColumns);
                setUserStories(fetchedUserStories);
            } catch (error) {
                console.error('Error fetching Kanban data:', error);
                setError('Failed to load Kanban data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (projectId) {
            fetchData();
        } else {
            setError('Invalid project ID');
            setLoading(false);
        }
    }, [projectId]);

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        // If there's no destination or the item was dropped back into the same position
        if (!destination ||
            (destination.droppableId === source.droppableId &&
                destination.index === source.index)) {
            return;
        }

        // Get the user story that was dragged
        const userStoryId = parseInt(draggableId.split('-')[1]);
        const userStoryToMove = userStories.find(story => story.id === userStoryId);

        if (!userStoryToMove) return;

        // Get destination column id
        const destColumnId = parseInt(destination.droppableId.split('-')[1]);

        // Get the destination column status
        const destinationColumn = columns[destination.droppableId];

        try {
            // Update user story status
            await axios.put(`/api/user-story/${userStoryId}/status/${destColumnId}`, {
                order: destination.index
            });

            // Update local user story state
            const updatedUserStories = userStories.map(story => {
                if (story.id === userStoryId) {
                    return {
                        ...story,
                        statusId: destColumnId,
                        status: destinationColumn
                    };
                }
                return story;
            });

            setUserStories(updatedUserStories);
        } catch (error) {
            console.error('Error updating user story position:', error);
        }
    };

    const getUserStoriesForColumn = (columnId) => {
        return userStories.filter(story => story.statusId === columnId);
    };

    if (loading) {
        return (
            <div className="kanban-loading">
                <div className="spinner"></div>
                <p>Loading Kanban board...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="kanban-error">
                <h3>Error</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    // Hiển thị bảng Kanban trống nếu không có cột nào
    if (!columns || Object.keys(columns).length === 0) {
        return (
            <div className="kanban-board">
                <div className="empty-kanban">
                    <h3>Kanban Board</h3>
                    <p>No columns found for this project.</p>
                    <button onClick={() => {
                        // Tạo các cột mặc định nếu cần
                        const defaultColumns = {
                            'new': {
                                id: 'new',
                                title: 'NEW',
                                taskIds: ['task-1', 'task-2'],
                                color: '#8C2318'
                            },
                            'ready': {
                                id: 'ready',
                                title: 'READY',
                                taskIds: ['task-3'],
                                color: '#4B70E2'
                            },
                            'in-progress': {
                                id: 'in-progress',
                                title: 'IN PROGRESS',
                                taskIds: ['task-4', 'task-5'],
                                color: '#FF9900'
                            },
                            'ready-for-test': {
                                id: 'ready-for-test',
                                title: 'READY FOR TEST',
                                taskIds: [],
                                color: '#FFD700'
                            },
                            'done': {
                                id: 'done',
                                title: 'DONE',
                                taskIds: ['task-6'],
                                color: '#009688'
                            }
                        };
                        setColumns(defaultColumns);
                    }}>Create Default Columns</button>
                </div>
            </div>
        );
    }

    return (
        <div className="kanban-container">
            <div className="kanban-header">
                <div className="search-filters">
                    <input
                        type="text"
                        placeholder="Search issues..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <button className="filter-button">
                        <i className="fas fa-filter"></i> Filters
                    </button>
                </div>
                <div className="view-options">
                    <button
                        className={`view-button ${isCompactView ? 'active' : ''}`}
                        onClick={() => setIsCompactView(!isCompactView)}
                    >
                        {isCompactView ? 'Compact' : 'Normal'} View
                    </button>
                    <button onClick={() => {
                        // Fetch columns (statuses) and tasks from API
                        // Use the appropriate function that's defined in the component
                        // or parent scope to fetch data
                        // This could be loadData, fetchData, or similar function
                        // For now, commenting out the undefined function
                        // fetchKanbanData();
                        console.log("Refresh functionality needs implementation");
                    }}>
                        <i className="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="kanban-board">
                    {Object.values(columns).map((column) => (
                        <Droppable key={column.id} droppableId={column.id}>
                            {(provided) => (
                                <KanbanColumn
                                    column={column}
                                    provided={provided}
                                    isCompactView={isCompactView}
                                    projectId={projectId}
                                    userStories={getUserStoriesForColumn(column.id)}
                                    onUserStoryAdded={(newUserStory) => setUserStories([...userStories, newUserStory])}
                                    onUserStoryUpdated={(updatedUserStory) => {
                                        setUserStories(userStories.map(story =>
                                            story.id === updatedUserStory.id ? updatedUserStory : story
                                        ));
                                    }}
                                    onUserStoryDeleted={(userStoryId) => {
                                        setUserStories(userStories.filter(story => story.id !== userStoryId));
                                    }}
                                />
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
};

export default KanbanBoard;