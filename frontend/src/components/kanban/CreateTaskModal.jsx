import React, { useState, useEffect, useRef } from 'react';
import axios from '../../common/axios-customize';
import { PlusIcon, UserIcon, ClockIcon, PaperClipIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const CreateTaskModal = ({
    show,
    onHide,
    projectId,
    userStoryId,
    initialStatusId = 1,
    onTaskCreated
}) => {
    // Refs
    const modalRef = useRef(null);

    // Form data states
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [statusId, setStatusId] = useState(initialStatusId);
    const [assignee, setAssignee] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [dueDate, setDueDate] = useState('');
    const [points, setPoints] = useState(0);
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);

    // Data for dropdowns
    const statuses = [
        { id: 1, name: 'NEW', color: 'bg-blue-400' },
        { id: 2, name: 'READY', color: 'bg-red-500' },
        { id: 3, name: 'IN PROGRESS', color: 'bg-orange-400' },
        { id: 4, name: 'READY FOR TEST', color: 'bg-yellow-400' },
        { id: 5, name: 'DONE', color: 'bg-green-500' },
        { id: 6, name: 'ARCHIVED', color: 'bg-gray-400' }
    ];
    const [projectMembers, setProjectMembers] = useState([]);

    // Thêm event listener cho việc nhấn phím Escape
    useEffect(() => {
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape' && show) {
                handleCancel();
            }
        };

        if (show) {
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [show]);

    // Fetch project members
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Load project members
                const membersResponse = await axios.get(`/api/projects/${projectId}/members`);
                console.log('Fetched project members:', membersResponse.data);

                if (membersResponse.data && membersResponse.data.length > 0) {
                    // Log structure of first member to debug
                    console.log('First member structure:', membersResponse.data[0]);

                    // Deduplicate members by userId or username to avoid duplicates in dropdown
                    const uniqueMembers = [];
                    const uniqueIdentifiers = new Set();

                    membersResponse.data.forEach(member => {
                        // Use userId or username as unique identifier
                        const identifier = member.userId || member.id || member.username;
                        if (!uniqueIdentifiers.has(identifier)) {
                            uniqueIdentifiers.add(identifier);
                            uniqueMembers.push(member);
                        }
                    });

                    console.log('Deduplicated members:', uniqueMembers);
                    setProjectMembers(uniqueMembers);
                }
            } catch (err) {
                console.error('Error loading members:', err);
                toast.error('Failed to load team members');
            }
        };

        if (show && projectId) {
            fetchData();
        }
    }, [projectId, show]);

    const handleClickOutside = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            handleCancel();
        }
    };

    // Add function to handle assignee change with better debugging
    const handleAssigneeChange = (e) => {
        const selectedValue = e.target.value;
        console.log('Selected assignee value:', selectedValue);

        // If empty string, set to null, otherwise make sure we have a valid number
        let assigneeValue = null;
        if (selectedValue !== '') {
            // Try to convert to number, but handle potential parsing issues
            assigneeValue = Number(selectedValue);
            if (isNaN(assigneeValue)) {
                console.warn('Could not convert assignee value to number:', selectedValue);
                // Try to find the member and get their ID directly
                const member = projectMembers.find(m =>
                    m.name === selectedValue ||
                    m.username === selectedValue ||
                    m.fullName === selectedValue
                );
                if (member) {
                    assigneeValue = member.id || member.userId;
                    console.log('Found member ID from name:', assigneeValue);
                }
            }
        }

        console.log('Final assignee value:', assigneeValue);
        setAssignee(assigneeValue);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!subject.trim()) {
            setError('Subject is required');
            setIsLoading(false);
            return;
        }

        // Log the current assignee value
        console.log('Current assignee before API call:', assignee, typeof assignee);

        // Additional validation for assignee value
        let finalAssigneeIds = [];
        if (assignee) {
            if (!isNaN(Number(assignee))) {
                finalAssigneeIds = [Number(assignee)];
            } else {
                console.warn('Invalid assignee value detected:', assignee);
                // Try to recover by finding the member with matching name
                const member = projectMembers.find(m =>
                    m.name === assignee ||
                    m.username === assignee ||
                    m.fullName === assignee
                );
                if (member) {
                    const memberId = member.id || member.userId;
                    console.log('Found member ID from name:', memberId);
                    finalAssigneeIds = [memberId];
                }
            }
        }
        console.log('Final assigneeIds for API call:', finalAssigneeIds);

        try {
            // Format payload exactly like in TaigaUserStoryDetail.jsx
            const taskData = {
                name: subject,
                description: description || "",
                userStoryId: parseInt(userStoryId),
                statusId: parseInt(statusId),
                assigneeIds: finalAssigneeIds // Use the validated assignee IDs
            };

            console.log('Sending task data:', taskData);

            const response = await axios.post('/api/tasks', taskData);

            if (response.data) {
                toast.success('Task created successfully');
                if (onTaskCreated) {
                    onTaskCreated(response.data);
                }
                resetForm();
                onHide();
            } else {
                throw new Error('Failed to create task');
            }
        } catch (err) {
            console.error('Error creating task:', err);
            setError(err.response?.data?.message || err.message || 'Failed to create task. Please try again.');
            toast.error(err.response?.data?.message || err.message || 'Failed to create task');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setSubject('');
        setDescription('');
        setStatusId(initialStatusId);
        setAssignee(null);
        setError('');
        setDueDate('');
        setPoints(0);
        setShowDueDatePicker(false);
    };

    const handleCancel = () => {
        resetForm();
        onHide();
    };

    if (!show) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"
                    onClick={handleClickOutside}
                    aria-hidden="true"
                ></div>

                {/* Trick để căn giữa modal */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                    &#8203;
                </span>

                {/* Modal panel */}
                <div
                    ref={modalRef}
                    className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full"
                >
                    <div className="flex justify-between items-center px-6 py-4 border-b">
                        <h3 className="text-lg font-normal text-gray-900">
                            New task
                        </h3>
                        <button
                            type="button"
                            className="text-gray-400 hover:text-gray-500"
                            onClick={handleCancel}
                        >
                            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 p-4 mx-6 mt-4 rounded-md">
                            <div className="text-sm text-red-700">{error}</div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="px-6 py-4">
                            <div className="mb-4">
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Subject"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="mb-4">
                                <button
                                    type="button"
                                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                                >
                                    <PlusIcon className="h-3.5 w-3.5 mr-1" /> Add tag
                                </button>
                            </div>

                            <div className="mb-6">
                                <textarea
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Please add descriptive text to help others better understand this task"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">STATUS</label>
                                <select
                                    value={statusId}
                                    onChange={(e) => setStatusId(parseInt(e.target.value))}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {statuses.map(status => (
                                        <option key={status.id} value={status.id}>
                                            {status.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">ASSIGNEE</label>
                                <div className="mt-2">
                                    <select
                                        value={assignee || ''}
                                        onChange={handleAssigneeChange}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Unassigned</option>
                                        {projectMembers.map(member => {
                                            // Make sure we're using the numeric ID as value
                                            const memberId = member.userId || member.id;
                                            const displayName = member.fullName || member.name || member.username;
                                            return (
                                                <option key={memberId} value={memberId}>
                                                    {displayName}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">POINTS</label>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Points</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={points}
                                        onChange={(e) => setPoints(e.target.value)}
                                        className="h-6 w-12 px-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    className={`h-8 w-8 rounded flex items-center justify-center ${dueDate ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-500'} hover:bg-gray-200`}
                                    onClick={() => setShowDueDatePicker(!showDueDatePicker)}
                                >
                                    <ClockIcon className="h-4 w-4" />
                                </button>
                                <button type="button" className="h-8 w-8 rounded flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200">
                                    <UserIcon className="h-4 w-4" />
                                </button>
                                <button type="button" className="h-8 w-8 rounded flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200">
                                    <PaperClipIcon className="h-4 w-4" />
                                </button>
                                <button type="button" className="h-8 w-8 rounded flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200">
                                    <CheckIcon className="h-4 w-4" />
                                </button>
                            </div>

                            {showDueDatePicker && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Due Date</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDueDate('');
                                                setShowDueDatePicker(false);
                                            }}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-3 bg-gray-50 border-t flex justify-center">
                            <button
                                type="submit"
                                className="px-12 py-2 bg-[#8fe2d3] text-black font-medium rounded hover:bg-[#7fd8c7] focus:outline-none"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating...' : 'CREATE'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateTaskModal; 