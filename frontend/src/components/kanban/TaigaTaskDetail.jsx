import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ClockIcon,
    UserIcon,
    DocumentTextIcon,
    PaperClipIcon,
    LockClosedIcon,
    ArrowLeftIcon,
    PlusIcon,
    EyeIcon,
    XMarkIcon,
    CheckIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import { EyeOff, Save } from 'lucide-react';
import axios from '../../common/axios-customize';
import { Modal, message, Checkbox, DatePicker, TimePicker } from 'antd';
import dayjs from 'dayjs';

const TaskDetail = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();

    const [taskDetails, setTaskDetails] = useState({
        id: 1,
        project: 'ZG nnn',
        projectId: null,
        createdBy: 'Unknown',
        createdAt: '20 Apr 2025 14:56',
        attachments: [],
        comments: [],
        assignees: [],
        watchers: [],
        statusId: 1
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [activities, setActivities] = useState([]);
    const [activeTab, setActiveTab] = useState('comments');

    // State for dropdowns
    const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
    const [showWatcherDropdown, setShowWatcherDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    // State for assignees and watchers (instead of modal-based selection)
    const [assignedUsers, setAssignedUsers] = useState([]);
    const [watchers, setWatchers] = useState([]);
    const [availableAssignees, setAvailableAssignees] = useState([]);

    const [editMode, setEditMode] = useState(false);
    const [editedSubject, setEditedSubject] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [editedDueDate, setEditedDueDate] = useState(null);
    const [isBlocked, setIsBlocked] = useState(false);
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);
    const [showQuickDateSelect, setShowQuickDateSelect] = useState(false);

    // Add points state variables
    const [editedPoints, setEditedPoints] = useState(0);

    // Add activities state
    const [activitiesRefreshTrigger, setActivitiesRefreshTrigger] = useState(0);

    const statuses = [
        { id: 1, name: 'NEW', color: 'bg-blue-400' },
        { id: 2, name: 'IN_PROGRESS', color: 'bg-orange-400' },
        { id: 3, name: 'READY_FOR_TEST', color: 'bg-yellow-400' },
        { id: 4, name: 'TESTING', color: 'bg-purple-400' },
        { id: 5, name: 'DONE', color: 'bg-green-500' },
        { id: 6, name: 'CLOSED', color: 'bg-gray-400' }
    ];

    const getStatusColor = (statusId) => {
        const status = statuses.find(s => s.id === statusId);
        return status ? status.color : 'bg-gray-400';
    };

    const getStatusName = (statusId) => {
        const status = statuses.find(s => s.id === statusId);
        return status ? status.name : 'UNKNOWN';
    };

    const fetchComments = useCallback(async () => {
        try {
            const response = await axios.get(`/api/tasks/${taskId}/comments`);
            if (response.data) {
                // Update both the comments array and taskDetails
                const commentsData = response.data;
                setTaskDetails(prev => ({
                    ...prev,
                    comments: commentsData
                }));
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
            message.error('Failed to load comments');
        }
    }, [taskId]);

    const fetchActivities = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/api/kanban/board/${taskId}/activities`);
            setActivities(response.data);
        } catch (error) {
            console.error('Error fetching activities:', error);
            message.error('Failed to load activities');
            setActivities([]); // Set empty array on error
        } finally {
            setIsLoading(false);
        }
    }, [taskId]);

    const fetchTaskDetails = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/api/tasks/${taskId}`);
            const taskData = response.data;

            // Preserve existing comments when updating task details
            setTaskDetails(prev => ({
                ...taskData,
                comments: prev.comments || taskData.comments || []
            }));

            // Initialize editable fields
            setEditedSubject(taskData.subject || '');
            setEditedDescription(taskData.description || '');
            setEditedDueDate(taskData.dueDate ? new Date(taskData.dueDate) : null);
            setIsBlocked(taskData.isBlocked || false);
            setEditedPoints(taskData.points || 0);

            // Fetch available assignees if project ID is available
            if (taskData.userStoryId) {
                const userStoryResponse = await axios.get(`/api/userstories/${taskData.userStoryId}`);
                if (userStoryResponse.data && userStoryResponse.data.projectId) {
                    fetchAvailableAssignees(userStoryResponse.data.projectId);
                }
            }

            setError(null);
        } catch (err) {
            console.error('Error fetching task:', err);
            setError('Không thể tải dữ liệu nhiệm vụ. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    }, [taskId]);

    // Initial data fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await fetchTaskDetails();
                await fetchComments();
                await fetchActivities();
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };

        fetchInitialData();
    }, [taskId, fetchTaskDetails, fetchComments, fetchActivities]);

    useEffect(() => {
        if (taskDetails.watchers && taskDetails.watchers.length > 0) {
            setWatchers(taskDetails.watchers);
        }
    }, [taskDetails.watchers]);

    useEffect(() => {
        if (taskDetails.assignees && taskDetails.assignees.length > 0) {
            setAssignedUsers(taskDetails.assignees);
        } else if (taskDetails.assignedTo && taskDetails.assignedToName) {
            // Handle legacy single assignee
            setAssignedUsers([{
                id: taskDetails.assignedTo,
                fullName: taskDetails.assignedToName,
                username: taskDetails.assignedToName.toLowerCase().replace(/\s+/g, '.')
            }]);
        }
    }, [taskDetails]);

    useEffect(() => {
        if (taskDetails) {
            setEditedSubject(taskDetails.subject || '');
            setEditedDescription(taskDetails.description || '');
            setEditedDueDate(taskDetails.dueDate ? new Date(taskDetails.dueDate) : null);
            setIsBlocked(taskDetails.isBlocked || false);
            setEditedPoints(taskDetails.points || 0);
        }
    }, [taskDetails]);

    // Add new useEffect to update comments count
    useEffect(() => {
        if (taskDetails.comments) {
            setTaskDetails(prev => ({
                ...prev,
                comments: taskDetails.comments
            }));
        }
    }, [taskDetails.comments]);

    // Add useEffect for activities
    useEffect(() => {
        if (taskId) {
            if (activeTab === 'activities') {
                fetchActivities();
            } else if (activeTab === 'comments') {
                fetchComments();
            }
        }
    }, [taskId, activeTab, activitiesRefreshTrigger, fetchComments, fetchActivities]);

    const fetchAvailableAssignees = async (projectId) => {
        try {
            console.log("Fetching available assignees for task:", taskId, "with projectId:", projectId);

            // Thay đổi: Sử dụng API members project trực tiếp để đảm bảo luôn có dữ liệu
            console.log("Using direct project members API");
            const response = await axios.get(`/api/projects/v1/user/${getCurrentUserId()}/project/${projectId}/members/list`);
            console.log("Project members API response:", response.data);

            if (response.data && response.data.data && Array.isArray(response.data.data)) {
                const mappedUsers = response.data.data.map(member => ({
                    id: member.userId,
                    fullName: member.userFullName,
                    username: member.username
                }));
                console.log("Mapped project members:", mappedUsers);
                setAvailableAssignees(mappedUsers);
            } else {
                console.log("Project members response not in expected format");
                setAvailableAssignees([]);
            }
        } catch (error) {
            console.error('Error fetching project members:', error);
            setAvailableAssignees([]);
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleAddTag = () => {
        console.log('Add tag clicked');
    };

    // Xử lý assignee
    const handleAssignUser = async (userId) => {
        try {
            console.log(`Attempting to assign user ${userId} to task ${taskId}`);
            // Gọi API để thêm người dùng vào assignees
            await axios.post(`/api/tasks/${taskId}/assignees/${userId}`);

            // Refresh task data
            console.log("Assignment successful, refreshing task data");
            await fetchTaskDetails();
            message.success('Gán nhiệm vụ thành công');
            setShowAssigneeDropdown(false);
        } catch (error) {
            console.error('Error assigning task:', error.response?.data || error.message);
            message.error('Không thể gán nhiệm vụ');
        }
    };

    const handleRemoveAssignee = async (userId) => {
        try {
            console.log(`Attempting to remove assignee ${userId} from task ${taskId}`);
            // Gọi API để xóa người dùng khỏi assignees
            await axios.delete(`/api/tasks/${taskId}/assignees/${userId}`);

            // Refresh task data
            console.log("Remove assignee successful, refreshing task data");
            await fetchTaskDetails();
            message.success('Đã xóa người được gán');
        } catch (error) {
            console.error('Error removing assignee:', error.response?.data || error.message);
            message.error('Không thể xóa người được gán');
        }
    };

    // Lấy ID người dùng hiện tại
    const getCurrentUserId = () => {
        // Thử lấy user ID từ localStorage
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                if (user && user.id) {
                    console.log("Found current user ID from localStorage:", user.id);
                    return user.id;
                }
            }

            // Nếu không có user trong localStorage, dùng ID mặc định cho testing
            console.log("Using default user ID for testing");
            return 1; // ID mặc định cho testing
        } catch (error) {
            console.error("Error getting current user ID:", error);
            return 1; // ID mặc định cho testing
        }
    };

    const handleAssignToMe = async () => {
        try {
            // Lấy ID người dùng hiện tại
            const currentUserId = getCurrentUserId();
            console.log(`Assigning task to current user (ID: ${currentUserId})`);
            await handleAssignUser(currentUserId);
        } catch (error) {
            console.error('Error self-assigning task:', error.response?.data || error.message);
        }
    };

    // Xử lý watchers
    const handleAddWatcher = async (userId) => {
        try {
            console.log(`Attempting to add watcher ${userId} to task ${taskId}`);
            // Gọi API để thêm người dùng vào watchers
            await axios.post(`/api/tasks/${taskId}/watchers/${userId}`);

            // Refresh task data
            console.log("Add watcher successful, refreshing task data");
            await fetchTaskDetails();
            message.success('Đã thêm người theo dõi');
            setShowWatcherDropdown(false);
        } catch (error) {
            console.error('Error adding watcher:', error.response?.data || error.message);
            message.error('Không thể thêm người theo dõi');
        }
    };

    const handleRemoveWatcher = async (userId) => {
        try {
            console.log(`Attempting to remove watcher ${userId} from task ${taskId}`);
            // Gọi API để xóa người dùng khỏi watchers
            await axios.delete(`/api/tasks/${taskId}/watchers/${userId}`);

            // Refresh task data
            console.log("Remove watcher successful, refreshing task data");
            await fetchTaskDetails();
            message.success('Đã xóa người theo dõi');
        } catch (error) {
            console.error('Error removing watcher:', error.response?.data || error.message);
            message.error('Không thể xóa người theo dõi');
        }
    };

    // Kiểm tra nếu người dùng hiện tại đang theo dõi
    const isCurrentUserWatching = () => {
        // Lấy ID người dùng hiện tại
        const currentUserId = getCurrentUserId();
        return watchers.some(watcher => watcher.id === currentUserId);
    };

    const handleToggleWatch = async () => {
        // Lấy ID người dùng hiện tại
        const currentUserId = getCurrentUserId();

        if (isCurrentUserWatching()) {
            await handleRemoveWatcher(currentUserId);
        } else {
            await handleAddWatcher(currentUserId);
        }
    };

    const handleDeleteTask = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa nhiệm vụ này không?')) {
            try {
                await axios.delete(`/api/tasks/${taskId}`);
                navigate(-1);
            } catch (error) {
                console.error('Error deleting task:', error);
                alert('Không thể xóa nhiệm vụ. Vui lòng thử lại sau.');
            }
        }
    };

    const handleSubmitComment = async () => {
        if (newComment.trim() === '') return;

        try {
            // Gọi API để thêm comment mới
            await axios.post(`/api/tasks/${taskId}/comments`, {
                content: newComment,
                userId: getCurrentUserId()
            });

            // Lấy danh sách comment mới nhất
            const commentsResponse = await axios.get(`/api/tasks/${taskId}/comments`);
            setTaskDetails(prev => ({
                ...prev,
                comments: commentsResponse.data
            }));

            setNewComment('');
            message.success('Comment added successfully');

            // Ghi lại hoạt động
            await recordActivity(
                'comment_added',
                'Added a new comment'
            );

            // Trigger làm mới hoạt động
            triggerActivitiesRefresh();
        } catch (error) {
            console.error('Error posting comment:', error);
            message.error('Failed to add comment. Please try again.');
        }
    };

    const handleEditToggle = () => {
        if (editMode) {
            // Reset values when canceling edit
            setEditedSubject(taskDetails.subject || '');
            setEditedDescription(taskDetails.description || '');
            setEditedDueDate(taskDetails.dueDate ? new Date(taskDetails.dueDate) : null);
        }
        setEditMode(!editMode);
    };

    const handleSaveChanges = async () => {
        try {
            // Store original values for activity details
            const originalDescription = taskDetails.description;
            const originalPoints = taskDetails.points || 0;

            // Check what changed for activity logging
            const descriptionChanged = originalDescription !== editedDescription;
            const pointsChanged = originalPoints !== editedPoints;

            // Update description
            const descriptionResponse = await axios.put(`/api/tasks/${taskId}/description`, {
                description: editedDescription
            });

            if (descriptionResponse.data) {
                setTaskDetails(descriptionResponse.data);
            }

            // Update points if changed
            if (pointsChanged) {
                const pointsResponse = await axios.put(`/api/tasks/${taskId}/points`, {
                    points: editedPoints
                });

                if (pointsResponse.data) {
                    setTaskDetails(prevDetails => ({
                        ...prevDetails,
                        points: editedPoints
                    }));
                }
            }

            // Update due date if changed
            if (editedDueDate !== taskDetails.dueDate) {
                const dueDateResponse = await axios.put(`/api/tasks/${taskId}/due-date`, {
                    dueDate: editedDueDate ? editedDueDate.toISOString().split('T')[0] : null
                });

                if (dueDateResponse.data) {
                    setTaskDetails(dueDateResponse.data);
                }
            }

            setEditMode(false);
            message.success('Task updated successfully');

            // Record activity for updates
            if (descriptionChanged) {
                await recordActivity(
                    'description_updated',
                    'Task description was updated'
                );
            }

            if (pointsChanged) {
                await recordActivity(
                    'points_updated',
                    `Points updated from ${originalPoints} to ${editedPoints}`
                );
            }

            // Trigger làm mới hoạt động
            triggerActivitiesRefresh();
        } catch (error) {
            console.error('Error updating task:', error);
            message.error('Failed to update task: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleStatusChange = async (statusId) => {
        try {
            // Store original status for activity
            const originalStatusId = taskDetails.statusId;
            const statusNames = {
                1: 'NEW',
                2: 'IN_PROGRESS',
                3: 'READY_FOR_TEST',
                4: 'TESTING',
                5: 'DONE',
                6: 'CLOSED'
            };

            // Call the status update API
            const response = await axios.put(`/api/tasks/${taskId}/status/${statusNames[statusId]}`);

            // Preserve existing comments
            const currentComments = taskDetails.comments || [];
            setTaskDetails({
                ...response.data,
                comments: currentComments
            });

            setShowStatusDropdown(false);

            // Record activity for status change
            await recordActivity(
                'status_updated',
                `Status changed from ${statusNames[originalStatusId] || originalStatusId} to ${statusNames[statusId] || statusId}`
            );

            // Trigger làm mới hoạt động
            triggerActivitiesRefresh();
        } catch (err) {
            console.error('Error updating status:', err);
            message.error('Failed to update status. Please try again.');
        }
    };

    const recordActivity = async (action, details) => {
        if (!taskDetails || !taskDetails.id) return;

        try {
            const userId = getCurrentUserId();

            const activityData = {
                action: action,
                details: details
            };

            await axios.post(
                `/api/tasks/${taskDetails.id}/activities`,
                activityData,
                { headers: { 'User-Id': userId } }
            );

            // Refresh activities if activities tab is active
            if (activeTab === 'activities') {
                fetchActivities();
            }
        } catch (err) {
            console.error('Error recording activity:', err);
        }
    };

    const triggerActivitiesRefresh = () => {
        setActivitiesRefreshTrigger(prev => prev + 1);
    };

    const handleDueDateChange = async (date) => {
        try {
            const response = await axios.put(`/api/tasks/${taskId}/due-date`, {
                dueDate: date ? date.format('YYYY-MM-DD') : null
            });
            setTaskDetails(response.data);
            setShowDueDatePicker(false);
            message.success('Due date updated successfully');

            // Record activity for due date change
            await recordActivity(
                'due_date_updated',
                `Due date changed to ${date ? date.format('YYYY-MM-DD') : 'None'}`
            );

            // Trigger làm mới hoạt động
            triggerActivitiesRefresh();
        } catch (err) {
            console.error('Error updating due date:', err);
            message.error('Failed to update due date. Please try again.');
        }
    };

    const handleQuickDateSelect = (days) => {
        const newDate = dayjs().add(days, 'day');
        handleDueDateChange(newDate);
        setShowQuickDateSelect(false);
    };

    const handleSaveDueDate = () => {
        handleDueDateChange(editedDueDate);
    };

    const handleToggleBlocked = async () => {
        try {
            const newBlockStatus = !isBlocked;

            // Update local state immediately before API call
            setIsBlocked(newBlockStatus);
            setTaskDetails(prev => ({
                ...prev,
                isBlocked: newBlockStatus
            }));

            await axios.put(`/api/tasks/${taskId}/block`, {
                isBlocked: newBlockStatus
            });

            message.success(`Task ${newBlockStatus ? 'blocked' : 'unblocked'} successfully`);

            // Record activity for block status change
            await recordActivity(
                'block_status_updated',
                `Task ${newBlockStatus ? 'blocked' : 'unblocked'}`
            );

            // Trigger làm mới hoạt động
            triggerActivitiesRefresh();
        } catch (err) {
            // Revert state on error
            setIsBlocked(isBlocked); // Revert to original state
            setTaskDetails(prev => ({
                ...prev,
                isBlocked: isBlocked // Revert to original state
            }));

            console.error('Error updating block status:', err);
            message.error('Failed to update block status. Please try again.');
        }
    };

    // Debug helper function
    const debugInfo = () => {
        console.log({
            taskId,
            taskDetails,
            projectId: taskDetails.projectId,
            userStoryId: taskDetails.userStoryId,
            assignedUsers,
            watchers,
            availableAssignees
        });

        if (taskDetails.projectId) {
            console.log("Using project ID:", taskDetails.projectId);
            fetchAvailableAssignees(taskDetails.projectId);
        } else if (taskDetails.userStoryId) {
            console.log("No projectId, fetching from userStory:", taskDetails.userStoryId);
            axios.get(`/api/kanban/board/userstory/${taskDetails.userStoryId}`)
                .then(res => {
                    console.log("UserStory data:", res.data);
                    if (res.data && res.data.projectId) {
                        console.log("Found projectId in userStory:", res.data.projectId);
                        fetchAvailableAssignees(res.data.projectId);
                    } else {
                        console.log("No projectId in userStory data");
                    }
                })
                .catch(err => console.error("Error fetching userStory:", err));
        } else {
            console.log("No projectId or userStoryId available");
        }
    };

    if (isLoading) {
        return (
            <div className="bg-gray-100 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                    <p className="mt-2">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-100 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-2">⚠️ {error}</div>
                    <button
                        onClick={fetchTaskDetails}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Top Navigation */}
            <div className="bg-white border-b border-gray-200 py-2 px-4 flex items-center space-x-3">
                <button
                    onClick={handleGoBack}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                    <span>Back</span>
                </button>
                <div className="text-sm text-gray-500 ml-4">Task #{taskId}</div>
                <div className="flex-grow"></div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleEditToggle}
                        className="text-gray-700 font-semibold px-4 py-1"
                    >
                        {editMode ? 'CANCEL' : 'EDIT'}
                    </button>
                    {editMode && (
                        <button
                            onClick={handleSaveChanges}
                            className="bg-green-500 text-white px-4 py-1 rounded-sm flex items-center"
                        >
                            <Save size={16} className="mr-1" /> SAVE
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-6xl mx-auto pt-4 px-4 pb-12 flex">
                {/* Main Content */}
                <div className="flex-1 mr-4">
                    {/* Task Info */}
                    <div className="bg-white rounded shadow mb-4 p-4">
                        <div className="mb-3">
                            <p className="text-sm text-gray-600">
                                This task belongs to {taskDetails.userStoryId ? (
                                    <button
                                        onClick={() => navigate(`/projects/${taskDetails.projectId}/userstory/${taskDetails.userStoryId}`)}
                                        className="text-teal-500 hover:underline font-medium"
                                    >
                                        US #{taskDetails.userStoryId}: {taskDetails.userStoryName || 'User Story'}
                                    </button>
                                ) : (
                                    <span className="text-gray-400 italic">No User Story</span>
                                )}
                            </p>
                        </div>

                        {editMode ? (
                            <input
                                type="text"
                                value={editedSubject}
                                onChange={(e) => setEditedSubject(e.target.value)}
                                className="w-full font-bold border border-gray-300 rounded px-2 py-1 mb-2"
                                placeholder="Task subject"
                            />
                        ) : (
                            <div className="flex flex-wrap items-center mb-4">
                                <span className="bg-gray-100 text-gray-600 text-xs rounded px-2 py-1 mr-2 mb-1">
                                    {taskDetails.subject || 'Untitled Task'}
                                </span>
                                <button
                                    onClick={handleAddTag}
                                    className="text-gray-500 text-sm hover:text-gray-700"
                                >
                                    Add tag +
                                </button>
                            </div>
                        )}

                        <div className="flex justify-between items-center text-sm text-gray-500 mb-1">
                            <div>Created by {taskDetails.createdByFullName || 'Unknown'}</div>
                            <div>{new Date(taskDetails.createdAt).toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded shadow mb-4 p-4">
                        {editMode ? (
                            <textarea
                                value={editedDescription}
                                onChange={(e) => setEditedDescription(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2 min-h-[100px]"
                                placeholder="Add a description..."
                            />
                        ) : (
                            <p className="text-gray-700 text-sm">
                                {taskDetails.description || 'No description provided.'}
                            </p>
                        )}
                    </div>

                    {/* Attachments */}
                    <div className="bg-white rounded shadow mb-4">
                        <div className="p-4 flex justify-between items-center">
                            <h3 className="text-sm font-medium text-gray-700">0 Attachments</h3>
                            <button className="bg-[#8fecd3] text-black w-6 h-6 rounded flex items-center justify-center">
                                <PlusIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="mx-4 mb-4 border border-dashed border-gray-300 p-4 text-center text-gray-500 bg-gray-50 rounded">
                            <p className="text-sm">Drop attachments here!</p>
                        </div>
                    </div>

                    {/* Comments and Activities tabs section */}
                    <div className="mt-8 border-t border-gray-200 pt-4">
                        <div className="flex border-b border-gray-200">
                            <button
                                className={`px-4 py-2 ${activeTab === 'comments' ? 'font-semibold border-b-2 border-red-500' : 'text-gray-500'}`}
                                onClick={() => setActiveTab('comments')}
                            >
                                {taskDetails.comments?.length || 0} Comments
                            </button>
                            <button
                                className={`px-4 py-2 ${activeTab === 'activities' ? 'font-semibold border-b-2 border-red-500' : 'text-gray-500'}`}
                                onClick={() => setActiveTab('activities')}
                            >
                                {activities?.length || 0} Activities
                            </button>
                        </div>

                        {/* Tab content */}
                        {activeTab === 'comments' ? (
                            <div className="mt-4">
                                <div className="space-y-4">
                                    {taskDetails.comments?.map((comment) => (
                                        <div key={comment.id} className="border-b border-gray-100 pb-4">
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0 mr-3">
                                                    <div className="w-8 h-8 bg-purple-300 rounded-md flex items-center justify-center text-white">
                                                        {comment.userFullName ? comment.userFullName.split(' ').map(n => n[0]).join('') : 'U'}
                                                    </div>
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className="font-medium">{comment.userFullName}</span>
                                                            <span className="text-gray-500 text-sm ml-2">@{comment.username}</span>
                                                        </div>
                                                        <span className="text-gray-500 text-sm">
                                                            {new Date(comment.createdAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-gray-700">{comment.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4">
                                    <textarea
                                        className="w-full border border-gray-300 p-4 rounded"
                                        placeholder="Type a new comment here"
                                        rows={3}
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    ></textarea>
                                    <div className="mt-2 flex justify-end">
                                        <button
                                            onClick={handleSubmitComment}
                                            disabled={!newComment.trim()}
                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                        >
                                            Add Comment
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4">
                                <div className="space-y-4">
                                    {activities?.map((activity) => (
                                        <div key={activity.id} className="border-b border-gray-100 pb-4">
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0 mr-3">
                                                    <div className="w-8 h-8 bg-purple-300 rounded-md flex items-center justify-center text-white">
                                                        {activity.userFullName ? activity.userFullName.split(' ').map(n => n[0]).join('') : 'U'}
                                                    </div>
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex flex-col">
                                                        <span className="text-teal-500 font-medium">{activity.userFullName || 'Unknown user'}</span>
                                                        <span className="text-gray-500 text-sm">{new Date(activity.timestamp).toLocaleString()}</span>
                                                    </div>
                                                    <div className="mt-2">
                                                        <span className="text-gray-700 font-medium mr-1">{activity.action}</span>
                                                        {activity.details && (
                                                            <span className="text-gray-600">{activity.details}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-72">
                    <div className="bg-white rounded shadow p-4 mb-4">
                        <div className="mb-1 flex justify-between items-center">
                            <h2 className="font-medium">{taskDetails.subject || 'Task'}</h2>
                            <div className="relative">
                                <button
                                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                    className={`${getStatusColor(taskDetails.statusId)} text-white px-3 py-1 rounded-sm ml-2 flex items-center`}
                                >
                                    {getStatusName(taskDetails.statusId)} <ChevronDownIcon size={16} />
                                </button>

                                {showStatusDropdown && (
                                    <div className="dropdown-menu dropdown-arrow-down absolute z-50 right-0 mt-1 w-40 bg-white border border-gray-200 rounded shadow-lg">
                                        {statuses.map(status => (
                                            <div
                                                key={status.id}
                                                className={`flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer ${status.id === taskDetails.statusId ? 'bg-gray-100' : ''}`}
                                                onClick={() => handleStatusChange(status.id)}
                                            >
                                                <div className={`w-3 h-3 rounded-full ${status.color} mr-2`}></div>
                                                <span>{status.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleDeleteTask}
                                className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                            >
                                Delete Task
                            </button>
                        </div>
                    </div>

                    {taskDetails.userStoryId && (
                        <div className="bg-white rounded shadow p-4 mb-4">
                            <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">USER STORY</h3>
                            <button
                                onClick={() => navigate(`/projects/${taskDetails.projectId}/userstory/${taskDetails.userStoryId}`)}
                                className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
                            >
                                <DocumentTextIcon className="w-4 h-4 mr-1" />
                                <span>US #{taskDetails.userStoryId}: {taskDetails.userStoryName}</span>
                            </button>
                        </div>
                    )}

                    {/* ASSIGNED section - updated to match TaigaUserStoryDetail style */}
                    <div className="bg-white rounded shadow p-4 mb-4">
                        <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">ASSIGNED</h3>
                        <div className="space-y-2">
                            {assignedUsers.length > 0 ? (
                                assignedUsers.map(user => (
                                    <div key={user.id} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-purple-300 rounded-md flex items-center justify-center text-white mr-2">
                                                {user.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : 'U'}
                                            </div>
                                            <div>
                                                <div className="font-medium">{user.fullName}</div>
                                                <div className="text-xs text-gray-500">@{user.username || 'username'}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveAssignee(user.id)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-500 text-sm italic">No assignees yet</div>
                            )}

                            <div className="relative">
                                <button
                                    onClick={() => {
                                        console.log("Current availableAssignees:", availableAssignees);
                                        setShowAssigneeDropdown(!showAssigneeDropdown);
                                    }}
                                    className="text-gray-500 flex items-center text-sm"
                                >
                                    <PlusIcon className="w-3 h-3 mr-1" /> Add assigned
                                </button>
                                {showAssigneeDropdown && (
                                    <div className="dropdown-menu dropdown-arrow-down z-10 w-full bg-white border border-gray-200 rounded shadow-lg">
                                        <div className="px-4 py-2 text-right">
                                            <button
                                                onClick={() => {
                                                    console.log("Reloading available assignees...");
                                                    if (taskDetails.projectId) {
                                                        fetchAvailableAssignees(taskDetails.projectId);
                                                    } else if (taskDetails.userStoryId) {
                                                        console.log("No projectId, trying to get from userStory");
                                                        axios.get(`/api/kanban/board/userstory/${taskDetails.userStoryId}`)
                                                            .then(response => {
                                                                console.log("UserStory data:", response.data);
                                                                if (response.data && response.data.projectId) {
                                                                    fetchAvailableAssignees(response.data.projectId);
                                                                }
                                                            })
                                                            .catch(error => console.error("Error fetching userStory:", error));
                                                    }
                                                }}
                                                className="text-xs text-blue-500 hover:underline"
                                            >
                                                Reload users
                                            </button>
                                        </div>
                                        {availableAssignees.length > 0 ? (
                                            availableAssignees
                                                .filter(user => !assignedUsers.some(assigned => assigned.id === user.id))
                                                .map(user => (
                                                    <div
                                                        key={user.id}
                                                        onClick={() => handleAssignUser(user.id)}
                                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                                    >
                                                        <div className="w-6 h-6 bg-purple-300 rounded-md flex items-center justify-center text-white mr-2 text-xs">
                                                            {user.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{user.fullName}</div>
                                                            <div className="text-xs text-gray-500">@{user.username || 'username'}</div>
                                                        </div>
                                                    </div>
                                                ))
                                        ) : (
                                            <div className="px-4 py-2 text-gray-500 text-sm">No available users to add</div>
                                        )}
                                        {availableAssignees.length > 0 &&
                                            availableAssignees.filter(user => !assignedUsers.some(assigned => assigned.id === user.id)).length === 0 && (
                                                <div className="px-4 py-2 text-gray-500 text-sm">All users are already assigned</div>
                                            )}
                                        {assignedUsers.length === 0 && (
                                            <div
                                                onClick={handleAssignToMe}
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            >
                                                <div className="flex items-center text-blue-500">
                                                    <CheckIcon className="w-4 h-4 mr-1" />
                                                    <span>Assign to me</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* WATCHERS section - updated to match TaigaUserStoryDetail style */}
                    <div className="bg-white rounded shadow p-4 mb-4">
                        <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">WATCHERS</h3>
                        <div className="space-y-2">
                            {watchers.length > 0 ? (
                                watchers.map(user => (
                                    <div key={user.id} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-purple-300 rounded-md flex items-center justify-center text-white mr-2">
                                                {user.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : 'U'}
                                            </div>
                                            <div>
                                                <div className="font-medium">{user.fullName}</div>
                                                <div className="text-xs text-gray-500">@{user.username || 'username'}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveWatcher(user.id)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-500 text-sm italic">No watchers yet</div>
                            )}

                            <div className="relative">
                                <button
                                    onClick={() => {
                                        console.log("Current watchers:", watchers);
                                        console.log("Current availableAssignees for watchers:", availableAssignees);
                                        setShowWatcherDropdown(!showWatcherDropdown);
                                    }}
                                    className="text-gray-500 flex items-center text-sm"
                                >
                                    <PlusIcon className="w-3 h-3 mr-1" /> Add watchers
                                </button>
                                {showWatcherDropdown && (
                                    <div className="dropdown-menu dropdown-arrow-down z-10 w-full bg-white border border-gray-200 rounded shadow-lg">
                                        <div className="px-4 py-2 text-right">
                                            <button
                                                onClick={() => {
                                                    console.log("Reloading available assignees for watchers...");
                                                    if (taskDetails.projectId) {
                                                        fetchAvailableAssignees(taskDetails.projectId);
                                                    } else if (taskDetails.userStoryId) {
                                                        console.log("No projectId, trying to get from userStory for watchers");
                                                        axios.get(`/api/kanban/board/userstory/${taskDetails.userStoryId}`)
                                                            .then(response => {
                                                                console.log("UserStory data for watchers:", response.data);
                                                                if (response.data && response.data.projectId) {
                                                                    fetchAvailableAssignees(response.data.projectId);
                                                                }
                                                            })
                                                            .catch(error => console.error("Error fetching userStory for watchers:", error));
                                                    }
                                                }}
                                                className="text-xs text-blue-500 hover:underline"
                                            >
                                                Reload users
                                            </button>
                                        </div>
                                        {availableAssignees.length > 0 ? (
                                            availableAssignees
                                                .filter(user => !watchers.some(watcher => watcher.id === user.id))
                                                .map(user => (
                                                    <div
                                                        key={user.id}
                                                        onClick={() => handleAddWatcher(user.id)}
                                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                                    >
                                                        <div className="w-6 h-6 bg-purple-300 rounded-md flex items-center justify-center text-white mr-2 text-xs">
                                                            {user.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{user.fullName}</div>
                                                            <div className="text-xs text-gray-500">@{user.username || 'username'}</div>
                                                        </div>
                                                    </div>
                                                ))
                                        ) : (
                                            <div className="px-4 py-2 text-gray-500 text-sm">No available users to add</div>
                                        )}
                                        {availableAssignees.length > 0 &&
                                            availableAssignees.filter(user => !watchers.some(watcher => watcher.id === user.id)).length === 0 && (
                                                <div className="px-4 py-2 text-gray-500 text-sm">All users are already watchers</div>
                                            )}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-end text-sm mt-2">
                                <button
                                    className="text-gray-500 flex items-center hover:text-blue-500"
                                    onClick={handleToggleWatch}
                                >
                                    {isCurrentUserWatching() ? (
                                        <>
                                            <EyeOff className="w-4 h-4 mr-1" /> Unwatch
                                        </>
                                    ) : (
                                        <>
                                            <EyeIcon className="w-4 h-4 mr-1" /> Watch
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* DUE DATE section */}
                    {taskDetails.dueDate && (
                        <div className="bg-white rounded shadow p-4 mb-4">
                            <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">DUE DATE</h3>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <ClockIcon className="w-5 h-5 text-gray-400 mr-2" />
                                    <span>{dayjs(taskDetails.dueDate).format('YYYY-MM-DD')}</span>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowQuickDateSelect(!showQuickDateSelect)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <ChevronDownIcon className="w-4 h-4" />
                                    </button>
                                    {showQuickDateSelect && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg">
                                            <div className="py-1">
                                                <button
                                                    onClick={() => handleQuickDateSelect(1)}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Tomorrow
                                                </button>
                                                <button
                                                    onClick={() => handleQuickDateSelect(7)}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Next week
                                                </button>
                                                <button
                                                    onClick={() => handleQuickDateSelect(14)}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    In 2 weeks
                                                </button>
                                                <button
                                                    onClick={() => handleQuickDateSelect(30)}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    In a month
                                                </button>
                                                <button
                                                    onClick={() => handleDueDateChange(null)}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Remove due date
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {showDueDatePicker && (
                                <div className="mt-4">
                                    <DatePicker
                                        value={editedDueDate ? dayjs(editedDueDate) : null}
                                        onChange={(date) => setEditedDueDate(date)}
                                        className="w-full"
                                    />
                                    <div className="mt-2 flex justify-end">
                                        <button
                                            onClick={() => setShowDueDatePicker(false)}
                                            className="px-3 py-1 text-gray-500 hover:text-gray-700"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveDueDate}
                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Block Status */}
                    <div className="bg-white rounded shadow p-4 mb-4">
                        <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">BLOCK STATUS</h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <LockClosedIcon className={`w-5 h-5 mr-2 ${isBlocked ? 'text-red-500' : 'text-gray-400'}`} />
                                <span className={isBlocked ? 'text-red-500' : 'text-gray-700'}>
                                    {isBlocked ? 'Blocked' : 'Not Blocked'}
                                </span>
                            </div>
                            <button
                                onClick={handleToggleBlocked}
                                className={`px-3 py-1 rounded text-sm ${isBlocked ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'} hover:bg-opacity-80`}
                            >
                                {isBlocked ? 'Unblock' : 'Block'}
                            </button>
                        </div>
                    </div>


                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowDueDatePicker(!showDueDatePicker)}
                            className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-500 hover:bg-gray-200"
                        >
                            <ClockIcon className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-500 hover:bg-gray-200">
                            <UserIcon className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-500 hover:bg-gray-200">
                            <DocumentTextIcon className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-500 hover:bg-gray-200">
                            <PaperClipIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleToggleBlocked}
                            className={`w-8 h-8 rounded flex items-center justify-center ${isBlocked
                                ? 'bg-red-100 text-red-500 hover:bg-red-200'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            <LockClosedIcon className={`w-4 h-4 ${isBlocked ? 'text-red-500' : 'text-gray-500'}`} />
                        </button>
                        <button
                            onClick={debugInfo}
                            className="w-auto px-2 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-500 hover:bg-gray-200"
                        >
                            Debug Info
                        </button>
                    </div>

                    {/* Due Date Picker Modal */}
                    {showDueDatePicker && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-96">
                                <h3 className="text-lg font-medium mb-4">Set Due Date</h3>
                                <div className="space-y-4">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleQuickDateSelect(1)}
                                            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                                        >
                                            Tomorrow
                                        </button>
                                        <button
                                            onClick={() => handleQuickDateSelect(7)}
                                            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                                        >
                                            Next Week
                                        </button>
                                        <button
                                            onClick={() => handleQuickDateSelect(14)}
                                            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                                        >
                                            In 2 Weeks
                                        </button>
                                    </div>
                                    <div>
                                        <DatePicker
                                            value={editedDueDate ? dayjs(editedDueDate) : null}
                                            onChange={(date) => setEditedDueDate(date)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => {
                                                setShowDueDatePicker(false);
                                                setEditedDueDate(null);
                                            }}
                                            className="px-3 py-1 text-gray-500 hover:text-gray-700"
                                        >
                                            Remove
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleSaveDueDate();
                                                setShowDueDatePicker(false);
                                            }}
                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskDetail;
