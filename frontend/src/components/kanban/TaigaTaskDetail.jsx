import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckIcon } from '@heroicons/react/24/outline';
import { EyeOff, Save, Plus, ChevronDown, X, Clock, Users, Lock, List, Trash2, Eye, FileText, Download, Paperclip } from 'lucide-react';
import axios from '../../common/axios-customize';
import { Modal, message, Checkbox, DatePicker, TimePicker } from 'antd';
import dayjs from 'dayjs';
import { LoadingOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import eventBus from '../../common/eventBus';

const TaskDetail = () => {
    const { taskId, projectId } = useParams();
    const navigate = useNavigate();

    const [taskDetails, setTaskDetails] = useState({
        id: null,
        project: '',
        projectId: null,
        createdBy: 'Unknown',
        createdAt: '',
        attachments: [],
        comments: [],
        assignees: [],
        watchers: [],
        tags: [],
        statusId: null,
        subject: '',
        description: '',
        isBlocked: false,
        points: 0
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

    // Add tag related states
    const [projectTags, setProjectTags] = useState([]);
    const [showTagsDropdown, setShowTagsDropdown] = useState(false);

    // Add points state variables
    const [editedPoints, setEditedPoints] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    // Add activities state
    const [activitiesRefreshTrigger, setActivitiesRefreshTrigger] = useState(0);
    const commentSectionRef = useRef(null);

    // Attachments handling
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Add a new state variable for statuses
    const [statuses, setStatuses] = useState([]);

    // Add function to fetch available tags for the project
    const fetchAvailableTags = useCallback(async (projectId) => {
        try {
            if (!projectId) {
                console.warn('Cannot fetch tags: No project ID provided');
                return;
            }

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
            toast.error('Failed to load available tags');
            setProjectTags([]);
        }
    }, []);

    // Replace getStatusColor function
    const getStatusColor = (statusId) => {
        if (!statusId) return '#cccccc'; // Default color for null or undefined statusId
        const status = statuses.find(s => s.id === statusId);
        return status && status.color ? status.color : '#cccccc';
    };

    // Replace getStatusName function
    const getStatusName = (statusId) => {
        if (!statusId) return 'UNKNOWN'; // Default name for null or undefined statusId
        const status = statuses.find(s => s.id === statusId);
        return status ? status.name : 'UNKNOWN';
    };

    // Update fetchStatuses function to call the API directly
    const fetchStatuses = async (projId) => {
        try {
            // Use provided projId or fallback to 4 for debugging
            const projectIdToUse = projId || 4;

            console.log("Fetching task statuses with project ID:", projectIdToUse);

            // Always log the exact URL we're calling
            const apiUrl = `/api/tasks/project/${projectIdToUse}/statuses`;
            console.log("Calling status API with URL:", apiUrl);

            // Make the API call
            const response = await axios.get(apiUrl);
            console.log("Status API response:", response);

            if (response.data && Array.isArray(response.data)) {
                console.log("Fetched task statuses:", response.data);
                setStatuses(response.data);
            } else {
                console.error("Invalid response format for statuses:", response.data);
                message.error('Status data format is invalid');
            }
        } catch (error) {
            console.error('Error fetching task statuses:', error);
            if (error.response) {
                console.error('Error status:', error.response.status);
                console.error('Error data:', error.response.data);
            }
            message.error('Failed to load task statuses');
        }
    };

    const fetchComments = useCallback(async () => {
        let isMounted = true;
        const controller = new AbortController();

        try {
            const response = await axios.get(`/api/tasks/${taskId}/comments`, {
                signal: controller.signal
            });

            if (!isMounted) return;

            if (response.data) {
                // Update both the comments array and taskDetails
                const commentsData = response.data;
                setTaskDetails(prev => ({
                    ...prev,
                    comments: commentsData
                }));
            }
        } catch (error) {
            if (error.name === 'AbortError' || !isMounted) {
                return;
            }
            console.error('Error fetching comments:', error);
            message.error('Failed to load comments');
        }

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [taskId]);

    const fetchActivities = useCallback(async () => {
        let isMounted = true;
        const controller = new AbortController();

        try {
            setIsLoading(true);
            const response = await axios.get(`/api/kanban/board/${taskId}/activities`, {
                signal: controller.signal
            });

            if (!isMounted) return;

            setActivities(response.data);
        } catch (error) {
            if (error.name === 'AbortError' || !isMounted) {
                return;
            }
            console.error('Error fetching activities:', error);
            message.error('Failed to load activities');
            if (isMounted) {
                setActivities([]); // Set empty array on error
            }
        } finally {
            if (isMounted) {
                setIsLoading(false);
            }
        }

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [taskId]);

    const fetchTaskDetails = useCallback(async () => {
        let isMounted = true;
        const controller = new AbortController();

        const fetchInitialData = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`/api/tasks/${taskId}`, {
                    signal: controller.signal
                });

                if (!isMounted) return;

                const taskData = response.data;
                console.log('Received task data:', taskData);

                // Ensure task data has all required fields with defaults
                const processedTaskData = {
                    ...taskData,
                    // Filter out attachments with is_delete=true
                    attachments: (taskData.attachments || []).filter(attachment => !attachment.isDelete),
                    comments: taskData.comments || [],
                    assignees: taskData.assignees || [],
                    watchers: taskData.watchers || [],
                    tags: taskData.tags || [],
                    statusId: taskData.statusId || null
                };

                // Preserve existing comments when updating task details
                setTaskDetails(prev => ({
                    ...processedTaskData,
                    comments: prev?.comments || processedTaskData.comments || []
                }));

                // Initialize editable fields
                setEditedSubject(processedTaskData.subject || '');
                setEditedDescription(processedTaskData.description || '');
                setEditedDueDate(processedTaskData.dueDate ? new Date(processedTaskData.dueDate) : null);
                setIsBlocked(processedTaskData.isBlocked || false);
                setEditedPoints(processedTaskData.points || 0);

                // Directly fetch tags if projectId is available
                if (processedTaskData.projectId) {
                    console.log("Task has projectId, directly fetching tags:", processedTaskData.projectId);
                    fetchAvailableTags(processedTaskData.projectId);
                }

                // Fetch available assignees if project ID is available
                if (processedTaskData.userStoryId && isMounted) {
                    try {
                        const userStoryResponse = await axios.get(`/api/kanban/board/userstory/${processedTaskData.userStoryId}`, {
                            signal: controller.signal
                        });

                        if (!isMounted) return;

                        if (userStoryResponse.data && userStoryResponse.data.projectId) {
                            // Lưu lại projectId từ user story nếu task không có
                            if (!processedTaskData.projectId) {
                                setTaskDetails(prev => ({
                                    ...prev,
                                    projectId: userStoryResponse.data.projectId
                                }));
                                console.log('Updated projectId from userStory:', userStoryResponse.data.projectId);
                            }

                            fetchAvailableAssignees(userStoryResponse.data.projectId);

                            // Also fetch tags whenever we get the projectId
                            fetchAvailableTags(userStoryResponse.data.projectId);
                        }
                    } catch (innerErr) {
                        console.error('Error fetching user story:', innerErr);
                        // Continue execution, don't break on this error
                    }
                }

                if (isMounted) {
                    setError(null);
                }
            } catch (err) {
                if (err.name === 'AbortError' || !isMounted) {
                    // Ignore abort errors
                    return;
                }
                console.error('Error fetching task:', err);
                setError('Không thể tải dữ liệu nhiệm vụ. Vui lòng thử lại sau.');
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchInitialData();

        // Cleanup function to prevent state updates after unmount
        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [taskId]);

    // Initial data fetch
    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const fetchInitialData = async () => {
            try {
                await fetchTaskDetails();
                if (isMounted) {
                    await fetchComments();
                    await fetchActivities();

                    // Force fetch statuses with project ID 4 (from the URL)
                    if (projectId) {
                        console.log("Force fetching statuses with project ID from URL:", projectId);
                        fetchStatuses(projectId);
                    }
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };

        fetchInitialData();

        // Cleanup function to prevent state updates after unmount
        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [taskId, fetchTaskDetails, fetchComments, fetchActivities, projectId]);

    useEffect(() => {
        if (!taskDetails) return;

        if (taskDetails.watchers && taskDetails.watchers.length > 0) {
            // Ensure IDs are integers for consistent comparison
            const processedWatchers = taskDetails.watchers.map(watcher => ({
                ...watcher,
                id: parseInt(watcher.id)
            }));
            console.log('Processed watchers with integer IDs:', processedWatchers);
            setWatchers(processedWatchers);
        } else if (taskDetails && !taskDetails.watchers) {
            // Initialize with empty array if watchers is undefined
            setWatchers([]);
        }
    }, [taskDetails, taskDetails?.watchers]);

    useEffect(() => {
        if (!taskDetails) return;

        if (taskDetails.assignees && taskDetails.assignees.length > 0) {
            console.log('Assigned users from API:', taskDetails.assignees);
            // Kiểm tra cấu trúc của dữ liệu
            console.log('Sample assignee object structure:', taskDetails.assignees[0]);

            // Ensure IDs are integers for consistent comparison
            const processedAssignees = taskDetails.assignees.map(assignee => ({
                ...assignee,
                id: parseInt(assignee.id)
            }));
            console.log('Processed assignees with integer IDs:', processedAssignees);
            setAssignedUsers(processedAssignees);
        } else if (taskDetails.assignedTo && taskDetails.assignedToName) {
            // Handle legacy single assignee
            console.log('Legacy single assignee:', taskDetails.assignedTo, taskDetails.assignedToName);
            setAssignedUsers([{
                id: parseInt(taskDetails.assignedTo),
                fullName: taskDetails.assignedToName,
                username: taskDetails.assignedToName.toLowerCase().replace(/\s+/g, '.')
            }]);
        } else {
            // Không có người được gán
            console.log('No assignees found for this task');
            setAssignedUsers([]);
        }
    }, [taskDetails]);

    useEffect(() => {
        if (!taskDetails) return;

        setEditedSubject(taskDetails.subject || '');
        setEditedDescription(taskDetails.description || '');
        setEditedDueDate(taskDetails.dueDate ? new Date(taskDetails.dueDate) : null);
        setIsBlocked(taskDetails.isBlocked || false);
        setEditedPoints(taskDetails.points || 0);
    }, [taskDetails]);

    // Sửa useEffect để có cleanup và tránh vòng lặp vô hạn
    useEffect(() => {
        if (!taskDetails || !taskDetails.comments) return;

        // Chỉ cập nhật khi comments thực sự thay đổi để tránh vòng lặp
        const currentCommentsCount = taskDetails.comments.length;
        const prevCommentsCount = taskDetails.comments ? taskDetails.comments.length : 0;

        if (currentCommentsCount !== prevCommentsCount) {
            setTaskDetails(prev => ({
                ...prev,
                comments: taskDetails.comments
            }));
        }
    }, [taskDetails?.comments]);

    // Sửa useEffect để activities luôn được cập nhật khi có trigger và có cleanup
    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        if (taskId) {
            const loadData = async () => {
                try {
                    await fetchActivities();
                    if (isMounted && activeTab === 'comments') {
                        await fetchComments();
                    }
                } catch (error) {
                    if (isMounted) {
                        console.error('Error loading data:', error);
                    }
                }
            };

            loadData();
        }

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [taskId, activeTab, activitiesRefreshTrigger, fetchComments, fetchActivities]);

    // Near beginning of component, add this debug effect to check data
    useEffect(() => {
        // Debug log to check filtered users
        if (availableAssignees.length > 0) {
            console.log("All available assignees:", availableAssignees);
            console.log("Current assignedUsers:", assignedUsers);

            // Check how many users would be displayed in dropdown
            const filteredForDropdown = availableAssignees
                .filter(user => !assignedUsers.some(assigned => assigned.id === user.id));
            console.log("Filtered assignees for dropdown:", filteredForDropdown);
        }
    }, [availableAssignees, assignedUsers]);

    // Update the fetchAvailableAssignees function to correctly map userId to id
    const fetchAvailableAssignees = async (projectId) => {
        try {
            console.log("Fetching available assignees for task:", taskId, "with projectId:", projectId);

            if (!projectId) {
                console.error("Missing projectId, cannot fetch members");
                return;
            }

            // Using the direct project members API to get all members
            console.log("Using direct project members API");
            const response = await axios.get(`/api/projects/v1/user/${getCurrentUserId()}/project/${projectId}/members/list`);
            console.log("Project members API response:", response.data);

            if (response.data && response.data.data && Array.isArray(response.data.data)) {
                // CRITICAL FIX: Use userId from API as the id property, not member.userId
                const mappedUsers = response.data.data.map(member => {
                    console.log(`Member from API: userId=${member.userId}, name=${member.userFullName}`);
                    return {
                        id: parseInt(member.userId), // This is the key fix - use userId from the API
                        fullName: member.userFullName,
                        username: member.username,
                        photoUrl: member.avatar
                    };
                });

                console.log("Mapped project members:", mappedUsers);
                mappedUsers.forEach(user => {
                    console.log(`Mapped user: id=${user.id}, name=${user.fullName}`);
                });

                // Important: Save all project members, don't filter here
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
        // Sử dụng state để đánh dấu đã navigate để tránh navigate nhiều lần
        // Quay lại kanban board của project hoặc trang trước đó
        if (projectId) {
            navigate(`/projects/${projectId}/kanban`, { replace: true });
        } else {
            navigate(-1);
        }
    };

    const handleAddTag = async (tagId) => {
        try {
            console.log(`Adding tag ${tagId} to task ${taskId}`);

            // Find the tag in projectTags to get its details for optimistic UI update
            const tagToAdd = projectTags.find(tag => tag.id === tagId);

            // Optimistically update UI before API call completes
            if (tagToAdd && taskDetails) {
                // Create a new tags array with the new tag added
                const updatedTags = [...(taskDetails.tags || []), tagToAdd];
                // Update task details with the new tags
                setTaskDetails({
                    ...taskDetails,
                    tags: updatedTags
                });
                // Hide the dropdown
                setShowTagsDropdown(false);
            }

            // Send the API request
            const response = await axios.post(`/api/tasks/${taskId}/tags/${tagId}`);

            if (response.status === 200 || response.status === 201) {
                // Success notification
                toast.success('Tag added successfully');

                // Record activity
                await recordActivity('tag_added', `Added tag to task`);

                // Trigger activities refresh
                triggerActivitiesRefresh();

                // No need to call fetchTaskDetails here since we've already updated the UI
            }
        } catch (error) {
            console.error('Error adding tag to task:', error);
            toast.error('Failed to add tag to task');

            // Refresh task data to restore correct state in case of error
            await fetchTaskDetails();
        }
    };

    const handleRemoveTag = async (tagId) => {
        try {
            console.log(`Removing tag ${tagId} from task ${taskId}`);

            // Optimistic update - remove the tag locally immediately
            if (taskDetails && taskDetails.tags) {
                const updatedTags = taskDetails.tags.filter(tag => tag.id !== tagId);
                setTaskDetails({ ...taskDetails, tags: updatedTags });
            }

            // Then send the API request
            const response = await axios.delete(`/api/tasks/${taskId}/tags/${tagId}`);

            if (response.status === 200) {
                toast.success('Tag removed successfully');

                // Record activity
                await recordActivity('tag_removed', `Removed tag from task`);

                // Trigger activities refresh
                triggerActivitiesRefresh();
            }
        } catch (error) {
            console.error('Error removing tag from task:', error);
            toast.error('Failed to remove tag from task');
            // Refresh task data to restore correct state
            await fetchTaskDetails();
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

            // Không cần gọi trigger ở đây vì đã gọi trong handleAssignUser
        } catch (error) {
            console.error('Error self-assigning task:', error.response?.data || error.message);
        }
    };

    // Xử lý watchers
    const handleAddWatcher = async (userId) => {
        try {
            console.log(`Attempting to add watcher ${userId} to task ${taskId}`);
            // Ensure userId is a number before sending to API
            const numericUserId = parseInt(userId);
            // Gọi API để thêm người dùng vào watchers
            await axios.post(`/api/tasks/${taskId}/watchers/${numericUserId}`);

            // Refresh task data
            console.log("Add watcher successful, refreshing task data");
            await fetchTaskDetails();
            toast.success('Đã thêm người theo dõi');
            setShowWatcherDropdown(false);

            // Tự động làm mới activities
            triggerActivitiesRefresh();
        } catch (error) {
            console.error('Error adding watcher:', error.response?.data || error.message);
            toast.error('Không thể thêm người theo dõi');
        }
    };

    const handleRemoveWatcher = async (userId) => {
        try {
            console.log(`Attempting to remove watcher ${userId} from task ${taskId}`);

            // Ensure userId is a number
            const numericUserId = parseInt(userId);
            if (isNaN(numericUserId)) {
                console.error('Invalid user ID:', userId);
                message.error('User ID không hợp lệ');
                return;
            }

            // Gọi API để xóa người dùng khỏi watchers
            await axios.delete(`/api/tasks/${taskId}/watchers/${numericUserId}`);

            // Update UI immediately for better responsiveness
            setWatchers(prev => prev.filter(watcher => parseInt(watcher.id) !== numericUserId));

            // Refresh task data
            console.log("Remove watcher successful, refreshing task data");
            await fetchTaskDetails();
            toast.success('Đã xóa người theo dõi');

            // Tự động làm mới activities
            triggerActivitiesRefresh();
        } catch (error) {
            console.error('Error removing watcher:', error.response?.data || error.message);
            toast.error('Không thể xóa người theo dõi');

            // Refresh on error to ensure UI is in sync with server
            await fetchTaskDetails();
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

        // Không cần gọi trigger ở đây vì đã gọi trong handleRemoveWatcher/handleAddWatcher
    };

    const handleEditToggle = () => {
        if (editMode) {
            // Reset values when canceling edit
            setEditedSubject(taskDetails.subject || '');
            setEditedDescription(taskDetails.description || '');
            setEditedDueDate(taskDetails.dueDate ? new Date(taskDetails.dueDate) : null);

            // Khi hủy chỉnh sửa, ghi lại activity
            recordActivity('edit_canceled', 'Edit mode canceled');
        } else {
            // Khi bắt đầu chỉnh sửa, ghi lại activity
            recordActivity('edit_started', 'Started editing task');
        }
        setEditMode(!editMode);

        // Trigger làm mới hoạt động
        triggerActivitiesRefresh();
    };

    const handleDeleteTask = async () => {
        if (!window.confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            // Show a loading toast
            const loadingToastId = toast.loading('Deleting task...');

            try {
                // Sử dụng hard delete để xóa hoàn toàn khỏi database
                await axios.delete(`/api/tasks/${taskId}`);

                toast.update(loadingToastId, {
                    render: 'Task deleted successfully',
                    type: 'success',
                    isLoading: false,
                    autoClose: 2000
                });

                // Navigate back
                setTimeout(() => {
                    navigate(-1);
                }, 500);

            } catch (error) {
                console.error('Error deleting task:', error);
                toast.update(loadingToastId, {
                    render: 'Failed to delete task: ' + (error.response?.data?.message || error.message || 'Unknown error'),
                    type: 'error',
                    isLoading: false,
                    autoClose: 5000
                });
            }
        } catch (outerError) {
            // This catches errors in the toast or other outer code
            console.error('Outer error in delete task handler:', outerError);
            toast.error('An unexpected error occurred. Please try again.');
        }
    };

    const handleSubmitComment = async () => {
        if (newComment.trim() === '') return;

        try {
            // Store current scroll position
            const commentSection = commentSectionRef.current;
            const scrollPosition = window.scrollY;

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
            toast.success('Comment added successfully');

            // Ghi lại hoạt động
            await recordActivity(
                'comment_added',
                'Added a new comment'
            );

            // Trigger làm mới hoạt động
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
            toast.error('Failed to add comment. Please try again.');
        }
    };

    // Add handleDeleteComment function after handleSubmitComment
    const handleDeleteComment = async (commentId, userId) => {
        // Check if the user is trying to delete their own comment
        const currentUserId = getCurrentUserId();

        if (currentUserId !== userId) {
            toast.error('You can only delete your own comments');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            // Update local state immediately for better UI responsiveness
            const updatedComments = taskDetails.comments.filter(comment => comment.id !== commentId);
            setTaskDetails(prev => ({
                ...prev,
                comments: updatedComments
            }));

            // Show pending status
            toast.info('Deleting comment...');

            // Call the API to delete the comment with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await axios.delete(`/api/tasks/${taskId}/comments/${commentId}`, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Only show success message after the API completes
            if (response.status === 200) {
                toast.success('Comment deleted successfully');

                // Record the activity
                await recordActivity('comment_deleted', 'Deleted a comment');

                // Trigger refresh
                triggerActivitiesRefresh();
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            if (error.name === 'AbortError') {
                // The request was aborted due to timeout
                toast.error('Request timeout. The comment may have been deleted, but the server took too long to respond');

                // Still trigger refresh to ensure UI is updated
                triggerActivitiesRefresh();
            } else if (error.response && error.response.status === 403) {
                toast.error('You can only delete your own comments');

                // Revert the optimistic update
                await fetchComments();
            } else {
                toast.error('Failed to delete comment. Please try again.');

                // Revert the optimistic update
                await fetchComments();
            }
        }
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        setError(null);

        try {
            // Create a complete update object with all fields
            const updateData = {
                name: editedSubject,         // Changed from subject to name to match backend
                description: editedDescription || '',
                statusId: taskDetails.statusId,
                isBlocked: isBlocked,
                points: editedPoints,
                dueDate: editedDueDate,
                userStoryId: taskDetails.userStoryId // Ensure userStoryId is included
            };

            console.log('Updating task with data:', updateData);

            // Single API call with all data
            const response = await axios.put(`/api/tasks/${taskDetails.id}`, updateData);
            console.log('Update response:', response);

            // Update local state with response data
            setTaskDetails(prev => ({
                ...prev,
                ...response.data
            }));

            setEditMode(false);
            toast.success('Task updated successfully');

            // Record activity
            await recordActivity('task_updated', 'Task details updated');

            // Refresh data
            triggerActivitiesRefresh();
            await fetchTaskDetails();

        } catch (error) {
            console.error('Update failed:', error);
            if (error.response) {
                console.error('Error status:', error.response.status);
                console.error('Error data:', error.response.data);
                toast.error(`Failed to update task: ${error.response.data?.message || 'Unknown error'}`);
            } else {
                toast.error('Network error. Please check your connection and try again.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatusChange = async (newStatusId) => {
        try {
            // Ensure status IDs are numbers
            const previousStatusId = parseInt(taskDetails.statusId);
            const newStatusIdNumber = parseInt(newStatusId);

            const originalStatus = statuses.find(s => s.id === previousStatusId);
            const newStatus = statuses.find(s => s.id === newStatusIdNumber);

            console.log(`Changing status from ${previousStatusId} to ${newStatusIdNumber}`);
            console.log(`Original status: ${originalStatus?.name}, New status: ${newStatus?.name}`);

            // Update UI optimistically
            setTaskDetails(prev => ({
                ...prev,
                statusId: newStatusIdNumber
            }));

            // Close dropdown
            setShowStatusDropdown(false);

            // Use the same approach as TaigaUserStoryDetail.jsx
            // Send the statusId in the request body
            const response = await axios.put(`/api/tasks/${taskDetails.id}/status`, {
                statusId: newStatusIdNumber
            });

            console.log("Status update response:", response);

            // Record activity for status change
            await recordActivity(
                'status_updated',
                `Status changed from ${originalStatus?.name || previousStatusId} to ${newStatus?.name || newStatusIdNumber}`
            );

            // Add explicit call to refresh activities after status update
            triggerActivitiesRefresh();

            // Make sure to fetch activities regardless of active tab
            fetchActivities();

            // Show success message
            toast.success(`Task status updated to ${newStatus?.name || 'new status'}`);

            // Emit event to notify other components (like SprintProgressBar) about the status change
            // Check if task moved to/from Done status (status 5)
            if (previousStatusId === 5 || newStatusIdNumber === 5) {
                const sprintId = taskDetails.sprintId;
                console.log('Emitting task-status-changed event with sprintId:', sprintId);
                eventBus.emit('task-status-changed', {
                    taskId: taskDetails.id,
                    previousStatusId,
                    newStatusId: newStatusIdNumber,
                    sprintId
                });
            }
        } catch (error) {
            console.error('Error updating task status:', error);
            if (error.response) {
                console.error('Error status:', error.response.status);
                console.error('Error data:', error.response.data);
            }
            toast.error('Failed to update task status');

            // Revert on error
            setTaskDetails(prev => ({
                ...prev,
                statusId: previousStatusId
            }));
        }
    };

    // Sửa recordActivity để tránh cập nhật sau khi component unmount
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
            );

            // Luôn fetch activities sau khi ghi lại hoạt động, bất kể activeTab là gì
            // Sử dụng triggerActivitiesRefresh thay vì gọi trực tiếp fetchActivities 
            // để tránh cập nhật state khi component unmounted
            triggerActivitiesRefresh();
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
            toast.success('Due date updated successfully');

            // Record activity for due date change
            await recordActivity(
                'due_date_updated',
                `Due date changed to ${date ? date.format('YYYY-MM-DD') : 'None'}`
            );

            // Trigger làm mới hoạt động
            triggerActivitiesRefresh();
        } catch (err) {
            console.error('Error updating due date:', err);
            toast.error('Failed to update due date. Please try again.');
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

            toast.success(`Task ${newBlockStatus ? 'blocked' : 'unblocked'} successfully`);

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
            toast.error('Failed to update block status. Please try again.');
        }
    };

    // Attachments handling
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
            formData.append('folder', `task/${taskId}`);

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
                // Now save the attachment to the task
                const attachmentData = {
                    filename: file.name,
                    contentType: file.type,
                    fileSize: file.size,
                    url: uploadResponse.data.secure_url || uploadResponse.data.url
                };

                const attachResponse = await axios.post(`/api/kanban/board/${taskId}/attachment`, attachmentData);

                if (attachResponse.data) {
                    toast.success('File attached successfully!');

                    // Cập nhật UI ngay lập tức mà không cần tải lại trang
                    // Thêm tệp đính kèm mới vào danh sách hiện tại
                    const newAttachment = attachResponse.data;
                    setTaskDetails(prev => ({
                        ...prev,
                        attachments: [...(prev.attachments || []).filter(a => !a.isDelete), newAttachment]
                    }));

                    // Cập nhật hoạt động
                    triggerActivitiesRefresh();
                } else {
                    toast.error('Failed to attach file to task');
                }
            } else {
                toast.error('Failed to upload file to cloud storage');
            }
        } catch (err) {
            console.error('Error uploading file:', err);
            toast.error('Error uploading file: ' + (err.message || 'Unknown error'));
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
                        toast.error('Failed to download file. Try again or contact admin.');
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
            toast.error('Failed to download file');
            // Fallback to direct open
            window.open(attachment.url, '_blank');
        }
    };

    // Add function to delete attachment
    const handleDeleteAttachment = async (attachment) => {
        if (!window.confirm(`Are you sure you want to delete the attachment "${attachment.filename}"?`)) {
            return;
        }

        try {
            // Optimistically update UI by removing the attachment from state
            setTaskDetails(prevState => ({
                ...prevState,
                attachments: prevState.attachments.filter(a => a.id !== attachment.id)
            }));

            // Send request to delete the attachment
            await axios.delete(`/api/kanban/board/${taskId}/attachment/${attachment.id}`);

            // Show success message
            toast.success('Attachment deleted successfully');

            // Record activity
            await recordActivity('attachment_deleted', `Deleted attachment: ${attachment.filename}`);

            // Trigger activity refresh
            triggerActivitiesRefresh();

            // Fetch updated task details to ensure UI is in sync with server
            await fetchTaskDetails();
        } catch (error) {
            console.error('Error deleting attachment:', error);
            toast.error('Failed to delete attachment');

            // Revert UI change on error by refreshing task data
            await fetchTaskDetails();
        }
    };

    // Hàm để tìm nạp thông tin user story khi cần
    const fetchUserStoryIfNeeded = useCallback(async () => {
        if (taskDetails && taskDetails.userStoryId && !taskDetails.projectId) {
            try {
                console.log("Attempting to fetch user story data for navigation:", taskDetails.userStoryId);
                const response = await axios.get(`/api/kanban/board/userstory/${taskDetails.userStoryId}`);

                if (response.data && response.data.projectId) {
                    // Cập nhật projectId vào task details
                    setTaskDetails(prev => ({
                        ...prev,
                        projectId: response.data.projectId,
                        userStoryName: response.data.name || prev.userStoryName
                    }));
                    console.log("Updated projectId for navigation:", response.data.projectId);
                    return response.data.projectId;
                }
            } catch (error) {
                console.error("Error fetching user story data for navigation:", error);
                return null;
            }
        }
        return taskDetails.projectId;
    }, [taskDetails]);

    // Log when statusId changes
    useEffect(() => {
        if (taskDetails && taskDetails.statusId) {
            console.log(`Task status ID changed to: ${taskDetails.statusId}`);
            console.log(`Current status name: ${getStatusName(taskDetails.statusId)}`);
            console.log(`Current status color: ${getStatusColor(taskDetails.statusId)}`);
        }
    }, [taskDetails.statusId, statuses]);

    // Log when projectId is set or changes and fetch statuses
    useEffect(() => {
        if (taskDetails && taskDetails.projectId) {
            console.log(`Project ID set or changed to: ${taskDetails.projectId}`);

            // Fetch the task statuses when we have a projectId
            console.log("Fetching task statuses for project:", taskDetails.projectId);
            fetchStatuses(taskDetails.projectId);

            // Fetch available tags for the project
            fetchAvailableTags(taskDetails.projectId);
        } else if (taskDetails && taskDetails.userStoryId && !taskDetails.projectId) {
            // If we don't have projectId but we have userStoryId, try to get projectId from user story
            console.log("No projectId but userStoryId available, fetching from user story:", taskDetails.userStoryId);
            axios.get(`/api/kanban/board/userstory/${taskDetails.userStoryId}`)
                .then(response => {
                    if (response.data && response.data.projectId) {
                        console.log("Found projectId in user story:", response.data.projectId);
                        fetchStatuses(response.data.projectId);
                        fetchAvailableTags(response.data.projectId);
                        // Update task details with projectId
                        setTaskDetails(prev => ({
                            ...prev,
                            projectId: response.data.projectId
                        }));
                    }
                })
                .catch(error => {
                    console.error("Error fetching user story to get projectId for statuses:", error);
                });
        }
    }, [taskDetails.projectId, taskDetails.userStoryId]);

    // Force fetch statuses on component mount
    useEffect(() => {
        // Immediate fetch of statuses with project ID 4
        console.log("Component mounted - Initial fetch of statuses with project ID 4");
        fetchStatuses(4);

        // No dependencies means this runs once after component mount
    }, []);

    // Xử lý assignee
    const handleAssignUser = async (userId) => {
        try {
            // Ensure userId is a number
            const numericUserId = parseInt(userId);
            console.log(`Attempting to assign user ID ${numericUserId} to task ${taskId}`);

            // Call API to add user as assignee
            await axios.post(`/api/tasks/${taskId}/assignees/${numericUserId}`);

            // Refresh task data
            console.log("Assignment successful, refreshing task data");
            await fetchTaskDetails();
            toast.success('Task assigned successfully');
            setShowAssigneeDropdown(false);

            // Trigger activities refresh
            triggerActivitiesRefresh();
        } catch (error) {
            console.error('Error assigning task:', error.response?.data || error.message);
            toast.error('Unable to assign task');
        }
    };

    const handleRemoveAssignee = async (userId) => {
        try {
            // Ensure userId is a number
            const numericUserId = parseInt(userId);
            console.log(`Attempting to remove assignee ID ${numericUserId} from task ${taskId}`);

            if (isNaN(numericUserId)) {
                console.error('Invalid user ID:', userId);
                toast.error('Invalid user ID');
                return;
            }

            // Get current assignees list (excluding the one to remove)
            const updatedAssignees = assignedUsers
                .filter(user => parseInt(user.id) !== numericUserId)
                .map(user => parseInt(user.id));

            console.log('Current assignees:', assignedUsers);
            console.log('Updated assignees list:', updatedAssignees);

            // Call API to update assignees list
            const response = await axios.post(`/api/tasks/${taskId}/assignees`, {
                userIds: updatedAssignees
            });

            console.log('Update assignees API response:', response);

            // Update UI immediately
            setAssignedUsers(prevUsers => prevUsers.filter(user => parseInt(user.id) !== numericUserId));

            // Refresh task data to ensure UI is in sync with server
            console.log("Remove assignee successful, refreshing task data");
            await fetchTaskDetails();
            toast.success('Assignee removed successfully');

            // Trigger activities refresh
            triggerActivitiesRefresh();
        } catch (error) {
            console.error('Error removing assignee:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            }
            toast.error('Unable to remove assignee');

            // Refresh data to display current state from server
            await fetchTaskDetails();
        }
    };

    // Add this useEffect to automatically fetch available assignees when projectId is available
    useEffect(() => {
        if (taskDetails && taskDetails.projectId) {
            console.log("Project ID available or changed, fetching available assignees:", taskDetails.projectId);
            fetchAvailableAssignees(taskDetails.projectId);
        }
    }, [taskDetails?.projectId]); // Only trigger when projectId changes

    // Update the getUnassignedMembers helper function with more detailed logging
    const getUnassignedMembers = () => {
        console.log("Assigned users:", assignedUsers);
        console.log("Assigned IDs:", assignedUsers.map(user => parseInt(user.id)));
        console.log("Available assignees before filtering:", availableAssignees);

        // Fix: Check both ID AND username match for accurate comparison
        const unassignedMembers = availableAssignees.filter(user => {
            const userId = parseInt(user.id);
            const username = user.username;

            // Only consider assigned if BOTH the ID AND username match an assigned user
            // OR if username matches (to handle same user with different IDs)
            const isAssigned = assignedUsers.some(assigned =>
                (parseInt(assigned.id) === userId && assigned.username === username) ||
                assigned.username === username
            );

            console.log(`Checking user ${user.fullName} (ID: ${userId}, username: ${username}): isAssigned=${isAssigned}`);
            return !isAssigned;
        });

        console.log("Unassigned members after filtering:", unassignedMembers);
        return unassignedMembers;
    };

    // Update the getUnwatchedMembers helper function with similar logic
    const getUnwatchedMembers = () => {
        console.log("Watchers:", watchers);
        console.log("Watcher IDs:", watchers.map(user => parseInt(user.id)));
        console.log("Available assignees before filtering:", availableAssignees);

        // Fix: Check both ID AND username together, not separately
        const unwatchedMembers = availableAssignees.filter(user => {
            const userId = parseInt(user.id);
            const username = user.username;

            // Only consider watching if BOTH the ID AND username match a watcher
            // OR if username matches (to handle same user with different IDs)
            const isWatching = watchers.some(watcher =>
                (parseInt(watcher.id) === userId && watcher.username === username) ||
                watcher.username === username
            );

            console.log(`Checking user ${user.fullName} (ID: ${userId}, username: ${username}): isWatching=${isWatching}`);
            return !isWatching;
        });

        console.log("Unwatched members after filtering:", unwatchedMembers);
        return unwatchedMembers;
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
        <div className="flex flex-col bg-gray-50 border border-gray-200 rounded shadow-sm">
            {/* Header - Updated to match UserStoryDetail */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <div className="flex items-center">
                    <span className="text-blue-500 font-bold mr-2">#{taskId}</span>
                    {editMode ? (
                        <input
                            type="text"
                            value={editedSubject}
                            onChange={(e) => setEditedSubject(e.target.value)}
                            className="font-bold border border-gray-300 rounded px-2 py-1 mr-2"
                        />
                    ) : (
                        <span className="font-bold">{taskDetails.subject || 'Untitled Task'}</span>
                    )}
                    <span className="ml-2 text-red-500 cursor-pointer" onClick={() => setShowDueDatePicker(true)}>
                        <Clock size={16} className="inline" />
                        <span className="ml-1">
                            {taskDetails.dueDate ? dayjs(taskDetails.dueDate).format('YYYY-MM-DD') : 'Set due date'}
                        </span>
                    </span>
                    <span className="ml-4 text-gray-400 text-sm">TASK</span>
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
                            className="text-white px-3 py-1 rounded-sm ml-2 flex items-center"
                            style={{ backgroundColor: taskDetails && taskDetails.statusId ? getStatusColor(taskDetails.statusId) : '#cccccc' }}
                        >
                            {taskDetails && taskDetails.statusId ? getStatusName(taskDetails.statusId) : 'Status'} <ChevronDown size={16} />
                        </button>

                        {showStatusDropdown && (
                            <div className="dropdown-menu dropdown-arrow-down absolute z-50 right-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg">
                                {statuses.length > 0 ? (
                                    statuses.map(status => (
                                        <div
                                            key={status.id}
                                            className={`flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer ${taskDetails && taskDetails.statusId === status.id ? 'bg-gray-100' : ''}`}
                                            onClick={() => handleStatusChange(status.id)}
                                        >
                                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: status.color }}></div>
                                            <span>{status.name}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-2 text-gray-500">Loading statuses...</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex">
                {/* Left content area */}
                <div className="flex-grow p-4 border-r border-gray-200">
                    {/* User Story link if this task belongs to a User Story */}
                    {taskDetails.userStoryId && (
                        <div className="mb-6">
                            <button
                                onClick={async () => {
                                    try {
                                        // Chờ fetchUserStoryIfNeeded để đảm bảo có projectId
                                        const projectId = await fetchUserStoryIfNeeded();

                                        if (projectId) {
                                            navigate(`/projects/${projectId}/userstory/${taskDetails.userStoryId}`, { replace: true });
                                        } else {
                                            console.error('Could not determine projectId for navigation');
                                            message.error('Không thể xem User Story do thiếu thông tin dự án.');
                                        }
                                    } catch (error) {
                                        console.error('Error navigating to user story:', error);
                                        message.error('Không thể xem User Story. Vui lòng thử lại sau.');
                                    }
                                }}
                                className="text-blue-500 flex items-center hover:underline focus:outline-none bg-transparent border-0 p-0"
                            >
                                <span className="mr-2">🔗</span>
                                US #{taskDetails.userStoryId}: {taskDetails.userStoryName || 'User Story'}
                            </button>
                        </div>
                    )}

                    {/* Tags section */}
                    <div className="mb-6">
                        <div className="bg-gray-100 py-2 px-4 text-sm font-semibold">
                            TAGS
                        </div>
                        <div className="flex mt-2 space-x-2 flex-wrap">
                            {taskDetails.tags && taskDetails.tags.length > 0 ? (
                                taskDetails.tags.map(tag => (
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
                                                .filter(tag => !taskDetails.tags || !taskDetails.tags.some(t => t.id === tag.id))
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
                                placeholder="Enter a description for this task..."
                            />
                        ) : (
                            taskDetails.description || <span className="text-gray-400 italic">Empty space is so boring... go on, be descriptive...</span>
                        )}
                    </div>

                    {/* Created by info */}
                    {/* <div className="text-right text-sm text-gray-500 mb-8">
                        <span>Created by {taskDetails.createdByFullName || 'Unknown'}</span>
                        <br />
                        <span>{dayjs(taskDetails.createdAt).format('YYYY-MM-DD HH:mm')}</span>
                    </div> */}

                    {/* Attachments section */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2 py-2 bg-gray-100">
                            <div className="px-4 font-semibold">
                                {taskDetails.attachments?.length || 0} Attachments
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

                        {taskDetails.attachments && taskDetails.attachments.length > 0 ? (
                            <div className="space-y-2">
                                {taskDetails.attachments.map(attachment => (
                                    <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                        <div className="flex items-center">
                                            <FileText className="mr-2 text-blue-500" />
                                            <span className="text-gray-700">{attachment.filename}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <button
                                                className="text-blue-500 hover:text-blue-700 mr-2"
                                                onClick={() => handleDownloadAttachment(attachment)}
                                            >
                                                <Download size={16} />
                                            </button>
                                            <button
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => handleDeleteAttachment(attachment)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border border-dashed border-gray-300 py-8 text-center text-gray-400">
                                Drop attachments here!
                            </div>
                        )}
                    </div>

                    {/* Comments and Activities section */}
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
                            <div className="mt-6">
                                <div className="space-y-4" ref={commentSectionRef}>
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
                                                        <div className="flex items-center">
                                                            <span className="text-gray-500 text-sm mr-2">
                                                                {dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm')}
                                                            </span>
                                                            {/* Show delete button only for current user's comments */}
                                                            {comment.userId === getCurrentUserId() && (
                                                                <button
                                                                    onClick={() => handleDeleteComment(comment.id, comment.userId)}
                                                                    className="text-red-500 hover:text-red-700"
                                                                    title="Delete comment"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
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
                                                        <span className="text-gray-500 text-sm">{dayjs(activity.timestamp).format('YYYY-MM-DD HH:mm')}</span>
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
                                                {user.photoUrl ? (
                                                    <img
                                                        src={user.photoUrl}
                                                        alt={user.fullName || user.username}
                                                        className="w-full h-full object-cover rounded-md"
                                                    />
                                                ) : (
                                                    user.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : '?'
                                                )}
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
                                        {getUnassignedMembers().length > 0 ? (
                                            getUnassignedMembers().map(user => (
                                                <div
                                                    key={user.id}
                                                    onClick={() => handleAssignUser(user.id)}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                                >
                                                    <div className="w-6 h-6 bg-purple-300 rounded-md flex items-center justify-center text-white mr-2 text-xs">
                                                        {user.photoUrl ? (
                                                            <img
                                                                src={user.photoUrl}
                                                                alt={user.fullName || user.username}
                                                                className="w-full h-full object-cover rounded-md"
                                                            />
                                                        ) : (
                                                            user.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : '?'
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{user.fullName || user.username}</div>
                                                        <div className="text-xs text-gray-500">@{user.username}</div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-2 text-gray-500 text-center">All members are already assigned</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="text-gray-500 text-sm mb-2">WATCHERS</div>
                        <div className="space-y-2">
                            {watchers && watchers.length > 0 ? (
                                watchers.map(user => (
                                    <div key={user.id} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-purple-300 rounded-md flex items-center justify-center text-white mr-2">
                                                {user.photoUrl ? (
                                                    <img
                                                        src={user.photoUrl}
                                                        alt={user.fullName || user.username}
                                                        className="w-full h-full object-cover rounded-md"
                                                    />
                                                ) : (
                                                    user.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : '?'
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium">{user.fullName || user.username}</div>
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
                                ))
                            ) : (
                                <div className="text-sm text-gray-500">No watchers</div>
                            )}
                            <div className="relative">
                                <button
                                    onClick={() => setShowWatcherDropdown(!showWatcherDropdown)}
                                    className="text-gray-500 flex items-center text-sm"
                                >
                                    <Plus size={14} className="mr-1" /> Add watchers
                                </button>
                                {showWatcherDropdown && (
                                    <div className="dropdown-menu dropdown-arrow-down absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg">
                                        {getUnwatchedMembers().length > 0 ? (
                                            getUnwatchedMembers().map(user => (
                                                <div
                                                    key={user.id}
                                                    onClick={() => handleAddWatcher(user.id)}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                                >
                                                    <div className="w-6 h-6 bg-purple-300 rounded-md flex items-center justify-center text-white mr-2 text-xs">
                                                        {user.photoUrl ? (
                                                            <img
                                                                src={user.photoUrl}
                                                                alt={user.fullName || user.username}
                                                                className="w-full h-full object-cover rounded-md"
                                                            />
                                                        ) : (
                                                            user.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : '?'
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{user.fullName || user.username}</div>
                                                        <div className="text-xs text-gray-500">@{user.username}</div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-2 text-gray-500 text-center">All members are already watching</div>
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
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-center space-x-2 mt-8">
                        <button
                            className="bg-red-500 p-2 rounded text-white"
                            onClick={() => setShowDueDatePicker(true)}
                        >
                            <Clock size={16} />
                        </button>
                        <button
                            className={`p-2 rounded ${isBlocked ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'} hover:${isBlocked ? 'bg-red-600' : 'bg-gray-200'}`}
                            onClick={handleToggleBlocked}
                            title={isBlocked ? 'Unblock this task' : 'Block this task'}
                        >
                            <Lock size={16} />
                        </button>
                        <button
                            className="bg-red-500 p-2 rounded text-white hover:bg-red-600"
                            onClick={handleDeleteTask}
                            title="Delete this task"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Due Date Picker Modal */}
            {showDueDatePicker && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Set due date</h3>
                            <button
                                onClick={() => setShowDueDatePicker(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-4">
                            <DatePicker
                                className="w-full border border-gray-300 rounded p-2"
                                onChange={date => setEditedDueDate(date)}
                                value={editedDueDate ? dayjs(editedDueDate) : null}
                                placeholder="Select date"
                            />
                        </div>

                        <div className="flex flex-wrap space-x-2 mb-4">
                            <button
                                onClick={() => setShowQuickDateSelect(!showQuickDateSelect)}
                                className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded text-sm mb-2"
                            >
                                Quick select... <ChevronDown size={14} className="inline" />
                            </button>

                            {showQuickDateSelect && (
                                <div className="w-full bg-gray-50 p-2 rounded mt-1 space-y-1">
                                    <button onClick={() => handleQuickDateSelect(1)} className="w-full text-left px-2 py-1 hover:bg-gray-200 rounded">Tomorrow</button>
                                    <button onClick={() => handleQuickDateSelect(7)} className="w-full text-left px-2 py-1 hover:bg-gray-200 rounded">In one week</button>
                                    <button onClick={() => handleQuickDateSelect(14)} className="w-full text-left px-2 py-1 hover:bg-gray-200 rounded">In two weeks</button>
                                    <button onClick={() => handleQuickDateSelect(30)} className="w-full text-left px-2 py-1 hover:bg-gray-200 rounded">In one month</button>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => {
                                    setEditedDueDate(null);
                                    handleDueDateChange(null);
                                }}
                                className="text-gray-500"
                            >
                                <X size={16} className="inline" /> Clear
                            </button>
                            <button
                                onClick={handleSaveDueDate}
                                className="bg-teal-400 hover:bg-teal-500 text-white px-6 py-2 rounded font-medium"
                                disabled={!editedDueDate}
                            >
                                SAVE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskDetail;