import React, { useState, useEffect, useRef } from 'react';
import axios from '../../common/axios-customize';
import { toast } from 'react-toastify';
// Import icons từ heroicons
import { PlusIcon, UserIcon, ClockIcon, PaperClipIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const CreateUserStoryModal = ({
    show,
    onHide,
    projectId,
    initialStatusId,
    initialSwimlaneId,
    onUserStoryCreated
}) => {
    // Refs
    const modalRef = useRef(null);

    // Form data states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [statusId, setStatusId] = useState(initialStatusId || 1);
    const [swimlaneId, setSwimlaneId] = useState(initialSwimlaneId || 1);
    const [location, setLocation] = useState('bottom');
    const [assignee, setAssignee] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [dueDate, setDueDate] = useState('');
    const [uxPoints, setUxPoints] = useState(0);
    const [backPoints, setBackPoints] = useState(0);
    const [frontPoints, setFrontPoints] = useState(0);
    const [designPoints, setDesignPoints] = useState(0);
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);

    // Data for dropdowns
    const statuses = [
        { id: 1, name: 'New' },
        { id: 2, name: 'Ready' },
        { id: 3, name: 'In Progress' },
        { id: 4, name: 'Ready for Test' },
        { id: 5, name: 'Done' },
        { id: 6, name: 'Archived' }
    ];
    const [swimlanes, setSwimlanes] = useState([]);
    const [projectMembers, setProjectMembers] = useState([]);

    // Update status and swimlane when initial values change
    useEffect(() => {
        if (initialStatusId) {
            setStatusId(initialStatusId);
        }
        if (initialSwimlaneId) {
            setSwimlaneId(initialSwimlaneId);
        }
    }, [initialStatusId, initialSwimlaneId]);

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

    // Fetch options for dropdowns
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Load swimlanes
                const swimlanesResponse = await axios.get(`/api/kanban-swimlands/project/${projectId}`);
                if (swimlanesResponse.data && swimlanesResponse.data.length > 0) {
                    setSwimlanes(swimlanesResponse.data);
                    // Set default swimlane if not already set
                    if (!swimlaneId) {
                        setSwimlaneId(swimlanesResponse.data[0]?.id || 1);
                    }
                }

                // Load project members
                const membersResponse = await axios.get(`/api/projects/${projectId}/members`);
                if (membersResponse.data && membersResponse.data.length > 0) {
                    setProjectMembers(membersResponse.data);
                }
            } catch (err) {
                console.error('Error loading data:', err);
            }
        };

        if (show && projectId) {
            fetchData();
        }
    }, [projectId, show]);

    const handleAttachmentChange = (e) => {
        const files = Array.from(e.target.files);
        setAttachments(prev => [...prev, ...files]);
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleClickOutside = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            handleCancel();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!title.trim()) {
            setError('Title is required');
            setIsLoading(false);
            return;
        }

        if (!swimlaneId) {
            setError('Swimlane is required');
            setIsLoading(false);
            return;
        }

        try {
            const userStoryData = {
                name: title,
                description: description || "",
                status: {
                    id: parseInt(statusId)
                },
                swimlane: {
                    id: parseInt(swimlaneId)
                },
                project: {
                    id: parseInt(projectId)
                },
                createdAt: new Date().toISOString(),
                createdBy: {
                    id: 1
                },
                isBlock: false,
                uxPoints: parseInt(uxPoints),
                backPoints: parseInt(backPoints),
                frontPoints: parseInt(frontPoints),
                designPoints: parseInt(designPoints),
                dueDate: dueDate ? new Date(dueDate).toISOString() : null,
                assignedUsers: [],
                watchers: [],
                tags: []
            };

            // Create the assign request separately
            const assignRequest = {
                userIds: assignee ? [parseInt(assignee)] : []
            };

            console.log('Sending user story data:', userStoryData);
            console.log('Sending assign request:', assignRequest);

            const response = await axios.post('/api/kanban/board/userstory', userStoryData, {
                headers: {
                    'Content-Type': 'application/json'
                },
                data: assignRequest
            });

            toast.success('User story created successfully');

            if (onUserStoryCreated) {
                onUserStoryCreated(response.data);
            }

            resetForm();
            onHide();
        } catch (err) {
            console.error('Error creating user story:', err);
            const errorMessage = err.response?.data?.message || 'Failed to create user story. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setStatusId(initialStatusId || 1);
        setSwimlaneId(initialSwimlaneId || 1);
        setLocation('bottom');
        setAssignee(null);
        setAttachments([]);
        setError('');
        setDueDate('');
        setUxPoints(0);
        setBackPoints(0);
        setFrontPoints(0);
        setDesignPoints(0);
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
                    className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full"
                >
                    <div className="flex justify-between items-center px-6 py-4 border-b">
                        <h3 className="text-lg font-normal text-gray-900">
                            New user story
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
                            <div className="flex flex-col md:flex-row md:space-x-6">
                                {/* Left side content */}
                                <div className="md:w-2/3">
                                    <div className="mb-4">
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
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
                                            placeholder="Please add descriptive text to help others better understand this user story"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <h6 className="text-sm font-medium mb-2">{attachments.length} Attachments</h6>
                                        <div
                                            className="border border-dashed border-gray-300 bg-gray-50 rounded-md p-4 text-center cursor-pointer"
                                            onClick={() => document.getElementById('file-input').click()}
                                        >
                                            <input
                                                id="file-input"
                                                type="file"
                                                multiple
                                                onChange={handleAttachmentChange}
                                                className="hidden"
                                            />
                                            <p className="text-sm text-gray-500">Drop attachments here!</p>
                                        </div>
                                        {attachments.length > 0 && (
                                            <ul className="mt-2 divide-y divide-gray-200">
                                                {attachments.map((file, index) => (
                                                    <li key={index} className="py-2 flex justify-between items-center text-sm">
                                                        <span>{file.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeAttachment(index)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <XMarkIcon className="h-4 w-4" />
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>

                                {/* Right side sidebar */}
                                <div className="md:w-1/3">
                                    <div className="mb-4">
                                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">STATUS</label>
                                        <select
                                            value={statusId}
                                            onChange={(e) => setStatusId(parseInt(e.target.value))}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select status</option>
                                            {statuses.map(status => (
                                                <option key={status.id} value={status.id}>
                                                    {status.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">SWIMLANE</label>
                                        <select
                                            value={swimlaneId}
                                            onChange={(e) => setSwimlaneId(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {swimlanes.map(swimlane => (
                                                <option key={swimlane.id} value={swimlane.id}>
                                                    {swimlane.name} {swimlane.isDefault && '(Default)'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">LOCATION</label>
                                        <div className="mt-1 space-x-3">
                                            <label className="inline-flex items-center text-sm">
                                                <input
                                                    type="radio"
                                                    name="location"
                                                    checked={location === 'bottom'}
                                                    onChange={() => setLocation('bottom')}
                                                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                at the bottom
                                            </label>
                                            <label className="inline-flex items-center text-sm">
                                                <input
                                                    type="radio"
                                                    name="location"
                                                    checked={location === 'top'}
                                                    onChange={() => setLocation('top')}
                                                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                on top
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">ASSIGNEE</label>
                                        <div className="mt-2">
                                            <select
                                                value={assignee || ''}
                                                onChange={(e) => setAssignee(e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Unassigned</option>
                                                {projectMembers.map(member => (
                                                    <option key={member.id} value={member.id}>
                                                        {member.name || member.username}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">POINTS</label>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">UX</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={uxPoints}
                                                    onChange={(e) => setUxPoints(e.target.value)}
                                                    className="h-6 w-12 px-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Design</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={designPoints}
                                                    onChange={(e) => setDesignPoints(e.target.value)}
                                                    className="h-6 w-12 px-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Front</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={frontPoints}
                                                    onChange={(e) => setFrontPoints(e.target.value)}
                                                    className="h-6 w-12 px-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Back</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={backPoints}
                                                    onChange={(e) => setBackPoints(e.target.value)}
                                                    className="h-6 w-12 px-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Total points</span>
                                                <div className="h-6 w-12 px-2 flex items-center justify-center rounded bg-gray-100 text-sm text-gray-500">
                                                    {parseInt(uxPoints) + parseInt(backPoints) + parseInt(frontPoints) + parseInt(designPoints)}
                                                </div>
                                            </div>
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
                            </div>
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

export default CreateUserStoryModal;
