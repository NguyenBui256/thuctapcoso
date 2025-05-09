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
    const commentSectionRef = useRef(null);

    // Attachments handling
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const statuses = [
        { id: 1, name: 'NEW', color: 'bg-blue-400' },
        { id: 2, name: 'READY', color: 'bg-red-500' },
        { id: 3, name: 'IN PROGRESS', color: 'bg-orange-400' },
        { id: 4, name: 'READY FOR TEST', color: 'bg-yellow-400' },
        { id: 5, name: 'DONE', color: 'bg-green-500' },
        { id: 6, name: 'ARCHIVED', color: 'bg-gray-400' }
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

        try {
            setIsLoading(true);
            const response = await axios.get(`/api/tasks/${taskId}`, {
                signal: controller.signal
            });

            if (!isMounted) return;

            const taskData = response.data;

            // Preserve existing comments when updating task details
            setTaskDetails(prev => ({
                ...taskData,
                comments: prev?.comments || taskData.comments || []
            }));

            // Initialize editable fields
            setEditedSubject(taskData.subject || '');
            setEditedDescription(taskData.description || '');
            setEditedDueDate(taskData.dueDate ? new Date(taskData.dueDate) : null);
            setIsBlocked(taskData.isBlocked || false);
            setEditedPoints(taskData.points || 0);

            // Fetch available assignees if project ID is available
            if (taskData.userStoryId && isMounted) {
                try {
                    const userStoryResponse = await axios.get(`/api/userstories/${taskData.userStoryId}`, {
                        signal: controller.signal
                    });

                    if (!isMounted) return;

                    if (userStoryResponse.data && userStoryResponse.data.projectId) {
                        // Lưu lại projectId từ user story nếu task không có
                        if (!taskData.projectId) {
                            setTaskDetails(prev => ({
                                ...prev,
                                projectId: userStoryResponse.data.projectId
                            }));
                            console.log('Updated projectId from userStory:', userStoryResponse.data.projectId);
                        }

                        fetchAvailableAssignees(userStoryResponse.data.projectId);
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
    }, [taskId, fetchTaskDetails, fetchComments, fetchActivities]);

    useEffect(() => {
        if (taskDetails.watchers && taskDetails.watchers.length > 0) {
            setWatchers(taskDetails.watchers);
        }
    }, [taskDetails.watchers]);

    useEffect(() => {
        if (taskDetails.assignees && taskDetails.assignees.length > 0) {
            console.log('Assigned users from API:', taskDetails.assignees);
            // Kiểm tra cấu trúc của dữ liệu
            console.log('Sample assignee object structure:', taskDetails.assignees[0]);
            setAssignedUsers(taskDetails.assignees);
        } else if (taskDetails.assignedTo && taskDetails.assignedToName) {
            // Handle legacy single assignee
            console.log('Legacy single assignee:', taskDetails.assignedTo, taskDetails.assignedToName);
            setAssignedUsers([{
                id: taskDetails.assignedTo,
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
        if (taskDetails) {
            setEditedSubject(taskDetails.subject || '');
            setEditedDescription(taskDetails.description || '');
            setEditedDueDate(taskDetails.dueDate ? new Date(taskDetails.dueDate) : null);
            setIsBlocked(taskDetails.isBlocked || false);
            setEditedPoints(taskDetails.points || 0);
        }
    }, [taskDetails]);

    // Sửa useEffect để có cleanup và tránh vòng lặp vô hạn
    useEffect(() => {
        if (taskDetails.comments) {
            // Chỉ cập nhật khi comments thực sự thay đổi để tránh vòng lặp
            const currentCommentsCount = taskDetails.comments.length;
            const prevCommentsCount = taskDetails.comments ? taskDetails.comments.length : 0;

            if (currentCommentsCount !== prevCommentsCount) {
                setTaskDetails(prev => ({
                    ...prev,
                    comments: taskDetails.comments
                }));
            }
        }
    }, [taskDetails.comments]);

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
        // Sử dụng state để đánh dấu đã navigate để tránh navigate nhiều lần
        // Quay lại kanban board của project hoặc trang trước đó
        if (projectId) {
            navigate(`/projects/${projectId}/kanban`, { replace: true });
        } else {
            navigate(-1);
        }
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
            toast.success('Gán nhiệm vụ thành công');
            setShowAssigneeDropdown(false);

            // Tự động làm mới activities
            triggerActivitiesRefresh();
        } catch (error) {
            console.error('Error assigning task:', error.response?.data || error.message);
            toast.error('Không thể gán nhiệm vụ');
        }
    };

    const handleRemoveAssignee = async (userId) => {
        try {
            console.log(`Attempting to remove assignee ${userId} from task ${taskId}`);

            // Đảm bảo userId là số nguyên
            const numericUserId = parseInt(userId);
            if (isNaN(numericUserId)) {
                console.error('Invalid user ID:', userId);
                message.error('User ID không hợp lệ');
                return;
            }

            // Lấy danh sách assignees hiện tại (loại bỏ người cần xóa)
            const updatedAssignees = assignedUsers
                .filter(user => user.id !== numericUserId)
                .map(user => user.id);

            console.log('Current assignees:', assignedUsers);
            console.log('Updated assignees list:', updatedAssignees);

            // Gọi API để cập nhật toàn bộ danh sách assignees thay vì xóa một người
            const response = await axios.post(`/api/tasks/${taskId}/assignees`, {
                userIds: updatedAssignees
            });

            console.log('Update assignees API response:', response);

            // Cập nhật UI ngay lập tức
            setAssignedUsers(prevUsers => prevUsers.filter(user => user.id !== numericUserId));

            // Refresh task data từ server để đảm bảo đồng bộ
            console.log("Remove assignee successful, refreshing task data");
            await fetchTaskDetails();
            toast.success('Đã xóa người được gán');

            // Tự động làm mới activities
            triggerActivitiesRefresh();
        } catch (error) {
            console.error('Error removing assignee:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            }
            toast.error('Không thể xóa người được gán');

            // Refresh data để hiển thị trạng thái hiện tại từ server
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
            // Gọi API để thêm người dùng vào watchers
            await axios.post(`/api/tasks/${taskId}/watchers/${userId}`);

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
            // Gọi API để xóa người dùng khỏi watchers
            await axios.delete(`/api/tasks/${taskId}/watchers/${userId}`);

            // Refresh task data
            console.log("Remove watcher successful, refreshing task data");
            await fetchTaskDetails();
            toast.success('Đã xóa người theo dõi');

            // Tự động làm mới activities
            triggerActivitiesRefresh();
        } catch (error) {
            console.error('Error removing watcher:', error.response?.data || error.message);
            toast.error('Không thể xóa người theo dõi');
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
            await axios.delete(`/api/tasks/${taskId}`);
            toast.success('Task deleted successfully');
            navigate(-1);
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Failed to delete task');
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

    const handleSaveChanges = async () => {
        setIsSaving(true);
        setError(null);

        try {
            const updateData = {
                id: taskDetails.id,
                name: editedSubject,
                description: editedDescription || '',
                statusId: parseInt(editedStatusId),
                assigneeIds: editedAssignees.map(a => parseInt(a.id)),
                // Include any other fields that need to be updated
            };

            const response = await axios.put(`/api/tasks/${taskDetails.id}`, updateData);
            setTaskDetails(response.data);
            setEditMode(false);
            toast.success('Task updated successfully');
        } catch (err) {
            console.error('Error saving changes:', err);
            setError('Failed to save changes. Please try again.');
            toast.error('Failed to save task changes');
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatusChange = async (newStatusId) => {
        try {
            // Get previous status ID before updating
            const previousStatusId = taskDetails.statusId;

            // Update UI optimistically
            setTaskDetails(prev => ({
                ...prev,
                statusId: newStatusId
            }));

            // Send API request
            await axios.put(`/api/tasks/${taskDetails.id}/status/${newStatusId}`);

            // Show success message
            const statusName = statuses.find(s => s.id === newStatusId)?.name || 'new status';
            toast.success(`Task status updated to ${statusName}`);

            // Emit event to notify other components (like SprintProgressBar) about the status change
            // Check if task moved to/from Done status (status 5)
            if (previousStatusId === 5 || newStatusId === 5) {
                const sprintId = taskDetails.sprintId;
                console.log('Emitting task-status-changed event with sprintId:', sprintId);
                eventBus.emit('task-status-changed', {
                    taskId: taskDetails.id,
                    previousStatusId,
                    newStatusId,
                    sprintId
                });
            }
        } catch (error) {
            console.error('Error updating task status:', error);
            toast.error('Failed to update task status');
            // Revert on error
            setTaskDetails(prev => ({ ...prev }));
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
                { headers: { 'User-Id': userId } }
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
                    // Refresh the task to show the new attachment
                    fetchTaskDetails();
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
                            className={`${getStatusColor(taskDetails.statusId)} text-white px-3 py-1 rounded-sm ml-2 flex items-center`}
                        >
                            {getStatusName(taskDetails.statusId)} <ChevronDown size={16} />
                        </button>

                        {showStatusDropdown && (
                            <div className="dropdown-menu dropdown-arrow-down absolute z-50 right-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg">
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
                        <div className="flex mt-2 space-x-2">
                            {taskDetails.tags && taskDetails.tags.length > 0 ? (
                                taskDetails.tags.map(tag => (
                                    <button key={tag.id} className="bg-green-500 text-white px-3 py-1 rounded-sm flex items-center text-sm">
                                        {tag.name} <X size={14} className="ml-1" />
                                    </button>
                                ))
                            ) : (
                                <button className="bg-white border border-gray-300 px-3 py-1 rounded-sm flex items-center text-sm">
                                    Add tag <Plus size={14} className="ml-1" />
                                </button>
                            )}
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
                    <div className="text-right text-sm text-gray-500 mb-8">
                        <span>Created by {taskDetails.createdByFullName || 'Unknown'}</span>
                        <br />
                        <span>{dayjs(taskDetails.createdAt).format('YYYY-MM-DD HH:mm')}</span>
                    </div>

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
                                                        <span className="text-gray-500 text-sm">
                                                            {dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm')}
                                                        </span>
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
                                assignedUsers.map(user => {
                                    console.log('Rendering assignee:', user);
                                    // Đảm bảo truyền đúng ID cho việc xóa
                                    const userId = user.id;
                                    return (
                                        <div key={userId} className="flex items-center justify-between">
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
                                                onClick={() => {
                                                    console.log('Removing assignee with ID:', userId);
                                                    handleRemoveAssignee(userId);
                                                }}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-sm text-gray-500">No users assigned</div>
                            )}

                            <div className="relative">
                                <button
                                    onClick={() => {
                                        console.log("Current availableAssignees:", availableAssignees);
                                        setShowAssigneeDropdown(!showAssigneeDropdown);
                                    }}
                                    className="text-gray-500 flex items-center text-sm"
                                >
                                    <Plus size={14} className="mr-1" /> Add assigned
                                </button>
                                {showAssigneeDropdown && (
                                    <div className="dropdown-menu dropdown-arrow-down absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg">
                                        <div className="px-4 py-2 text-right">
                                            <button
                                                onClick={() => {
                                                    console.log("Reloading available assignees...");
                                                    if (taskDetails.projectId) {
                                                        fetchAvailableAssignees(taskDetails.projectId);
                                                    } else if (taskDetails.userStoryId) {
                                                        console.log("No projectId, trying to get from userStory");
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
                                                    }
                                                }}
                                                className="text-sm text-blue-500 hover:text-blue-700"
                                            >
                                                Refresh list
                                            </button>
                                        </div>

                                        {availableAssignees
                                            .filter(user => !assignedUsers.some(assigned => assigned.id === user.id))
                                            .map(user => (
                                                <div
                                                    key={user.id}
                                                    onClick={() => handleAssignUser(user.id)}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                                >
                                                    <div className="w-6 h-6 bg-purple-300 rounded-md flex items-center justify-center text-white mr-2 text-xs">
                                                        {user.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : '?'}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{user.fullName || user.username}</div>
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
                            {watchers && watchers.map(user => (
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
                                                        {user.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : '?'}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{user.fullName || user.username}</div>
                                                        <div className="text-xs text-gray-500">@{user.username}</div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end space-x-2 mt-8">
                        <button
                            className="bg-red-500 p-2 rounded text-white"
                            onClick={() => setShowDueDatePicker(true)}
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
                            className={`p-2 rounded ${isBlocked ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'} hover:${isBlocked ? 'bg-red-600' : 'bg-gray-200'}`}
                            onClick={handleToggleBlocked}
                            title={isBlocked ? 'Unblock this task' : 'Block this task'}
                        >
                            <Lock size={16} />
                        </button>
                        <button className="bg-gray-100 p-2 rounded text-gray-500 hover:bg-gray-200">
                            <List size={16} />
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