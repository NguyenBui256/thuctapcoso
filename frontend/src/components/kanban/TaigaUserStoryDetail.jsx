import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ChevronDown, X, Paperclip, Clock, Users, Lock, List, Save, Trash2, Eye, EyeOff, FileText, Download } from 'lucide-react';
import axios from '../../common/axios-customize';
import eventBus from '../../common/eventBus';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { message } from 'antd';
import { BASE_API_URL } from '../../common/constants';
import { LoadingOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';

export default function TaigaUserStoryDetail() {
    const { userStoryId } = useParams();
    const navigate = useNavigate();
    const [userStory, setUserStory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [assignedUsers, setAssignedUsers] = useState([]);
    const [showDueDateModal, setShowDueDateModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dueDateReason, setDueDateReason] = useState('');
    const [availableAssignees, setAvailableAssignees] = useState([]);
    const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    // Add watcher related states
    const [watchers, setWatchers] = useState([]);
    const [showWatcherDropdown, setShowWatcherDropdown] = useState(false);

    // Replace hardcoded statuses with state
    const [statuses, setStatuses] = useState([]);
    const [taskStatuses, setTaskStatuses] = useState([]);

    // Add tag related states
    const [projectTags, setProjectTags] = useState([]);
    const [showTagsDropdown, setShowTagsDropdown] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Add editable fields
    const [editMode, setEditMode] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [editedUxPoints, setEditedUxPoints] = useState(0);
    const [editedBackPoints, setEditedBackPoints] = useState(0);
    const [editedFrontPoints, setEditedFrontPoints] = useState(0);
    const [editedDesignPoints, setEditedDesignPoints] = useState(0);

    // Activity and comment related states
    const [activeTab, setActiveTab] = useState('comments');
    const [activities, setActivities] = useState([]);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [activitiesRefreshTrigger, setActivitiesRefreshTrigger] = useState(0);
    const commentSectionRef = useRef(null);

    // Task related states
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskStatusId, setNewTaskStatusId] = useState(1); // Default to NEW status (id: 1)
    const [newTaskAssignee, setNewTaskAssignee] = useState(null);
    const [isCreatingTask, setIsCreatingTask] = useState(false);
    const [showTaskStatusDropdown, setShowTaskStatusDropdown] = useState(false);
    const [showTaskAssigneeDropdown, setShowTaskAssigneeDropdown] = useState(false);
    const [userStoryTasks, setUserStoryTasks] = useState([]);

    /* Attachments section */
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Thêm lại attachment refresh trigger
    const [attachmentRefreshTrigger, setAttachmentRefreshTrigger] = useState(0);

    // Add function to fetch available tags for the project
    const fetchAvailableTags = useCallback(async (projectId) => {
        try {
            console.log('Fetching available tags for project ID:', projectId);
            const response = await axios.get(`/api/v1/projects/${projectId}/tags`);
            console.log('Available tags response:', response.data);

            // Handle different response formats
            if (response.data && Array.isArray(response.data)) {
                setProjectTags(response.data);
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                setProjectTags(response.data.data);
            } else {
                console.warn('Unexpected tags response format:', response.data);
                setProjectTags([]);
            }
        } catch (error) {
            console.error('Error fetching available tags:', error);
            message.error('Failed to load available tags');
            setProjectTags([]);
        }
    }, []);

    const getCurrentUserId = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        return user ? user.id : null;
    };

    const fetchUserStoryTasks = useCallback(async () => {
        try {
            console.log('Fetching tasks for userStory ID:', userStoryId);
            const response = await axios.get(`/api/tasks/userstory/${userStoryId}`);
            console.log('Tasks data:', response.data);

            // Verify the data is what we expect
            if (Array.isArray(response.data)) {
                // Filter tasks to ensure they belong to this user story (double check)
                const filteredTasks = response.data.filter(task => {
                    if (task.userStoryId && task.userStoryId === parseInt(userStoryId)) {
                        return true;
                    }
                    console.warn(`Task ${task.id} has userStoryId ${task.userStoryId} which doesn't match current userStory ${userStoryId}`);
                    return false;
                });

                console.log(`Filtered tasks: ${filteredTasks.length} out of ${response.data.length} belong to this user story`);
                setUserStoryTasks(filteredTasks);
            } else {
                console.error('Unexpected response format for tasks, expected array but got:', typeof response.data);
                setUserStoryTasks([]);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            message.error('Failed to load tasks');
            setUserStoryTasks([]); // Set empty array on error
        }
    }, [userStoryId]);

    const fetchComments = useCallback(async () => {
        try {
            console.log('Fetching comments for user story:', userStoryId);
            const response = await axios.get(`/api/kanban/board/userstory/${userStoryId}/comments`);
            console.log('Comments response:', response.data);
            if (response.data) {
                setComments(response.data);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
            console.error('Error details:', error.response?.data);
            message.error('Failed to load comments');
            setComments([]);
        }
    }, [userStoryId]);

    const fetchActivities = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/kanban/board/userstory/${userStoryId}/activities`);
            setActivities(response.data);
        } catch (error) {
            console.error('Error fetching activities:', error);
            message.error('Failed to load activities');
            setActivities([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    }, [userStoryId]);

    const fetchUserStory = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Use userstory endpoint instead of user-story (no hyphen)
            const response = await axios.get(`/api/kanban/board/userstory/${userStoryId}`);
            const userStoryData = response.data;
            console.log('User story data:', userStoryData); // Debug log

            if (!userStoryData) {
                throw new Error('No user story data received');
            }

            setUserStory(userStoryData);

            // Đồng bộ state attachments từ userStoryData
            if (userStoryData.attachments) {
                console.log('Updated attachments from server:', userStoryData.attachments);
            }

            // Initialize editable fields with safe fallbacks
            setEditedName(userStoryData.name || '');
            setEditedDescription(userStoryData.description || '');
            setEditedUxPoints(userStoryData.uxPoints || 0);
            setEditedBackPoints(userStoryData.backPoints || 0);
            setEditedFrontPoints(userStoryData.frontPoints || 0);
            setEditedDesignPoints(userStoryData.designPoints || 0);

            // Fetch available assignees
            try {
                const assigneesResponse = await axios.get(`/api/kanban/board/userstory/${userStoryId}/available-assignees`);
                console.log('Available assignees:', assigneesResponse.data);
                setAvailableAssignees(assigneesResponse.data || []);
            } catch (error) {
                console.error('Error fetching assignees:', error);
                setAvailableAssignees([]);
            }

            // Fetch assigned users
            try {
                const assignedUsersResponse = await axios.get(`/api/kanban/board/userstory/${userStoryId}/assigned-users`);
                console.log('Assigned users response:', assignedUsersResponse.data);
                setAssignedUsers(assignedUsersResponse.data || []);
            } catch (error) {
                console.error('Error fetching assigned users:', error);
                setAssignedUsers([]);
            }

            // Fetch watchers
            try {
                const watchersResponse = await axios.get(`/api/kanban/board/userstory/${userStoryId}/watchers`);
                setWatchers(watchersResponse.data || []);
            } catch (error) {
                console.error('Error fetching watchers:', error);
                setWatchers([]);
            }

            // Fetch tasks, comments and activities
            await Promise.all([
                fetchUserStoryTasks(),
                fetchComments(),
                fetchActivities()
            ]);
        } catch (err) {
            console.error('Error fetching user story:', err);
            if (err.name !== 'CanceledError') {
                setError('Failed to load user story: ' + (err.message || 'Unknown error'));
            }
        } finally {
            setLoading(false);
        }
    }, [userStoryId, fetchUserStoryTasks, fetchComments, fetchActivities]);

    useEffect(() => {
        fetchUserStory();
    }, [userStoryId, fetchUserStory]);

    // Sửa useEffect để activities luôn được cập nhật khi có trigger, không phụ thuộc activeTab
    useEffect(() => {
        if (userStoryId) {
            fetchActivities();
        }
    }, [userStoryId, activitiesRefreshTrigger, fetchActivities]);

    // Thêm lại useEffect để theo dõi khi nào cần tải lại dữ liệu attachments
    useEffect(() => {
        if (userStoryId && attachmentRefreshTrigger > 0) {
            console.log("Attachment refresh triggered, reloading user story");
            fetchUserStory();
        }
    }, [userStoryId, attachmentRefreshTrigger, fetchUserStory]);

    // Hàm helper để trigger làm mới hoạt động
    const triggerActivitiesRefresh = () => {
        setActivitiesRefreshTrigger(prev => prev + 1);
    };

    // Thêm lại hàm helper để trigger làm mới attachments
    const triggerAttachmentRefresh = () => {
        setAttachmentRefreshTrigger(prev => prev + 1);
    };

    // Sửa hàm recordActivity để luôn gọi fetchActivities sau khi lưu hoạt động
    const recordActivity = async (action, details) => {
        if (!userStory || !userStory.id) return;

        try {
            // Get current user ID from localStorage or auth context
            const userId = getCurrentUserId();

            const activityData = {
                action: action,
                details: details,
                userId: userId
            };

            // Use the correct endpoint format
            await axios.post(`/api/kanban/board/userstory/${userStoryId}/activities`, activityData);

            // Luôn fetch activities sau khi ghi lại hoạt động, bất kể activeTab là gì
            fetchActivities();
        } catch (err) {
            console.error('Error recording activity:', err);
            message.error('Failed to record activity');
        }
    };

    // Cập nhật hàm handleDueDateChange
    const handleDueDateChange = async (date) => {
        console.log('handleDueDateChange called with date:', date);
        try {
            const dateStr = date.toISOString().split('T')[0];
            console.log('Sending PUT request to update due date:', dateStr);
            console.log('Request URL:', `/api/kanban/board/userstory/${userStoryId}/duedate`);
            console.log('Request payload:', { dueDate: dateStr });

            // Using a more direct approach without custom axios instance
            const url = `/api/kanban/board/userstory/${userStoryId}/duedate`;
            const data = { dueDate: dateStr };
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            try {
                const response = await axios.put(url, data, config);
                console.log('Due date update success - response:', response);

                setUserStory(prev => ({ ...prev, dueDate: dateStr }));
                setShowDueDateModal(false);
                setSelectedDate(null);
                setDueDateReason('');

                // Record the activity
                const oldDate = userStory.dueDate ? new Date(userStory.dueDate).toISOString().split('T')[0] : 'none';
                await recordActivity('due_date_updated', `Due date changed from ${oldDate} to ${dateStr}`);

                // Trigger làm mới hoạt động
                triggerActivitiesRefresh();

            } catch (networkErr) {
                console.error('Network error when updating due date:', networkErr);
                console.log('Error details:', networkErr.response?.data, networkErr.response?.status);
                alert('Failed to update due date: ' + (networkErr.response?.data || networkErr.message));
            }
        } catch (err) {
            console.error('General error in handleDueDateChange:', err);
            alert('An unexpected error occurred: ' + err.message);
        }
    };

    const handleQuickDateSelect = (days) => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        setSelectedDate(date);
    };

    const handleSaveDueDate = () => {
        console.log('handleSaveDueDate called, selectedDate:', selectedDate);
        if (selectedDate) {
            handleDueDateChange(selectedDate);
        } else {
            console.log('No date selected');
        }
    };

    // Cập nhật hàm handleAssignUser
    const handleAssignUser = async (userId) => {
        try {
            await axios.post(`/api/kanban/board/userstory/${userStoryId}/assign`, { userId });

            // Fetch updated assigned users
            const assignedUsersResponse = await axios.get(`/api/kanban/board/userstory/${userStoryId}/assigned-users`);
            setAssignedUsers(assignedUsersResponse.data);

            // Get the user details for the activity record
            const user = availableAssignees.find(u => u.id === userId);
            const username = user ? user.username : `User ${userId}`;

            // Record the activity
            await recordActivity('user_assigned', `User ${username} assigned to user story`);

            // Trigger làm mới hoạt động
            triggerActivitiesRefresh();

            setShowAssigneeDropdown(false);
        } catch (err) {
            console.error('Error assigning user:', err);
        }
    };

    // Cập nhật hàm handleRemoveAssignee
    const handleRemoveAssignee = async (userId) => {
        try {
            // Check if the user is the creator of the user story
            if (userStory.createdBy && userStory.createdBy.id === userId) {
                alert("You cannot remove the creator of this user story");
                return;
            }

            // Get the user details before removing
            const user = assignedUsers.find(u => u.id === userId);
            const username = user ? user.username : `User ${userId}`;

            await axios.delete(`/api/kanban/board/userstory/${userStoryId}/assign/${userId}`);

            // Fetch updated assigned users
            const assignedUsersResponse = await axios.get(`/api/kanban/board/userstory/${userStoryId}/assigned-users`);
            setAssignedUsers(assignedUsersResponse.data);

            // Record the activity
            await recordActivity('user_unassigned', `User ${username} removed from user story`);

            // Trigger làm mới hoạt động
            triggerActivitiesRefresh();
        } catch (err) {
            console.error('Error removing assignee:', err);
        }
    };

    const handleEditToggle = () => {
        if (editMode) {
            // If coming out of edit mode, reset values
            setEditedName(userStory.name || '');
            setEditedDescription(userStory.description || '');
            setEditedUxPoints(userStory.uxPoints || 0);
            setEditedBackPoints(userStory.backPoints || 0);
            setEditedFrontPoints(userStory.frontPoints || 0);
            setEditedDesignPoints(userStory.designPoints || 0);
        }
        setEditMode(!editMode);
    };

    // Cập nhật hàm handleSaveChanges
    const handleSaveChanges = async () => {
        setIsSaving(true);
        setError(null);

        try {
            // Store original values for activity details
            const originalName = userStory.name || '';
            const originalDescription = userStory.description || '';
            const originalUxPoints = userStory.uxPoints || 0;
            const originalBackPoints = userStory.backPoints || 0;
            const originalFrontPoints = userStory.frontPoints || 0;
            const originalDesignPoints = userStory.designPoints || 0;

            // Check what changed for activity logging
            const nameChanged = originalName !== editedName;
            const descriptionChanged = originalDescription !== editedDescription;
            const pointsChanged =
                originalUxPoints !== (editedUxPoints === '' ? 0 : editedUxPoints) ||
                originalBackPoints !== (editedBackPoints === '' ? 0 : editedBackPoints) ||
                originalFrontPoints !== (editedFrontPoints === '' ? 0 : editedFrontPoints) ||
                originalDesignPoints !== (editedDesignPoints === '' ? 0 : editedDesignPoints);

            const updatedData = {
                id: userStory.id,
                name: editedName,
                description: editedDescription,
                uxPoints: editedUxPoints === '' ? 0 : editedUxPoints,
                backPoints: editedBackPoints === '' ? 0 : editedBackPoints,
                frontPoints: editedFrontPoints === '' ? 0 : editedFrontPoints,
                designPoints: editedDesignPoints === '' ? 0 : editedDesignPoints,
                statusId: userStory.statusId,
                swimlaneId: userStory.swimlaneId,
                projectId: userStory.projectId
            };

            const response = await axios.put(`/api/kanban/board/userstory/${userStoryId}`, updatedData);

            // Lưu lại thông tin attachments từ state hiện tại
            const currentAttachments = userStory.attachments || [];

            // Cập nhật userStory với dữ liệu từ response, nhưng giữ lại attachments
            setUserStory(prevState => ({
                ...response.data,
                attachments: response.data.attachments || currentAttachments // Ưu tiên dùng data từ server nếu có, nếu không thì giữ nguyên data cũ
            }));

            setEditMode(false);

            // Update state with new values
            setEditedName(response.data.name || '');
            setEditedDescription(response.data.description || '');
            setEditedUxPoints(response.data.uxPoints || 0);
            setEditedBackPoints(response.data.backPoints || 0);
            setEditedFrontPoints(response.data.frontPoints || 0);
            setEditedDesignPoints(response.data.designPoints || 0);

            // Record activities for each type of change
            if (nameChanged) {
                await recordActivity('name_updated', `Name changed from "${originalName}" to "${editedName}"`);
            }

            if (descriptionChanged) {
                await recordActivity('description_updated', `Description updated`);
            }

            if (pointsChanged) {
                const oldTotal = originalUxPoints + originalBackPoints + originalFrontPoints + originalDesignPoints;
                const newTotal = editedUxPoints + editedBackPoints + editedFrontPoints + editedDesignPoints;
                await recordActivity('points_updated', `Points updated from ${oldTotal} to ${newTotal}`);
            }

            // Show success message
            toast.success('User story updated successfully');

            // Trigger làm mới hoạt động
            triggerActivitiesRefresh();

        } catch (err) {
            console.error('Error updating user story:', err);
            setError('Failed to update user story. Please try again.');
            toast.error('Failed to save user story changes');
        } finally {
            setIsSaving(false);
        }
    };

    // Cập nhật hàm handleStatusChange
    const handleStatusChange = async (statusId) => {
        try {
            // Store original status for activity
            const originalStatusId = userStory.statusId;
            const originalStatus = statuses.find(s => s.id === originalStatusId);
            const newStatus = statuses.find(s => s.id === statusId);

            console.log(`Changing status from ${originalStatusId} to ${statusId}`);

            // Lưu lại thông tin về các tệp đính kèm hiện tại
            const currentAttachments = userStory.attachments || [];

            // Use PATCH endpoint specifically for status updates
            const response = await axios.put(`/api/kanban/board/userstory/${userStoryId}/status`, {
                statusId: statusId
            });

            // Nếu response.data có dữ liệu, sử dụng nó để cập nhật state
            if (response.data) {
                setUserStory(prevState => ({
                    ...response.data,
                    attachments: response.data.attachments || currentAttachments
                }));
            } else {
                // Update local state if no complete data returned
                setUserStory(prevState => ({
                    ...prevState,
                    statusId: statusId,
                    attachments: currentAttachments
                }));
            }

            setShowStatusDropdown(false);

            // Record activity for status change
            await recordActivity(
                'status_updated',
                `Status changed from ${originalStatus?.name || originalStatusId} to ${newStatus?.name || statusId}`
            );

            // Trigger làm mới hoạt động
            triggerActivitiesRefresh();

            // Emit event to notify other components (like SprintProgressBar) about the status change
            // Check if user story moved to/from Done status (status 5)
            if (originalStatusId === 5 || statusId === 5) {
                console.log('Emitting task-status-changed event for user story');
                eventBus.emit('task-status-changed', {
                    userStoryId: userStory.id,
                    previousStatusId: originalStatusId,
                    newStatusId: statusId,
                    sprintId: userStory.sprintId
                });
            }

            // Show success message
            toast.success(`Status updated to ${newStatus?.name || statusId}`);
        } catch (err) {
            console.error('Error updating status:', err);
            toast.error('Failed to update status');
        }
    };

    const handlePointChange = (field, value) => {
        // Allow empty string for deletion
        if (value === '') {
            switch (field) {
                case 'ux':
                    setEditedUxPoints('');
                    break;
                case 'back':
                    setEditedBackPoints('');
                    break;
                case 'front':
                    setEditedFrontPoints('');
                    break;
                case 'design':
                    setEditedDesignPoints('');
                    break;
                default:
                    break;
            }
            return;
        }

        // Ensure input is a number and not negative
        const numValue = Math.max(0, parseInt(value) || 0);

        switch (field) {
            case 'ux':
                setEditedUxPoints(numValue);
                break;
            case 'back':
                setEditedBackPoints(numValue);
                break;
            case 'front':
                setEditedFrontPoints(numValue);
                break;
            case 'design':
                setEditedDesignPoints(numValue);
                break;
            default:
                break;
        }
    };

    // Cập nhật hàm handleToggleBlocked
    const handleToggleBlocked = async () => {
        try {
            const newBlockedState = !(userStory.blocked || userStory.isBlocked);
            const response = await axios.put(`/api/kanban/board/userstory/${userStoryId}/block`, {
                isBlocked: newBlockedState
            });
            setUserStory(response.data);

            // Record activity
            await recordActivity(
                'block_status_updated',
                newBlockedState ? 'User story blocked' : 'User story unblocked'
            );

            // Trigger làm mới hoạt động
            triggerActivitiesRefresh();

            toast.success(`User story ${newBlockedState ? 'blocked' : 'unblocked'} successfully`);
        } catch (err) {
            console.error('Error toggling block status:', err);
            alert('Failed to update blocking status. Please try again.');
            toast.error('Failed to update block status');
        }
    };

    // Update handleDeleteUserStory to use soft delete as fallback
    const handleDeleteUserStory = async () => {
        if (!window.confirm('Are you sure you want to delete this user story? This action cannot be undone.')) {
            return;
        }

        try {
            // Show a loading toast
            const loadingToastId = toast.loading('Deleting user story...');

            try {
                // Record activity before deletion
                await recordActivity('user_story_deleted', 'User story was deleted');

                // Sử dụng hard delete để xóa hoàn toàn khỏi database
                await axios.delete(`/api/kanban/board/userstory/${userStoryId}`);

                toast.update(loadingToastId, {
                    render: 'User story deleted successfully',
                    type: 'success',
                    isLoading: false,
                    autoClose: 2000
                });

                // Navigate back to the kanban board after deletion
                navigate(`/projects/${userStory.projectId}/kanban`);
            } catch (error) {
                console.error('Error with deletion:', error);
                console.error('Error details:', error.response?.data);

                // For other errors, show the error message
                toast.update(loadingToastId, {
                    render: 'Failed to delete user story: ' +
                        (error.response?.data?.message || error.message),
                    type: 'error',
                    isLoading: false,
                    autoClose: 5000
                });
            }
        } catch (error) {
            console.error('Error in delete handler:', error);
            toast.error('An unexpected error occurred while trying to delete the user story');
        }
    };

    // Cập nhật hàm handleAddWatcher
    const handleAddWatcher = async (userId) => {
        try {
            await axios.post(`/api/kanban/board/userstory/${userStoryId}/watchers`, { userId });

            // Get the user details for activity
            const user = availableAssignees.find(u => u.id === userId);
            const username = user ? user.username : `User ${userId}`;

            // Fetch updated watchers
            const watchersResponse = await axios.get(`/api/kanban/board/userstory/${userStoryId}/watchers`);
            setWatchers(watchersResponse.data);

            // Record activity
            await recordActivity('watcher_added', `User ${username} started watching this story`);

            // Trigger làm mới hoạt động
            triggerActivitiesRefresh();

            setShowWatcherDropdown(false);
        } catch (err) {
            console.error('Error adding watcher:', err);
            alert('Failed to add watcher. Please try again.');
        }
    };

    // Cập nhật hàm handleRemoveWatcher
    const handleRemoveWatcher = async (userId) => {
        try {
            // Get the user details before removing
            const user = watchers.find(u => u.id === userId);
            const username = user ? user.username : `User ${userId}`;

            await axios.delete(`/api/kanban/board/userstory/${userStoryId}/watchers/${userId}`);

            // Fetch updated watchers
            const watchersResponse = await axios.get(`/api/kanban/board/userstory/${userStoryId}/watchers`);
            setWatchers(watchersResponse.data);

            // Record activity
            await recordActivity('watcher_removed', `User ${username} stopped watching this story`);

            // Trigger làm mới hoạt động
            triggerActivitiesRefresh();
        } catch (err) {
            console.error('Error removing watcher:', err);
            alert('Failed to remove watcher. Please try again.');
        }
    };

    // Function to check if current user is watching
    const isCurrentUserWatching = () => {
        // In a real app, you might get this from auth context
        // For simplicity, let's assume user ID 1 is current user
        const currentUserId = 1;
        return watchers.some(watcher => watcher.id === currentUserId);
    };

    // Toggle watch function
    const handleToggleWatch = async () => {
        if (isCurrentUserWatching()) {
            // If already watching, unwatch
            const currentUserId = 1; // In a real app, get from auth
            await handleRemoveWatcher(currentUserId);
        } else {
            // If not watching, add as watcher
            await handleAddWatcher(1); // In a real app, use actual user ID
        }
    };

    // Update the task creation function
    const handleCreateTask = async () => {
        if (!newTaskTitle.trim()) {
            message.error('Task title is required');
            return;
        }

        try {
            setIsCreatingTask(true);

            // Create payload for TaskRequestDTO
            const taskData = {
                name: newTaskTitle,
                description: '',
                userStoryId: parseInt(userStoryId),
                statusId: newTaskStatusId,
                assigneeIds: newTaskAssignee ? [newTaskAssignee] : [] // Convert single assignee to array for API
            };

            console.log('Creating task with data:', taskData);
            const response = await axios.post('/api/tasks', taskData);
            console.log('Task created successfully, response:', response.data);

            // Refresh tasks list
            await fetchUserStoryTasks();

            // Reset form
            setNewTaskTitle('');
            setNewTaskStatusId(1);
            setNewTaskAssignee(null);
            setIsCreatingTask(false);

            message.success('Task created successfully');

            // Record activity
            await recordActivity('task_created', `New task "${newTaskTitle}" created`);
            triggerActivitiesRefresh();

        } catch (err) {
            console.error('Error creating task:', err);
            message.error('Failed to create task: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsCreatingTask(false);
        }
    };

    const handleSubmitComment = async () => {
        if (newComment.trim() === '') return;

        try {
            // Store current scroll position
            const commentSection = commentSectionRef.current;
            const scrollPosition = window.scrollY;

            console.log('Submitting comment:', newComment);
            const response = await axios.post(`/api/kanban/board/userstory/${userStoryId}/comments`, {
                content: newComment,
                userId: getCurrentUserId()
            });
            console.log('Submit comment response:', response.data);
            setComments(response.data);
            setNewComment('');
            message.success('Comment added successfully');

            await recordActivity('comment_added', 'Added a new comment');
            triggerActivitiesRefresh();

            // Restore scroll position after state updates
            setTimeout(() => {
                window.scrollTo({
                    top: scrollPosition,
                    behavior: 'auto'
                });

                // If new comment is added, scroll the comment section into view
                if (commentSection) {
                    commentSection.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }
            }, 100);
        } catch (error) {
            console.error('Error posting comment:', error);
            console.error('Error details:', error.response?.data);
            message.error('Failed to add comment. Please try again.');
        }
    };

    // Add a function to get the task status name from ID
    const getTaskStatusName = (statusId) => {
        if (!statusId) return 'New';
        const foundStatus = taskStatuses.find(s => s.id === statusId);
        return foundStatus ? foundStatus.name : 'New';
    };

    // Add a function to get the task status color from ID
    const getTaskStatusColor = (statusId) => {
        if (!statusId) return 'bg-gray-300';
        const status = taskStatuses.find(s => s.id === statusId);
        return status ? status.color : 'bg-gray-300';
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', `userstory/${userStoryId}`);

            // Determine the correct upload endpoint based on file type
            let uploadEndpoint = '/api/v1/files/upload/raw'; // Default for documents

            if (file.type.startsWith('image/')) {
                uploadEndpoint = '/api/v1/files/upload/image';
            } else if (file.type.startsWith('video/')) {
                uploadEndpoint = '/api/v1/files/upload/video';
            }

            // Upload file to cloudinary
            const uploadResponse = await axios.post(uploadEndpoint, formData);

            if (uploadResponse.data) {
                // Tạo attachment mới với dữ liệu từ response Cloudinary
                const newAttachment = {
                    id: `temp-${Date.now()}`, // ID tạm thời
                    filename: file.name,
                    contentType: file.type,
                    fileSize: file.size,
                    url: uploadResponse.data.secure_url || uploadResponse.data.url,
                    createdAt: new Date().toISOString()
                };

                // Cập nhật userStory để hiển thị attachment mới ngay lập tức - optimistic update
                setUserStory(prev => ({
                    ...prev,
                    attachments: [...(prev.attachments || []), newAttachment]
                }));

                message.success('File attached successfully!');

                // Sau đó mới gọi API để lưu attachment vào server - không đợi phản hồi
                const attachmentData = {
                    filename: file.name,
                    contentType: file.type,
                    fileSize: file.size,
                    url: uploadResponse.data.secure_url || uploadResponse.data.url
                };

                // Gửi request nhưng không chờ đợi kết quả
                axios.post(`/api/kanban/board/userstory/${userStoryId}/attachment`, attachmentData, {
                    headers: {
                        'User-Id': getCurrentUserId()
                    }
                })
                    .then(response => {
                        console.log('Attachment saved to server:', response.data);
                        // Không cần làm gì thêm vì đã cập nhật UI trước đó
                    })
                    .catch(error => {
                        console.error('Error saving attachment to server:', error);
                        // Vẫn giữ UI đã cập nhật - user không cần biết về lỗi này
                    });

                // Ghi lại hoạt động 
                recordActivity('attachment_added', `Added attachment: ${file.name}`)
                    .catch(error => console.error('Error recording activity:', error));

            } else {
                message.error('Failed to upload file to cloud storage');
            }
        } catch (err) {
            console.error('Error uploading file:', err);
            message.error('Error uploading file: ' + (err.message || 'Unknown error'));
        } finally {
            setIsUploading(false);
            // Clear the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDownloadAttachment = (attachment) => {
        try {
            // Xác định nếu là loại file đặc biệt cần xử lý đặc biệt (pdf, doc, docx, xls, xlsx)
            const fileExt = attachment.filename.split('.').pop().toLowerCase();
            const specialTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];

            if (attachment.contentType && attachment.contentType.startsWith('image/')) {
                // Đối với hình ảnh, mở trong tab mới
                window.open(attachment.url, '_blank');
            } else if (specialTypes.includes(fileExt)) {
                // Với các loại file đặc biệt, chúng ta sử dụng fetch để lấy blob
                fetch(attachment.url)
                    .then(response => response.blob())
                    .then(blob => {
                        // Tạo một URL tạm thời từ blob và tên file gốc
                        const blobUrl = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.setAttribute('download', attachment.filename);
                        document.body.appendChild(link);
                        link.click();
                        // Giải phóng URL sau khi tải xuống
                        setTimeout(() => {
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(blobUrl);
                        }, 100);
                    })
                    .catch(err => {
                        console.error('Error downloading file:', err);
                        message.error('Failed to download file. Try again or contact admin.');
                        // Fallback to direct open
                        window.open(attachment.url, '_blank');
                    });
            } else {
                // Với các loại file khác, sử dụng phương pháp tải xuống thông thường
                const link = document.createElement('a');
                link.href = attachment.url;
                link.setAttribute('download', attachment.filename);
                link.setAttribute('target', '_blank');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('Error in download handler:', error);
            message.error('Failed to download file');
            // Fallback to direct open
            window.open(attachment.url, '_blank');
        }
    };

    // Add function to fetch statuses
    const fetchUserStoryStatuses = async (projectId) => {
        try {
            if (!projectId) {
                console.error("Project ID is required to fetch user story statuses");
                return;
            }

            const response = await axios.get(`/api/kanban/board/project/${projectId}/statuses`);
            if (response.data && Array.isArray(response.data)) {
                console.log("Fetched user story statuses:", response.data);
                setStatuses(response.data);
            }
        } catch (error) {
            console.error('Error fetching user story statuses:', error);
            // Set default statuses as fallback
            setStatuses([
                { id: 1, name: 'NEW', color: '#3498db' },
                { id: 2, name: 'READY', color: '#e74c3c' },
                { id: 3, name: 'IN PROGRESS', color: '#f39c12' },
                { id: 4, name: 'READY FOR TEST', color: '#f1c40f' },
                { id: 5, name: 'DONE', color: '#2ecc71' },
                { id: 6, name: 'ARCHIVED', color: '#95a5a6' }
            ]);
        }
    };

    // Add function to fetch task statuses
    const fetchTaskStatuses = async (projectId) => {
        try {
            console.log('Fetching task statuses for project:', projectId);
            const response = await axios.get(`/api/tasks/project/${projectId}/statuses`);
            if (response.data) {
                console.log('Task statuses:', response.data);
                setTaskStatuses(response.data);
            }
        } catch (error) {
            console.error('Error fetching task statuses:', error);
            // Set default statuses as fallback
            setTaskStatuses([
                { id: 1, name: 'New', color: '#3498db' },
                { id: 2, name: 'In progress', color: '#f39c12' },
                { id: 3, name: 'Ready for test', color: '#f1c40f' },
                { id: 4, name: 'READY FOR TEST', color: '#f1c40f' },
                { id: 5, name: 'DONE', color: '#2ecc71' },
                { id: 6, name: 'ARCHIVED', color: '#95a5a6' }
            ]);
        }
    };

    // Add useEffect to fetch statuses when the component mounts
    useEffect(() => {
        if (userStory && userStory.projectId) {
            fetchUserStoryStatuses(userStory.projectId);
            fetchTaskStatuses(userStory.projectId);
            fetchAvailableTags(userStory.projectId);
        }
    }, [userStory, fetchAvailableTags]);

    // Add function to handle adding a tag to a user story
    const handleAddTag = async (tagId) => {
        try {
            console.log(`Adding tag ${tagId} to user story ${userStoryId}`);

            // Find the tag in projectTags to get its details for optimistic UI update
            const tagToAdd = projectTags.find(tag => tag.id === tagId);

            // Optimistically update UI before API call completes
            if (tagToAdd && userStory) {
                // Create a new tags array with the new tag added
                const updatedTags = [...(userStory.tags || []), tagToAdd];
                // Update user story with the new tags
                setUserStory({
                    ...userStory,
                    tags: updatedTags
                });
                // Hide the dropdown
                setShowTagsDropdown(false);
            }

            // Send the API request
            const response = await axios.post(`/api/kanban/board/userstory/${userStoryId}/tags/${tagId}`);

            if (response.data) {
                // Success notification
                message.success('Tag added successfully');

                // Record activity
                await recordActivity('tag_added', `Added tag to user story`);

                // Trigger activities refresh
                triggerActivitiesRefresh();

                // No need to call fetchUserStory here since we've already updated the UI
            }
        } catch (error) {
            console.error('Error adding tag to user story:', error);
            message.error('Failed to add tag to user story');

            // Refresh user story data to restore correct state in case of error
            await fetchUserStory();
        }
    };

    // Add function to handle removing a tag from a user story
    const handleRemoveTag = async (tagId) => {
        try {
            console.log(`Removing tag ${tagId} from user story ${userStoryId}`);

            // Optimistic update - remove the tag locally immediately before API call
            if (userStory && userStory.tags) {
                const updatedTags = userStory.tags.filter(tag => tag.id !== tagId);
                setUserStory({ ...userStory, tags: updatedTags });
            }

            // Then send the API request
            const response = await axios.delete(`/api/kanban/board/userstory/${userStoryId}/tags/${tagId}`);

            if (response.status === 200) {
                message.success('Tag removed successfully');

                // Record activity
                await recordActivity('tag_removed', `Removed tag from user story`);

                // Trigger activities refresh
                triggerActivitiesRefresh();
            }
        } catch (error) {
            console.error('Error removing tag from user story:', error);
            message.error('Failed to remove tag from user story');
            // Refresh user story data to restore correct state
            await fetchUserStory();
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            console.log(`Deleting comment ID ${commentId} from user story ${userStoryId}`);

            // Optimistic UI update - remove comment from state immediately
            const previousComments = [...comments];
            setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));

            // Show pending status
            toast.info('Deleting comment...');

            // Set up request timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            // Call the API to delete the comment
            await axios.delete(`/api/kanban/board/userstory/${userStoryId}/comments/${commentId}`, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Show success message
            toast.success('Comment deleted successfully');

            // Record the activity
            await recordActivity('comment_deleted', 'Deleted a comment');

            // Refresh activities list
            triggerActivitiesRefresh();
        } catch (error) {
            console.error('Error deleting comment:', error);
            console.error('Response data:', error.response?.data);
            console.error('Status code:', error.response?.status);

            // Revert optimistic update if there was an error
            if (error.name === 'AbortError') {
                // Request timed out
                toast.error('Request timeout. The server took too long to respond.');

                // Still trigger refresh to make sure our UI is updated with the latest state
                triggerActivitiesRefresh();
            } else {
                // Other errors - revert the change and show error message
                setComments(previousComments);
                toast.error(`Failed to delete comment: ${error.response?.data || error.message}`);
            }
        }
    };

    // Update the loading display
    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 h-64">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading user story details...</p>
                </div>
            </div>
        );
    }

    // Only show error if we're not loading and there's actually an error
    if (!loading && error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
                <p className="font-bold mb-2">Error</p>
                <p>{error}</p>
                <button
                    className="mt-4 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded"
                    onClick={() => window.history.back()}
                >
                    Go Back
                </button>
            </div>
        );
    }

    // If we don't have user story data but we're not in an error state,
    // show the loading indicator to avoid flashing "not found" message
    if (!userStory) {
        return (
            <div className="flex items-center justify-center p-8 h-64">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading user story details...</p>
                </div>
            </div>
        );
    }

    // Ensure safe access to user story properties
    const getStatusName = (statusId) => {
        if (!statusId) return 'UNKNOWN';
        const foundStatus = statuses.find(s => s.id === statusId);
        return foundStatus ? foundStatus.name : 'UNKNOWN';
    };

    const getStatusColor = (statusId) => {
        if (!statusId) return '#cccccc';
        const status = statuses.find(s => s.id === statusId);
        return status ? status.color : '#cccccc';
    };

    return (
        <div className="flex flex-col bg-gray-50 border border-gray-200 rounded shadow-sm">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <div className="flex items-center">
                    <span className="text-blue-500 font-bold mr-2">#{userStory.id}</span>
                    {editMode ? (
                        <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="font-bold border border-gray-300 rounded px-2 py-1 mr-2"
                        />
                    ) : (
                        <span className="font-bold">{userStory.name}</span>
                    )}
                    <span className="ml-2 text-red-500 cursor-pointer" onClick={() => setShowDueDateModal(true)}>
                        <Clock size={16} className="inline" />
                        <span className="ml-1">
                            {userStory.dueDate ? new Date(userStory.dueDate).toLocaleDateString() : 'Set due date'}
                        </span>
                    </span>
                    <span className="ml-4 text-gray-400 text-sm">USER STORY</span>
                </div>
                <div className="flex items-center">
                    <button
                        onClick={handleEditToggle}
                        className="text-gray-700 font-semibold px-4 py-1 mr-2"
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
                    <div className="relative">
                        <button
                            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                            className={`text-white px-3 py-1 rounded-sm ml-2 flex items-center`}
                            style={{ backgroundColor: getStatusColor(userStory.statusId) }}
                        >
                            {getStatusName(userStory.statusId)} <ChevronDown size={16} />
                        </button>

                        {showStatusDropdown && (
                            <div className="dropdown-menu dropdown-arrow-down absolute z-50 right-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg">
                                {statuses.map(status => (
                                    <div
                                        key={status.id}
                                        className={`flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer ${status.id === userStory.statusId ? 'bg-gray-100' : ''}`}
                                        onClick={() => handleStatusChange(status.id)}
                                    >
                                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: status.color }}></div>
                                        <span>{status.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex">
                {/* Left content area */}
                <div className="flex-grow p-4 border-r border-gray-200">
                    {/* Epic link */}
                    <div className="mb-6">
                        <a href="#" className="text-blue-500 flex items-center">
                            <span className="mr-2">🔗</span>
                            Link to epic
                        </a>
                    </div>

                    {/* Taskboard section */}
                    <div className="mb-6">
                        <div className="bg-gray-100 py-2 px-4 text-sm font-semibold">
                            TAGS
                        </div>
                        <div className="flex mt-2 space-x-2 flex-wrap">
                            {userStory.tags && userStory.tags.length > 0 ? (
                                userStory.tags.map(tag => (
                                    <div
                                        key={tag.id}
                                        className="flex items-center px-3 py-1 rounded-sm text-white mb-2"
                                        style={{ backgroundColor: tag.color || '#cccccc' }}
                                    >
                                        <span>{tag.name}</span>
                                        <button
                                            type="button"
                                            className="ml-1 cursor-pointer bg-transparent border-0 p-0 text-white focus:outline-none"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log("Tag removal button clicked for tag ID:", tag.id);
                                                handleRemoveTag(tag.id);
                                            }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <span className="text-gray-500 italic">No tags applied</span>
                            )}
                            <div className="relative">
                                <button
                                    className="bg-white border border-gray-300 px-3 py-1 rounded-sm flex items-center text-sm mb-2"
                                    onClick={() => setShowTagsDropdown(!showTagsDropdown)}
                                >
                                    Add tag <Plus size={14} className="ml-1" />
                                </button>

                                {showTagsDropdown && (
                                    <div className="dropdown-menu dropdown-arrow-down absolute z-50 left-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg">
                                        {projectTags.length > 0 ? (
                                            projectTags
                                                .filter(tag => !userStory.tags || !userStory.tags.some(t => t.id === tag.id))
                                                .map(tag => (
                                                    <div
                                                        key={tag.id}
                                                        className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                        onClick={() => handleAddTag(tag.id)}
                                                    >
                                                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: tag.color }}></div>
                                                        <span>{tag.name}</span>
                                                    </div>
                                                ))
                                        ) : (
                                            <div className="px-4 py-2 text-gray-500">No available tags</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description area */}
                    <div className="mb-6 min-h-32">
                        {editMode ? (
                            <textarea
                                value={editedDescription}
                                onChange={(e) => setEditedDescription(e.target.value)}
                                className="w-full h-32 border border-gray-300 rounded p-2"
                                placeholder="Enter a description for this user story..."
                            />
                        ) : (
                            userStory.description || <span className="text-gray-400 italic">Empty space is so boring... go on, be descriptive...</span>
                        )}
                    </div>

                    {/* Created by info */}
                    <div className="text-right text-sm text-gray-500 mb-8">
                        <span>Created by {userStory.createdByFullName || 'Unknown'} ({userStory.createdByUsername})</span>
                        <br />
                        <span>{new Date(userStory.createdAt).toLocaleString()}</span>
                    </div>

                    {/* Attachments section */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2 py-2 bg-gray-100">
                            <div className="px-4 font-semibold">
                                {userStory.attachments?.length || 0} Attachments
                            </div>
                            <button
                                className="mr-2 bg-blue-100 hover:bg-blue-200 p-1 rounded"
                                onClick={handleUploadClick}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <LoadingOutlined />
                                ) : (
                                    <Plus size={16} className="text-blue-500" />
                                )}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            />
                        </div>
                        {userStory.attachments && userStory.attachments.length > 0 ? (
                            <div className="space-y-2">
                                {userStory.attachments.map(attachment => (
                                    <div key={attachment.id || `temp-${Date.now()}-${attachment.filename}`} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                        <div className="flex items-center">
                                            <FileText className="mr-2 text-blue-500" />
                                            <span className="text-gray-700">{attachment.filename}</span>
                                        </div>
                                        <button
                                            className="text-blue-500 hover:text-blue-700"
                                            onClick={() => handleDownloadAttachment(attachment)}
                                        >
                                            <Download size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border border-dashed border-gray-300 py-8 text-center text-gray-400">
                                Drop attachments here!
                            </div>
                        )}
                    </div>

                    {/* Tasks section */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2 bg-gray-100 py-2 px-4">
                            <div className="font-semibold">
                                Tasks
                            </div>
                            <button
                                className="bg-blue-100 hover:bg-blue-200 p-1 rounded"
                                onClick={() => setIsCreatingTask(!isCreatingTask)}
                            >
                                <Plus size={16} className="text-blue-500" />
                            </button>
                        </div>

                        {/* Task creation form */}
                        {isCreatingTask && (
                            <div className="flex items-center mb-3 p-2 bg-teal-100 rounded">
                                <input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder="Type the new task subject"
                                    className="flex-grow px-3 py-2 border border-gray-300 rounded-l focus:outline-none"
                                />

                                {/* Status dropdown */}
                                <div className="relative">
                                    <button
                                        className="flex items-center px-3 py-2 border border-gray-300 text-white"
                                        style={{ backgroundColor: taskStatuses.find(s => s.id === newTaskStatusId)?.color || '#cccccc' }}
                                        onClick={() => setShowTaskStatusDropdown(!showTaskStatusDropdown)}
                                    >
                                        {taskStatuses.find(s => s.id === newTaskStatusId)?.name || 'New'} <ChevronDown size={14} className="ml-1" />
                                    </button>

                                    {showTaskStatusDropdown && (
                                        <div className="dropdown-menu dropdown-arrow-down absolute z-50 right-0 mt-1 w-40 bg-white border border-gray-200 rounded shadow-lg">
                                            {taskStatuses.map(status => (
                                                <div
                                                    key={status.id}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                                    onClick={() => {
                                                        setNewTaskStatusId(status.id);
                                                        setShowTaskStatusDropdown(false);
                                                    }}
                                                >
                                                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: status.color }}></div>
                                                    {status.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Assignee dropdown */}
                                <div className="relative">
                                    <button
                                        className="flex items-center px-3 py-2 border border-gray-300 bg-white border-l-0"
                                        onClick={() => setShowTaskAssigneeDropdown(!showTaskAssigneeDropdown)}
                                    >
                                        <div className="flex items-center">
                                            <div className="w-6 h-6 bg-gray-200 rounded-md flex items-center justify-center mr-1">
                                                {newTaskAssignee ?
                                                    availableAssignees.find(a => a.id === newTaskAssignee)?.fullName.split(' ').map(n => n[0]).join('')
                                                    : 'NA'}
                                            </div>
                                            {newTaskAssignee ?
                                                availableAssignees.find(a => a.id === newTaskAssignee)?.fullName
                                                : 'Not assigned'}
                                        </div>
                                        <ChevronDown size={14} className="ml-1" />
                                    </button>

                                    {showTaskAssigneeDropdown && (
                                        <div className="dropdown-menu dropdown-arrow-down absolute z-50 right-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg">
                                            <div
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => {
                                                    setNewTaskAssignee(null);
                                                    setShowTaskAssigneeDropdown(false);
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <div className="w-6 h-6 bg-gray-200 rounded-md flex items-center justify-center mr-2">
                                                        NA
                                                    </div>
                                                    Not assigned
                                                </div>
                                            </div>

                                            {availableAssignees.map(assignee => (
                                                <div
                                                    key={assignee.id}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() => {
                                                        setNewTaskAssignee(assignee.id);
                                                        setShowTaskAssigneeDropdown(false);
                                                    }}
                                                >
                                                    <div className="flex items-center">
                                                        <div className="w-6 h-6 bg-purple-300 rounded-md flex items-center justify-center mr-2 text-xs text-white">
                                                            {assignee.fullName.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        {assignee.fullName}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Create button */}
                                <button
                                    className="px-3 py-2 bg-teal-500 text-white rounded-r hover:bg-teal-600"
                                    onClick={handleCreateTask}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        )}

                        {/* Tasks list */}
                        <div className="space-y-2">
                            {userStoryTasks.length === 0 ? (
                                <div className="text-gray-500 text-center py-4">No tasks yet</div>
                            ) : (
                                userStoryTasks.map(task => {
                                    // Use the statusId to get the name
                                    const statusName = getTaskStatusName(task.statusId);
                                    const statusColor = getTaskStatusColor(task.statusId);

                                    return (
                                        <div key={task.id} className="flex justify-between items-center border-b pb-2">
                                            <div className="flex items-center">
                                                <span className="text-gray-400 mr-2">::</span>
                                                <a href={`/projects/${userStory.projectId}/task/${task.id}`} className="text-blue-500 mr-2 hover:underline">#{task.id}</a>
                                                <span>{task.subject || "Unnamed Task"}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <button className={`${statusColor} text-white px-2 py-1 rounded-sm text-sm flex items-center`} style={{ backgroundColor: statusColor }}>
                                                    {statusName} <ChevronDown size={14} className="ml-1" />
                                                </button>
                                                <div className="ml-2 w-6 h-6 bg-gray-200 rounded-sm flex items-center justify-center text-xs">
                                                    {task.assignedToName ?
                                                        task.assignedToName.substring(0, 2).toUpperCase() :
                                                        task.assignees && task.assignees.length > 0 ?
                                                            task.assignees[0].fullName.substring(0, 2).toUpperCase() :
                                                            'NA'
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Comments and Activities section */}
                    <div className="mt-8 border-t border-gray-200 pt-4">
                        <div className="flex border-b border-gray-200">
                            <button
                                className={`px-4 py-2 ${activeTab === 'comments' ? 'font-semibold border-b-2 border-red-500' : 'text-gray-500'}`}
                                onClick={() => setActiveTab('comments')}
                            >
                                {comments?.length || 0} Comments
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
                            <div className="mt-6">
                                <div ref={commentSectionRef} className="space-y-4">
                                    {comments?.map((comment) => (
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
                                                        <div className="flex items-center">
                                                            <span className="text-gray-500 text-sm mr-2">
                                                                {new Date(comment.createdAt).toLocaleString()}
                                                            </span>
                                                            {/* Always show delete button for all comments */}
                                                            <button
                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                className="text-red-500 hover:text-red-700 ml-1 p-1"
                                                                title="Delete comment"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="mt-1 text-gray-700">{comment.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6">
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
                            <div className="mt-6">
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

                {/* Right sidebar */}
                <div className="w-64 p-4 bg-white">
                    <div className="mb-6">
                        <div className="text-gray-500 text-sm mb-2">ASSIGNED</div>
                        <div className="space-y-2">
                            {assignedUsers && assignedUsers.length > 0 ? (
                                assignedUsers.map(user => (
                                    <div key={user.id} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-purple-300 rounded-md flex items-center justify-center text-white mr-2">
                                                {user.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : '?'}
                                            </div>
                                            <div>
                                                <div className="font-medium">{user.fullName || user.username}</div>
                                                <div className="text-xs text-gray-500">@{user.username}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveAssignee(user.id)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-gray-500">No users assigned</div>
                            )}

                            <div className="relative">
                                <button
                                    onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                                    className="text-gray-500 flex items-center text-sm"
                                >
                                    <Plus size={14} className="mr-1" /> Add assigned
                                </button>
                                {showAssigneeDropdown && (
                                    <div className="dropdown-menu dropdown-arrow-down absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg">
                                        {availableAssignees
                                            .filter(user => !assignedUsers.some(assigned => assigned.id === user.id))
                                            .map(user => (
                                                <div
                                                    key={user.id}
                                                    onClick={() => handleAssignUser(user.id)}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                                >
                                                    <div className="w-6 h-6 bg-purple-300 rounded-md flex items-center justify-center text-white mr-2 text-xs">
                                                        {user.fullName.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{user.fullName}</div>
                                                        <div className="text-xs text-gray-500">@{user.username}</div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="text-gray-500 text-sm mb-2">WATCHERS</div>
                        <div className="space-y-2">
                            {watchers.map(user => (
                                <div key={user.id} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-purple-300 rounded-md flex items-center justify-center text-white mr-2">
                                            {user.fullName.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div className="font-medium">{user.fullName}</div>
                                            <div className="text-xs text-gray-500">@{user.username}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveWatcher(user.id)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            <div className="relative">
                                <button
                                    onClick={() => setShowWatcherDropdown(!showWatcherDropdown)}
                                    className="text-gray-500 flex items-center text-sm"
                                >
                                    <Plus size={14} className="mr-1" /> Add watchers
                                </button>
                                {showWatcherDropdown && (
                                    <div className="dropdown-menu dropdown-arrow-down absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg">
                                        {availableAssignees
                                            .filter(user => !watchers.some(watcher => watcher.id === user.id))
                                            .map(user => (
                                                <div
                                                    key={user.id}
                                                    onClick={() => handleAddWatcher(user.id)}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                                >
                                                    <div className="w-6 h-6 bg-purple-300 rounded-md flex items-center justify-center text-white mr-2 text-xs">
                                                        {user.fullName.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{user.fullName}</div>
                                                        <div className="text-xs text-gray-500">@{user.username}</div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-end text-sm mt-2">
                            <button
                                className="text-gray-500 flex items-center hover:text-blue-500"
                                onClick={handleToggleWatch}
                            >
                                {isCurrentUserWatching() ? (
                                    <>
                                        <EyeOff size={14} className="mr-1" /> Unwatch
                                    </>
                                ) : (
                                    <>
                                        <Eye size={14} className="mr-1" /> Watch
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Points section */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-gray-500 text-sm">POINTS</div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <div>UX</div>
                                {editMode ? (
                                    <input
                                        type="number"
                                        min="0"
                                        value={editedUxPoints}
                                        onChange={(e) => handlePointChange('ux', e.target.value)}
                                        className="w-16 text-right border border-gray-300 rounded px-2 py-1"
                                    />
                                ) : (
                                    <div className="text-gray-500">{userStory.uxPoints || '?'}</div>
                                )}
                            </div>
                            <div className="flex justify-between items-center">
                                <div>Design</div>
                                {editMode ? (
                                    <input
                                        type="number"
                                        min="0"
                                        value={editedDesignPoints}
                                        onChange={(e) => handlePointChange('design', e.target.value)}
                                        className="w-16 text-right border border-gray-300 rounded px-2 py-1"
                                    />
                                ) : (
                                    <div className="text-gray-500">{userStory.designPoints || '?'}</div>
                                )}
                            </div>
                            <div className="flex justify-between items-center">
                                <div>Front</div>
                                {editMode ? (
                                    <input
                                        type="number"
                                        min="0"
                                        value={editedFrontPoints}
                                        onChange={(e) => handlePointChange('front', e.target.value)}
                                        className="w-16 text-right border border-gray-300 rounded px-2 py-1"
                                    />
                                ) : (
                                    <div className="text-gray-500">{userStory.frontPoints || '?'}</div>
                                )}
                            </div>
                            <div className="flex justify-between items-center">
                                <div>Back</div>
                                {editMode ? (
                                    <input
                                        type="number"
                                        min="0"
                                        value={editedBackPoints}
                                        onChange={(e) => handlePointChange('back', e.target.value)}
                                        className="w-16 text-right border border-gray-300 rounded px-2 py-1"
                                    />
                                ) : (
                                    <div className="text-gray-500">{userStory.backPoints || '?'}</div>
                                )}
                            </div>
                            <div className="flex justify-between items-center border-t border-gray-200 pt-2">
                                <div>total points</div>
                                <div className="text-gray-500">
                                    {editMode
                                        ? (editedUxPoints + editedBackPoints + editedFrontPoints + editedDesignPoints)
                                        : ((userStory.uxPoints || 0) + (userStory.backPoints || 0) +
                                            (userStory.frontPoints || 0) + (userStory.designPoints || 0))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end space-x-2 mt-8">
                        <button
                            className="bg-red-500 p-2 rounded text-white"
                            onClick={() => setShowDueDateModal(true)}
                        >
                            <Clock size={16} />
                        </button>
                        <button className="bg-gray-100 p-2 rounded text-gray-500 hover:bg-gray-200">
                            <Users size={16} />
                        </button>
                        <button className="bg-gray-100 p-2 rounded text-gray-500 hover:bg-gray-200">
                            <Paperclip size={16} />
                        </button>
                        <button
                            className={`p-2 rounded ${userStory.blocked || userStory.isBlocked ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'} hover:${userStory.blocked || userStory.isBlocked ? 'bg-red-600' : 'bg-gray-200'}`}
                            onClick={handleToggleBlocked}
                            title={userStory.blocked || userStory.isBlocked ? 'Unblock this user story' : 'Block this user story'}
                        >
                            <Lock size={16} />
                        </button>
                        <button className="bg-gray-100 p-2 rounded text-gray-500 hover:bg-gray-200">
                            <List size={16} />
                        </button>
                        <button
                            className="bg-red-500 p-2 rounded text-white hover:bg-red-600"
                            onClick={handleDeleteUserStory}
                            title="Delete this user story"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Due Date Modal */}
            {showDueDateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Set due date</h3>
                            <button
                                onClick={() => setShowDueDateModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-4 relative">
                            <input
                                type="text"
                                value={selectedDate ? selectedDate.toLocaleDateString() : ''}
                                onClick={() => setShowDatePicker(!showDatePicker)}
                                placeholder="Select date"
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                readOnly
                            />
                            {showDatePicker && (
                                <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded shadow-lg">
                                    <DatePicker
                                        selected={selectedDate || new Date()}
                                        onChange={(date) => {
                                            setSelectedDate(date);
                                            setShowDatePicker(false);
                                        }}
                                        inline
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex space-x-2 mb-4">
                            <button
                                onClick={() => handleQuickDateSelect(7)}
                                className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded text-sm"
                            >
                                In one week
                            </button>
                            <button
                                onClick={() => handleQuickDateSelect(14)}
                                className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded text-sm"
                            >
                                In two weeks
                            </button>
                            <button
                                onClick={() => handleQuickDateSelect(30)}
                                className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded text-sm"
                            >
                                In one month
                            </button>
                            <button
                                onClick={() => handleQuickDateSelect(90)}
                                className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded text-sm"
                            >
                                In three months
                            </button>
                        </div>

                        <div className="mb-4">
                            <h4 className="font-medium mb-2">Reason for the due date</h4>
                            <textarea
                                value={dueDateReason}
                                onChange={(e) => setDueDateReason(e.target.value)}
                                placeholder="Why does this user story need a due date?"
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                            />
                        </div>

                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => {
                                    setSelectedDate(null);
                                    setDueDateReason('');
                                }}
                                className="text-gray-500"
                            >
                                <X size={16} className="inline" /> Clear
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault(); // Prevent any default form submission
                                    console.log("Save button clicked");
                                    handleSaveDueDate();
                                }}
                                className="bg-teal-400 hover:bg-teal-500 text-white px-6 py-2 rounded font-medium"
                                disabled={!selectedDate}
                            >
                                SAVE
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}