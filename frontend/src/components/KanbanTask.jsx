import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import axios from '../common/axios-customize';
import './KanbanTask.css';

const KanbanTask = ({ task, index, onDelete, onUpdate, isUserStory = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(isUserStory ? task.name : task.title);
    const [isLoading, setIsLoading] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const handleSaveEdit = async () => {
        if (!editedTitle.trim() || editedTitle === (isUserStory ? task.name : task.title)) {
            setIsEditing(false);
            setEditedTitle(isUserStory ? task.name : task.title);
            return;
        }

        setIsLoading(true);

        try {
            let response;
            if (isUserStory) {
                response = await axios.put(`/api/user-story/${task.id}`, {
                    ...task,
                    name: editedTitle
                });
            } else {
                response = await axios.put(`/api/kanban-tasks/${task.id}`, {
                    ...task,
                    title: editedTitle
                });
            }

            onUpdate(response.data);
            setIsEditing(false);
        } catch (error) {
            console.error(`Error updating ${isUserStory ? 'user story' : 'task'}:`, error);
            setEditedTitle(isUserStory ? task.name : task.title);
        } finally {
            setIsLoading(false);
        }
    };

    // Lấy ra tiêu đề, số hiệu và nội dung tùy thuộc vào loại item
    const getTitle = () => isUserStory ? task.name : task.title;
    const getNumber = () => isUserStory ? `US-${task.id}` : `#${task.taskNumber || task.id}`;
    const getDescription = () => isUserStory ? task.description : task.description;

    // Lấy ra thông tin điểm của user story
    const getStoryPoints = () => {
        if (!isUserStory) return null;

        const points = [];
        if (task.uxPoints) points.push(`UX: ${task.uxPoints}`);
        if (task.backPoints) points.push(`Backend: ${task.backPoints}`);
        if (task.frontPoints) points.push(`Frontend: ${task.frontPoints}`);
        if (task.designPoints) points.push(`Design: ${task.designPoints}`);

        return points.length > 0 ? points : null;
    };

    return (
        <Draggable draggableId={`${isUserStory ? 'story' : 'task'}-${task.id}`} index={index}>
            {(provided, snapshot) => (
                <div
                    className={`kanban-task ${isUserStory ? 'user-story' : ''} ${snapshot.isDragging ? 'is-dragging' : ''} ${task.isBlock ? 'is-blocked' : ''}`}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => !isEditing && setShowDetails(!showDetails)}
                >
                    <div className="task-header">
                        <div className="task-number">{getNumber()}</div>
                        {task.assignee && (
                            <div className="task-assignee">
                                <img
                                    src={task.assigneeAvatar || '/user_avatar/user-avatar-01.png'}
                                    alt={task.assigneeName}
                                    className="assignee-avatar"
                                />
                            </div>
                        )}
                    </div>

                    <div className="task-content">
                        {isEditing ? (
                            <div className="task-edit">
                                <input
                                    type="text"
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    autoFocus
                                />
                                <div className="edit-actions">
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={isLoading || !editedTitle.trim()}
                                        className="save-button"
                                    >
                                        {isLoading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditedTitle(isUserStory ? task.name : task.title);
                                        }}
                                        className="cancel-button"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="task-title">{getTitle()}</div>
                        )}

                        {showDetails && (
                            <div className="task-details">
                                {getDescription() && (
                                    <div className="task-description">{getDescription()}</div>
                                )}

                                {isUserStory && getStoryPoints() && (
                                    <div className="story-points">
                                        {getStoryPoints().map((point, idx) => (
                                            <span key={idx} className="point">{point}</span>
                                        ))}
                                    </div>
                                )}

                                {task.dueDate && (
                                    <div className="task-due-date">
                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="task-actions">
                        <button
                            className="edit-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                                setShowDetails(false);
                            }}
                        >
                            ✎
                        </button>
                        <button
                            className="delete-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Are you sure you want to delete this ${isUserStory ? 'user story' : 'task'}?`)) {
                                    onDelete();
                                }
                            }}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default KanbanTask;