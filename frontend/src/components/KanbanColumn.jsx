import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import KanbanTask from './KanbanTask';
import UserStoryModal from './UserStoryModal';
import axios from '../common/axios-customize';
import './KanbanColumn.css';

const KanbanColumn = ({ column, userStories, projectId, onUserStoryAdded, onUserStoryUpdated, onUserStoryDeleted }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newStoryName, setNewStoryName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddUserStory = async (e) => {
        e.preventDefault();

        if (!newStoryName.trim()) return;

        setIsLoading(true);

        try {
            const response = await axios.post('/api/user-story', {
                name: newStoryName,
                description: '',
                statusId: column.id,
                projectId: projectId
            });

            onUserStoryAdded(response.data);
            setNewStoryName('');
            setShowAddForm(false);
        } catch (error) {
            console.error('Error creating user story:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUserStory = async (userStoryId) => {
        try {
            await axios.delete(`/api/user-story/${userStoryId}`);
            onUserStoryDeleted(userStoryId);
        } catch (error) {
            console.error('Error deleting user story:', error);
        }
    };

    const handleAddTask = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSaveUserStory = async (userStory) => {
        try {
            // Replace with actual API call
            console.log('Saving user story:', userStory);
            // After successful save, you would typically refresh the Kanban board
            // or add the new user story to the column's taskIds

            setIsModalOpen(false);
            // You might want to trigger a refetch of tasks here
        } catch (error) {
            console.error('Error saving user story:', error);
        }
    };

    const columnColorClass = () => {
        switch (column.type) {
            case 'TODO': return 'column-new';
            case 'IN_PROGRESS': return 'column-in-progress';
            case 'DONE': return 'column-done';
            default: return '';
        }
    };

    return (
        <>
            <div className={`kanban-column ${columnColorClass()}`}>
                <div className="column-header">
                    <h3>{column.name}</h3>
                    <div className="story-count">{userStories?.length || 0}</div>
                    <div className="column-actions">
                        <button className="add-task-btn" onClick={handleAddTask}>
                            <i className="fas fa-plus"></i>
                        </button>
                        <button className="column-menu-btn">
                            <i className="fas fa-ellipsis-v"></i>
                        </button>
                    </div>
                </div>

                <Droppable droppableId={`column-${column.id}`}>
                    {(provided, snapshot) => (
                        <div
                            className={`story-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {userStories && userStories.map((story, index) => (
                                <Draggable key={story.id} draggableId={story.id} index={index}>
                                    {(provided, snapshot) => (
                                        <KanbanTask
                                            key={story.id}
                                            task={story}
                                            index={index}
                                            isUserStory={true}
                                            onDelete={() => handleDeleteUserStory(story.id)}
                                            onUpdate={(updatedStory) => onUserStoryUpdated(updatedStory)}
                                            provided={provided}
                                            snapshot={snapshot}
                                        />
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}

                            {showAddForm ? (
                                <form className="add-story-form" onSubmit={handleAddUserStory}>
                                    <input
                                        type="text"
                                        value={newStoryName}
                                        onChange={(e) => setNewStoryName(e.target.value)}
                                        placeholder="Enter user story name..."
                                        autoFocus
                                    />
                                    <div className="form-actions">
                                        <button
                                            type="submit"
                                            className="add-button"
                                            disabled={isLoading || !newStoryName.trim()}
                                        >
                                            {isLoading ? 'Adding...' : 'Add'}
                                        </button>
                                        <button
                                            type="button"
                                            className="cancel-button"
                                            onClick={() => {
                                                setShowAddForm(false);
                                                setNewStoryName('');
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <button
                                    className="add-story-button"
                                    onClick={() => setShowAddForm(true)}
                                >
                                    + Add User Story
                                </button>
                            )}
                        </div>
                    )}
                </Droppable>
            </div>

            <UserStoryModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveUserStory}
                statusId={column.id}
                projectId={projectId}
            />
        </>
    );
};

export default KanbanColumn;