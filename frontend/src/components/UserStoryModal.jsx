import React, { useState, useRef, useEffect } from 'react';
import './UserStoryModal.css';
import { v4 as uuidv4 } from 'uuid';

const UserStoryModal = ({ isOpen, onClose, column, onSubmit }) => {
    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState(column || 'New');
    const [swimlane, setSwimlane] = useState('Default');
    const [location, setLocation] = useState('bottom');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [assignedUser, setAssignedUser] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const [userInitials, setUserInitials] = useState('');
    const [userName, setUserName] = useState('');
    const [points, setPoints] = useState({
        ux: 0,
        design: 0,
        front: 0,
        back: 0
    });

    const fileInputRef = useRef();
    const dropAreaRef = useRef();
    const modalRef = useRef();
    const tagInputRef = useRef();

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setDescription('');
            setStatus(column || 'New');
            setSwimlane('Default');
            setLocation('bottom');
            setTags([]);
            setTagInput('');
            setAttachments([]);
            setPoints({
                ux: 0,
                design: 0,
                front: 0,
                back: 0
            });
        }
    }, [isOpen, column]);

    // Mock user data
    useEffect(() => {
        // Typically this would come from your auth context or user API
        const user = {
            id: '1',
            name: 'John Doe',
            initials: 'JD'
        };
        setUserInitials(user.initials);
        setUserName(user.name);
    }, []);

    const handleAddTag = () => {
        if (tagInput.trim()) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
            tagInputRef.current?.focus();
        }
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleAssignToMe = () => {
        setAssignedUser({
            id: '1',
            name: userName,
            initials: userInitials
        });
    };

    const handleUnassign = () => {
        setAssignedUser(null);
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        addFiles(files);
    };

    const addFiles = (files) => {
        const newAttachments = files.map(file => ({
            id: uuidv4(),
            name: file.name,
            size: file.size,
            type: file.type,
            file
        }));

        setAttachments([...attachments, ...newAttachments]);
    };

    const handleRemoveAttachment = (id) => {
        setAttachments(attachments.filter(attachment => attachment.id !== id));
    };

    const handlePointsChange = (type, value) => {
        setPoints({
            ...points,
            [type]: parseInt(value) || 0
        });
    };

    const getTotalPoints = () => {
        return Object.values(points).reduce((total, value) => total + value, 0);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        dropAreaRef.current.classList.add('dragover');
    };

    const handleDragLeave = () => {
        dropAreaRef.current.classList.remove('dragover');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        dropAreaRef.current.classList.remove('dragover');

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            addFiles(files);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const userStory = {
            id: uuidv4(),
            title,
            description,
            status,
            swimlane,
            location,
            tags,
            points,
            totalPoints: getTotalPoints(),
            assignedUser,
            attachments,
            createdAt: new Date().toISOString()
        };

        onSubmit(userStory);
        onClose();
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="taiga-modal-overlay" onClick={handleOverlayClick}>
            <div className="taiga-modal" ref={modalRef}>
                <div className="taiga-modal-header">
                    <h2>New user story</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="taiga-modal-content">
                        {/* Subject */}
                        <div className="taiga-form-row">
                            <div className="taiga-form-field">
                                <label htmlFor="story-title">Subject</label>
                                <input
                                    id="story-title"
                                    type="text"
                                    className="taiga-input"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    placeholder="Enter a title for your user story"
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="taiga-form-row">
                            <label>Tags</label>
                            <div className="taiga-tags">
                                {tags.map((tag, index) => (
                                    <div key={index} className="taiga-tag">
                                        {tag}
                                        <button
                                            type="button"
                                            className="tag-remove"
                                            onClick={() => handleRemoveTag(tag)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                <div className="taiga-tag-input-container">
                                    <input
                                        ref={tagInputRef}
                                        type="text"
                                        className="taiga-tag-input"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleTagKeyDown}
                                        placeholder="Add tag"
                                    />
                                    <button
                                        type="button"
                                        className="taiga-tag-add"
                                        onClick={handleAddTag}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="taiga-form-row">
                            <div className="taiga-form-field">
                                <label htmlFor="story-description">Description</label>
                                <textarea
                                    id="story-description"
                                    className="taiga-textarea"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe your user story"
                                />
                            </div>
                        </div>

                        {/* Status and Swimlane */}
                        <div className="taiga-form-two-col">
                            <div className="taiga-form-field">
                                <label htmlFor="story-status">Status</label>
                                <div className="taiga-select-container">
                                    <select
                                        id="story-status"
                                        className="taiga-select"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="New">New</option>
                                        <option value="Ready">Ready</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Ready for Test">Ready for Test</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </div>
                            </div>
                            <div className="taiga-form-field">
                                <label htmlFor="story-swimlane">Swimlane</label>
                                <div className="taiga-select-container">
                                    <select
                                        id="story-swimlane"
                                        className="taiga-select"
                                        value={swimlane}
                                        onChange={(e) => setSwimlane(e.target.value)}
                                    >
                                        <option value="Default">Default</option>
                                        <option value="Priority">Priority</option>
                                        <option value="Fast Track">Fast Track</option>
                                        <option value="Bug Fixing">Bug Fixing</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="taiga-form-row">
                            <label>Location</label>
                            <div className="taiga-radio-group">
                                <label className="taiga-radio">
                                    <input
                                        type="radio"
                                        name="location"
                                        value="bottom"
                                        checked={location === 'bottom'}
                                        onChange={() => setLocation('bottom')}
                                    />
                                    At the bottom
                                </label>
                                <label className="taiga-radio">
                                    <input
                                        type="radio"
                                        name="location"
                                        value="top"
                                        checked={location === 'top'}
                                        onChange={() => setLocation('top')}
                                    />
                                    On top
                                </label>
                            </div>
                        </div>

                        {/* Assigned to */}
                        <div className="taiga-form-row">
                            <label>Assigned to</label>
                            <div className="taiga-assignee">
                                {assignedUser ? (
                                    <>
                                        <div className="taiga-avatar">
                                            {assignedUser.initials}
                                        </div>
                                        <div className="taiga-assignee-options">
                                            <span>{assignedUser.name}</span>
                                            <button
                                                type="button"
                                                className="taiga-assign-me"
                                                onClick={handleUnassign}
                                            >
                                                Unassign
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="taiga-avatar">?</div>
                                        <div className="taiga-assignee-options">
                                            <span>Unassigned</span>
                                            <button
                                                type="button"
                                                className="taiga-assign-me"
                                                onClick={handleAssignToMe}
                                            >
                                                Assign to me
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Points */}
                        <div className="taiga-form-row">
                            <label>Points</label>
                            <div className="taiga-points-grid">
                                <div className="taiga-points-row">
                                    <div className="taiga-points-cell taiga-points-label">UX</div>
                                    <div className="taiga-points-cell">
                                        <select
                                            className="taiga-points-select"
                                            value={points.ux}
                                            onChange={(e) => handlePointsChange('ux', e.target.value)}
                                        >
                                            <option value="0">0 points</option>
                                            <option value="1">1 point</option>
                                            <option value="2">2 points</option>
                                            <option value="3">3 points</option>
                                            <option value="5">5 points</option>
                                            <option value="8">8 points</option>
                                            <option value="13">13 points</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="taiga-points-row">
                                    <div className="taiga-points-cell taiga-points-label">Design</div>
                                    <div className="taiga-points-cell">
                                        <select
                                            className="taiga-points-select"
                                            value={points.design}
                                            onChange={(e) => handlePointsChange('design', e.target.value)}
                                        >
                                            <option value="0">0 points</option>
                                            <option value="1">1 point</option>
                                            <option value="2">2 points</option>
                                            <option value="3">3 points</option>
                                            <option value="5">5 points</option>
                                            <option value="8">8 points</option>
                                            <option value="13">13 points</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="taiga-points-row">
                                    <div className="taiga-points-cell taiga-points-label">Front</div>
                                    <div className="taiga-points-cell">
                                        <select
                                            className="taiga-points-select"
                                            value={points.front}
                                            onChange={(e) => handlePointsChange('front', e.target.value)}
                                        >
                                            <option value="0">0 points</option>
                                            <option value="1">1 point</option>
                                            <option value="2">2 points</option>
                                            <option value="3">3 points</option>
                                            <option value="5">5 points</option>
                                            <option value="8">8 points</option>
                                            <option value="13">13 points</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="taiga-points-row">
                                    <div className="taiga-points-cell taiga-points-label">Back</div>
                                    <div className="taiga-points-cell">
                                        <select
                                            className="taiga-points-select"
                                            value={points.back}
                                            onChange={(e) => handlePointsChange('back', e.target.value)}
                                        >
                                            <option value="0">0 points</option>
                                            <option value="1">1 point</option>
                                            <option value="2">2 points</option>
                                            <option value="3">3 points</option>
                                            <option value="5">5 points</option>
                                            <option value="8">8 points</option>
                                            <option value="13">13 points</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="taiga-points-row">
                                    <div className="taiga-points-cell taiga-points-label">Total</div>
                                    <div className="taiga-points-cell taiga-points-total">
                                        {getTotalPoints()} points
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Attachments */}
                        <div className="taiga-form-row">
                            <div className="taiga-attachments-header">
                                <label>Attachments</label>
                                <button
                                    type="button"
                                    className="taiga-add-attachment"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    +
                                </button>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                multiple
                                onChange={handleFileChange}
                            />
                            <div
                                ref={dropAreaRef}
                                className="taiga-drop-area"
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current.click()}
                            >
                                Drop files here or click to browse
                            </div>
                            {attachments.length > 0 && (
                                <div className="taiga-attachment-list">
                                    {attachments.map((attachment) => (
                                        <div key={attachment.id} className="taiga-attachment-item">
                                            <span>{attachment.name}</span>
                                            <button
                                                type="button"
                                                className="taiga-remove-attachment"
                                                onClick={() => handleRemoveAttachment(attachment.id)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="taiga-modal-footer">
                        <div className="taiga-toolbar">
                            <div className="taiga-toolbar-buttons">
                                <button
                                    type="submit"
                                    className="taiga-button-primary"
                                    disabled={!title.trim()}
                                >
                                    CREATE
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserStoryModal; 