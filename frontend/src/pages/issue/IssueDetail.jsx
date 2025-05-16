import { useNavigate, useParams } from "react-router-dom"
import { fetchWithAuth } from "../../utils/AuthUtils"
import { BASE_API_URL } from "../../common/constants"
import { useEffect, useState, useRef } from "react"
import { Avatar, Tag, Tooltip, Button, Divider, List, Input, Tabs } from "antd"
import { UserOutlined, EyeOutlined, PlusOutlined, LockOutlined, LinkOutlined, DeleteOutlined, FileTextOutlined, ClockCircleOutlined, EditOutlined, SendOutlined, UploadOutlined, DownloadOutlined, FileOutlined, LoadingOutlined } from '@ant-design/icons'
import { EyeOff } from 'lucide-react'
import { updateIssue } from '../../api/issue'
import DropdownPortal from './DropdownPortal'
import { toast } from "react-toastify"
import axios from '../../common/axios-customize';
import { message } from "antd"
// Thêm comment component từ nguồn khác nếu cần

const { TextArea } = Input;
const { TabPane } = Tabs;

// Tạo một custom comment component
const CommentItem = ({ author, avatar, content, datetime, actions }) => {
    return (
        <div className="flex items-start">
            <div className="mr-3">{avatar}</div>
            <div className="flex-1">
                <div className="flex justify-between mb-1">
                    <span className="font-medium">{author}</span>
                    <span className="text-gray-500 text-sm">{datetime}</span>
                </div>
                <div className="mb-2">{content}</div>
                {actions && <div className="mt-1">{actions}</div>}
            </div>
        </div>
    );
};

export default function IssueDetail() {

    const userId = localStorage.getItem('userId')
    const { projectId, issueId } = useParams()
    const navigate = useNavigate()
    const [issue, setIssue] = useState({})
    const [filters, setFilters] = useState({})
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [editTitle, setEditTitle] = useState("")
    const [isEditingDes, setIsEditingDes] = useState(false)
    const [editDes, setEditDes] = useState('')

    const [isAddingTag, setIsAddingTag] = useState(false)
    const [tagInput, setTagInput] = useState('')

    // New states for comments and activities
    const [comments, setComments] = useState([])
    const [activities, setActivities] = useState([])
    const [commentContent, setCommentContent] = useState('')
    const [activeTab, setActiveTab] = useState('comments')
    const [isLoadingComment, setIsLoadingComment] = useState(false)

    // Add states for watchers and available users
    const [watchers, setWatchers] = useState([])
    const [showWatcherDropdown, setShowWatcherDropdown] = useState(false)
    const watcherRef = useRef(null)
    const [availableUsers, setAvailableUsers] = useState([])

    const filteredTags = filters.tags?.filter(t => t.name.toLowerCase().includes(tagInput.toLowerCase()) && !issue.tags?.some(st => st.id === t.id));

    const [showDueDatePicker, setShowDueDatePicker] = useState(false);
    const dueDateRef = useRef()

    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const statusRef = useRef();
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const typeRef = useRef();
    const [showSeverityDropdown, setShowSeverityDropdown] = useState(false);
    const severityRef = useRef();
    const [showPrioDropdown, setShowPrioDropdown] = useState(false);
    const prioRef = useRef();
    const [showAssignDropdown, setShowAssignDropdown] = useState(false)
    const assignRef = useRef()

    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)

    // Attachments handling
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

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
            formData.append('folder', `issue/${issueId}`);

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
                // Now save the attachment to the issue
                const attachmentData = {
                    filename: file.name,
                    contentType: file.type,
                    fileSize: file.size,
                    url: uploadResponse.data.secure_url || uploadResponse.data.url
                };

                const attachResponse = await axios.post(`/api/v1/issue/${issueId}/attachment`, attachmentData);

                if (attachResponse.data) {
                    message.success('File attached successfully!');
                    // Refresh the issue to show the new attachment
                    await fetchIssue();
                } else {
                    message.error('Failed to attach file to issue');
                }
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

    useEffect(() => {
        function handleClickOutside(event) {
            if (showStatusDropdown && statusRef.current && !statusRef.current.contains(event.target)) {
                setShowStatusDropdown(false);
            }
            if (showTypeDropdown && typeRef.current && !typeRef.current.contains(event.target)) {
                setShowTypeDropdown(false);
            }
            if (showSeverityDropdown && severityRef.current && !severityRef.current.contains(event.target)) {
                setShowSeverityDropdown(false);
            }
            if (showPrioDropdown && prioRef.current && !prioRef.current.contains(event.target)) {
                setShowPrioDropdown(false);
            }
            if (showAssignDropdown && assignRef.current && !assignRef.current.contains(event.target)) {
                setShowAssignDropdown(false);
            }
            if (showWatcherDropdown && watcherRef.current && !watcherRef.current.contains(event.target)) {
                setShowWatcherDropdown(false);
            }
        }
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showStatusDropdown, showTypeDropdown, showSeverityDropdown, showPrioDropdown, showAssignDropdown, showWatcherDropdown]);

    const fetchIssue = () => {
        fetchWithAuth(`${BASE_API_URL}/v1/issue/get?projectId=${projectId}&issueId=${issueId}`)
            .then(res => res.json())
            .then(res => {
                if (res.error)
                    navigate('/error?errorType=NOT_FOUND')
                else
                    setIssue(res.data)
            })
    }

    const fetchFilters = () => {
        fetchWithAuth(`${BASE_API_URL}/v1/issue/get-filters?projectId=${projectId}`)
            .then(res => res.json())
            .then(res => setFilters(res.data))
    }

    const fetchComments = () => {
        fetchWithAuth(`${BASE_API_URL}/v1/issue/${issueId}/comments`)
            .then(res => res.json())
            .then(res => {
                if (!res.error) {
                    setComments(res.data)
                }
            })
    }

    const fetchActivities = () => {
        fetchWithAuth(`${BASE_API_URL}/v1/issue/${issueId}/activities`)
            .then(res => res.json())
            .then(res => {
                if (!res.error) {
                    setActivities(res.data)
                }
            })
    }

    const handleSubmitComment = () => {
        if (!commentContent.trim()) {
            return;
        }

        setIsLoadingComment(true);
        fetchWithAuth(`${BASE_API_URL}/v1/issue/${issueId}/comments`, window.location, true, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: commentContent })
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) {
                    toast.error('Failed to submit comment');
                } else {
                    setCommentContent('');
                    fetchComments();  // Refresh comments
                    fetchActivities(); // Cập nhật activities
                    toast.success('Comment added successfully');
                }
                setIsLoadingComment(false);
            })
            .catch(err => {
                console.error('Error submitting comment:', err);
                toast.error('Failed to submit comment');
                setIsLoadingComment(false);
            });
    }

    const handleDeleteComment = (commentId) => {
        fetchWithAuth(`${BASE_API_URL}/v1/issue/comments/${commentId}`, window.location, true, {
            method: 'DELETE'
        })
            .then(res => res.json())
            .then(res => {
                if (!res.error) {
                    fetchComments();  // Refresh comments
                    fetchActivities(); // Cập nhật activities
                    toast.success('Comment deleted successfully');
                } else {
                    toast.error('Failed to delete comment');
                }
            })
            .catch(err => {
                console.error('Error deleting comment:', err);
                toast.error('Failed to delete comment');
            });
    }

    const handleTitleClick = () => {
        setEditTitle(issue.subject)
        setIsEditingTitle(true)
    }

    const handleTitleSave = async () => {
        if (!editTitle) {
            toast.warn("Tiêu đề không được trống")
            return
        }
        try {
            const res = await updateIssue(issue.id, { subject: editTitle });
            if (res && !res.error) {
                setIssue(res.data)
                setIsEditingTitle(false)
                fetchActivities(); // Cập nhật activities
            }
        } catch (e) { }
    }

    const handleDesUpdate = async () => {
        try {
            const res = await updateIssue(issue.id, { description: editDes });
            if (res && !res.error) {
                setIssue(res.data)
                setIsEditingDes(false)
                fetchActivities(); // Cập nhật activities
            }
        } catch (e) { }
    }

    const handleUpdate = async (propName, value) => {
        const body = {
            [propName]: value
        }
        const res = await updateIssue(issue.id, body)
        if (res.error) {
            toast.error("Error while updating")
        }
        else {
            setIssue(res.data)
            toast.success("Updated successfully")
            fetchActivities(); // Cập nhật activities
        }
    }

    const handleDeleteIssue = () => {
        fetchWithAuth(`${BASE_API_URL}/v1/issue/${issueId}`, window.location, true, {
            method: "DELETE"
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) {
                    toast.error("Error while deleting, try again later")
                }
                else {
                    window.location.assign("../issues")
                }
            })
    }

    // Function to fetch available users for watchers
    const fetchAvailableUsers = async () => {
        try {
            const res = await fetchWithAuth(`${BASE_API_URL}/v1/project/${projectId}/users`);
            const data = await res.json();
            if (!data.error && data.data) {
                setAvailableUsers(data.data);
            }
        } catch (error) {
            console.error('Error fetching available users:', error);
            toast.error('Failed to load available users');
        }
    }

    // Function to fetch watchers
    const fetchWatchers = async () => {
        try {
            const res = await fetchWithAuth(`${BASE_API_URL}/v1/issue/${issueId}/watchers`);
            const data = await res.json();
            if (!data.error && data.data) {
                setWatchers(data.data);
            }
        } catch (error) {
            console.error('Error fetching watchers:', error);
            toast.error('Failed to load watchers');
        }
    }

    // Function to add a watcher
    const handleAddWatcher = async (userId) => {
        try {
            const res = await fetchWithAuth(`${BASE_API_URL}/v1/issue/${issueId}/watchers`, window.location, true, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId })
            });
            const data = await res.json();
            if (data.error) {
                toast.error('Failed to add watcher');
            } else {
                fetchWatchers(); // Refresh watchers
                fetchActivities(); // Refresh activities
                toast.success('Watcher added successfully');
                setShowWatcherDropdown(false);
            }
        } catch (error) {
            console.error('Error adding watcher:', error);
            toast.error('Failed to add watcher');
        }
    }

    // Function to remove a watcher
    const handleRemoveWatcher = async (watcherId) => {
        try {
            const res = await fetchWithAuth(`${BASE_API_URL}/v1/issue/${issueId}/watchers/${watcherId}`, window.location, true, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.error) {
                toast.error('Failed to remove watcher');
            } else {
                fetchWatchers(); // Refresh watchers
                fetchActivities(); // Refresh activities
                toast.success('Watcher removed successfully');
            }
        } catch (error) {
            console.error('Error removing watcher:', error);
            toast.error('Failed to remove watcher');
        }
    }

    // Check if current user is watching
    const isCurrentUserWatching = () => {
        // Make sure watchers is an array before using some()
        return Array.isArray(watchers) && watchers.some(watcher => watcher.id === parseInt(userId));
    }

    // Toggle watch function
    const handleToggleWatch = async () => {
        if (isCurrentUserWatching()) {
            await handleRemoveWatcher(userId);
        } else {
            await handleAddWatcher(userId);
        }
    }

    // Format date for better display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN');
    }

    useEffect(() => {
        fetchIssue();
        fetchFilters();
        fetchComments();
        fetchActivities();
        fetchWatchers();
        fetchAvailableUsers();
    }, [issueId]);

    if (!issue) return (
        <></>
    )

    return (
        <div style={{ background: '#f7f7fa', minHeight: '100vh', width: '100%', padding: '10px 10px' }}>
            <div style={{ display: 'flex', width: '100%', gap: 24, alignItems: 'flex-start' }}>
                {/* Cột trái */}
                <div style={{ flex: 3, background: '#fff', borderRadius: 8, padding: 32 }}>
                    {/* Tiêu đề và tag */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ color: '#2b8be6', fontWeight: 700, fontSize: 32 }}>#{issue.position}</span>
                        {isEditingTitle ? (
                            <>
                                <textarea
                                    value={editTitle}
                                    onChange={e => setEditTitle(e.target.value)}
                                    style={{
                                        fontSize: 28,
                                        fontWeight: 500,
                                        height: 36,
                                        lineHeight: '36px',
                                        resize: 'none',
                                        width: 350,
                                        padding: '2px 8px',
                                        borderRadius: 4,
                                        border: '1px solid #bfc6d1',
                                        fontFamily: 'inherit',
                                        verticalAlign: 'middle',
                                        boxSizing: 'border-box',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                    autoFocus
                                />
                                <button
                                    style={{ marginLeft: 8, padding: '4px 12px', fontSize: 16, borderRadius: 4, border: '1px solid #5178d3', background: '#5178d3', color: '#fff', cursor: 'pointer' }}
                                    onClick={handleTitleSave}
                                >Lưu</button>
                                <button
                                    style={{ marginLeft: 8, padding: '4px 12px', fontSize: 16, borderRadius: 4, border: '1px solid #bfc6d1', background: '#fff', color: '#5178d3', cursor: 'pointer' }}
                                    onClick={() => setIsEditingTitle(false)}
                                >Hủy</button>
                            </>
                        ) : (
                            <span
                                style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
                                onClick={handleTitleClick}
                                title="Nhấn để chỉnh sửa tên issue"
                                className="editable-issue-title"
                            >
                                <span style={{ fontSize: 28, fontWeight: 500, cursor: 'pointer' }}>{issue.subject}</span>
                                {issue.dueDate && (
                                    <span
                                        className="ml-2 align-middle inline-block"
                                        title={new Date(issue.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    >
                                        <span className="text-yellow-500 text-base cursor-pointer">⏰</span>
                                    </span>
                                )}
                            </span>
                        )}
                    </div>
                    {/* Tag */}
                    <div style={{ margin: '12px 0' }}>
                        {issue.tags?.map((tag, idx) => (
                            <Tag key={idx} style={{ background: tag.color }}>
                                {tag.name}
                                <span
                                    className="ml-2 font-bold text-[20px] rounded-full cursor-pointer"
                                    onClick={() => handleUpdate('tags', issue.tags.filter(t => t.id !== tag.id))}
                                >
                                    x
                                </span>
                            </Tag>
                        ))}
                        {isAddingTag ? (
                            <div
                                className="relative mb-2"
                            >
                                <input
                                    autoFocus
                                    type="text"
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    className="border border-gray-300 rounded px-2 py-1 mr-2"
                                    placeholder="Nhập tên tag hoặc chọn..."
                                />
                                {tagInput && filteredTags.length > 0 && (
                                    <div className="absolute w-fit left-0 right-0 bg-white border border-gray-200 rounded shadow z-10 mt-1 max-h-40 overflow-y-auto">
                                        {filteredTags.map(tag => (
                                            <div
                                                key={tag.id}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                                onClick={() => {
                                                    handleUpdate('tags', [...issue.tags, tag])
                                                    setIsAddingTag(false)
                                                }}
                                            >
                                                {tag.color && <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: tag.color }}></span>}
                                                {tag.name}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <Button
                                    className="bg-blue-300 mr-2"
                                >
                                    Thêm mới
                                </Button>
                                <Button
                                    className="bg-red-100"
                                    onClick={() => setIsAddingTag(false)}
                                >
                                    Hủy
                                </Button>

                            </div>
                        ) : (
                            <Button
                                color="#bfbfbf"
                                onClick={() => {
                                    setTagInput('')
                                    setIsAddingTag(true)
                                }}
                            >
                                + Thêm thẻ
                            </Button>
                        )}

                    </div>
                    {/* Description */}
                    <div
                        style={{ fontStyle: 'italic', marginBottom: 16 }}

                    >
                        {isEditingDes ? (
                            <>
                                <textarea
                                    value={editDes}
                                    onChange={e => setEditDes(e.target.value)}
                                    style={{
                                        fontSize: 20,
                                        height: 100,
                                        lineHeight: '36px',
                                        resize: 'none',
                                        width: 350,
                                        padding: '2px 8px',
                                        borderRadius: 4,
                                        border: '1px solid #bfc6d1',
                                        fontFamily: 'inherit',
                                        verticalAlign: 'middle',
                                        boxSizing: 'border-box',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                    autoFocus
                                />
                                <button
                                    style={{ marginLeft: 8, padding: '4px 12px', fontSize: 16, borderRadius: 4, border: '1px solid #5178d3', background: '#5178d3', color: '#fff', cursor: 'pointer' }}
                                    onClick={handleDesUpdate}
                                >Lưu</button>
                                <button
                                    style={{ marginLeft: 8, padding: '4px 12px', fontSize: 16, borderRadius: 4, border: '1px solid #bfc6d1', background: '#fff', color: '#5178d3', cursor: 'pointer' }}
                                    onClick={() => setIsEditingDes(false)}
                                >Hủy</button>
                            </>
                        ) : (
                            <>
                                {issue.description ? (
                                    <span
                                        style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
                                        onClick={() => {
                                            setEditDes(issue.description)
                                            setIsEditingDes(true)
                                        }}
                                        title="Nhấn để chỉnh sửa mô tả"
                                    >
                                        <span style={{ fontSize: 20, cursor: 'pointer' }}>{issue.description}</span>
                                    </span>
                                ) : 'Empty space is so boring... go on, be descriptive...'}
                            </>
                        )}

                    </div>
                    {/* Attachments */}
                    <div style={{ background: '#f3f5fa', border: '1px solid #e5e7ef', borderRadius: 6, padding: 16, marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <b>{issue.attachments?.length || 0} Attachments</b>
                            <Button
                                type="link"
                                icon={isUploading ? <LoadingOutlined /> : <UploadOutlined />}
                                onClick={handleUploadClick}
                                disabled={isUploading}
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                style={{ display: 'none' }}
                            />
                        </div>

                        {issue.attachments && issue.attachments.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {issue.attachments.map(attachment => (
                                    <div key={attachment.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: 8,
                                        backgroundColor: '#fff',
                                        borderRadius: 4,
                                        border: '1px solid #e5e7ef'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <FileOutlined style={{ color: '#5178d3' }} />
                                            <span>{attachment.filename}</span>
                                        </div>
                                        <Button
                                            type="link"
                                            icon={<DownloadOutlined />}
                                            onClick={() => handleDownloadAttachment(attachment)}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ border: '1px dashed #bfc6d1', borderRadius: 6, padding: 24, textAlign: 'center', marginTop: 8, color: '#5178d3', cursor: 'pointer' }}
                                onClick={handleUploadClick}>
                                Drop attachments here!
                            </div>
                        )}
                    </div>
                    {/* Tabs: Comments & Activities */}
                    <div style={{ background: '#f3f5fa', borderRadius: 6, padding: 16 }}>
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            style={{ marginBottom: 16 }}
                        >
                            <TabPane tab={`${comments.length} Comments`} key="comments">
                                <div className="comments-container">
                                    {comments.length === 0 ? (
                                        <div className="py-4 text-center text-gray-500">No comments yet</div>
                                    ) : (
                                        <List
                                            className="comment-list"
                                            itemLayout="horizontal"
                                            dataSource={comments}
                                            renderItem={item => (
                                                <li className="mb-3 pb-3 border-b border-gray-200">
                                                    <CommentItem
                                                        author={<span>{item.userFullName}</span>}
                                                        avatar={<Avatar icon={<UserOutlined />} />}
                                                        content={<p>{item.content}</p>}
                                                        datetime={<span>{formatDate(item.createdAt)}</span>}
                                                        actions={[
                                                            <span
                                                                key="delete"
                                                                onClick={() => handleDeleteComment(item.id)}
                                                                className="text-red-500 cursor-pointer hover:underline"
                                                            >
                                                                <DeleteOutlined /> Delete
                                                            </span>
                                                        ]}
                                                    />
                                                </li>
                                            )}
                                        />
                                    )}
                                    <div className="mt-4">
                                        <TextArea
                                            rows={3}
                                            value={commentContent}
                                            onChange={e => setCommentContent(e.target.value)}
                                            placeholder="Add a comment..."
                                            className="mb-2"
                                        />
                                        <Button
                                            type="primary"
                                            icon={<SendOutlined />}
                                            onClick={handleSubmitComment}
                                            loading={isLoadingComment}
                                            disabled={!commentContent.trim()}
                                        >
                                            Comment
                                        </Button>
                                    </div>
                                </div>
                            </TabPane>
                            <TabPane tab={`${activities.length} Activities`} key="activities">
                                <div className="activities-container">
                                    {activities.length === 0 ? (
                                        <div className="py-4 text-center text-gray-500">No activities recorded yet</div>
                                    ) : (
                                        <List
                                            className="activity-list"
                                            itemLayout="horizontal"
                                            dataSource={activities}
                                            renderItem={item => (
                                                <li className="mb-2 pb-2 border-b border-gray-200">
                                                    <div className="flex items-start">
                                                        <Avatar icon={<UserOutlined />} className="mr-3" />
                                                        <div>
                                                            <div className="font-medium">{item.userFullName || item.username}</div>
                                                            <div>{item.details}</div>
                                                            <div className="text-gray-500 text-sm">{formatDate(item.timestamp)}</div>
                                                        </div>
                                                    </div>
                                                </li>
                                            )}
                                        />
                                    )}
                                </div>
                            </TabPane>
                        </Tabs>
                    </div>
                </div>
                {/* Cột phải */}
                <div style={{ flex: 1, minWidth: 280 }}>
                    <div style={{ background: '#fff', borderRadius: 8, padding: 24, marginBottom: 24 }}>
                        <div ref={statusRef} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                            <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: 1 }}>{issue.status?.closed ? 'CLOSED' : 'OPEN'}</span>
                            <Tag
                                color="#59597c" style={{ fontWeight: 500, marginLeft: 8 }}
                                onClick={() => { setShowStatusDropdown(v => !v) }}
                            >
                                {issue.status?.name}
                            </Tag>
                            <DropdownPortal anchorRef={statusRef} show={showStatusDropdown}>
                                <div className="bg-white border border-gray-200 rounded shadow z-30 w-40 max-h-60 overflow-y-auto min-w-[120px]">
                                    {filters?.statuses?.map(st => (
                                        <div
                                            key={st.id}
                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sky-500"
                                            onClick={() => {
                                                setShowStatusDropdown(false);
                                                handleUpdate('status', st);
                                            }}
                                        >
                                            {st.name}
                                        </div>
                                    ))}
                                </div>
                            </DropdownPortal>
                        </div>
                        <Divider style={{ margin: '16px 0' }} />
                        <div style={{ marginBottom: 12 }}>
                            <span style={{ color: '#888' }}>type</span>
                            <div
                                ref={typeRef}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                                onClick={() => setShowTypeDropdown(v => !v)}
                            >
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: issue.type?.color, display: 'inline-block' }}></span>
                                <span style={{ fontWeight: 500 }}>{issue.type?.name}</span>
                            </div>
                            <DropdownPortal anchorRef={typeRef} show={showTypeDropdown}>
                                <div className="bg-white border border-gray-200 rounded shadow z-30 w-40 max-h-60 overflow-y-auto min-w-[120px]">
                                    {filters?.types?.map(st => (
                                        <div
                                            key={st.id}
                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sky-500"
                                            onClick={() => {
                                                setShowTypeDropdown(false);
                                                handleUpdate('type', st);
                                            }}
                                        >
                                            {st.name}
                                        </div>
                                    ))}
                                </div>
                            </DropdownPortal>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <span style={{ color: '#888' }}>severity</span>
                            <div
                                ref={severityRef}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                                onClick={() => setShowSeverityDropdown(v => !v)}
                            >
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: issue.severity?.color, display: 'inline-block' }}></span>
                                <span style={{ fontWeight: 500 }}>{issue.severity?.name}</span>
                                <DropdownPortal anchorRef={severityRef} show={showSeverityDropdown}>
                                    <div className="bg-white border border-gray-200 rounded shadow z-30 w-40 max-h-60 overflow-y-auto min-w-[120px]">
                                        {filters?.severities?.map(st => (
                                            <div
                                                key={st.id}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sky-500"
                                                onClick={() => {
                                                    setShowSeverityDropdown(false);
                                                    handleUpdate('severity', st);
                                                }}
                                            >
                                                {st.name}
                                            </div>
                                        ))}
                                    </div>
                                </DropdownPortal>
                            </div>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <span style={{ color: '#888' }}>priority</span>
                            <div
                                ref={prioRef}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                                onClick={() => setShowPrioDropdown(v => !v)}
                            >
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: issue.priority?.color, display: 'inline-block' }}></span>
                                <span style={{ fontWeight: 500 }}>{issue.priority?.name}</span>
                                <DropdownPortal anchorRef={prioRef} show={showPrioDropdown}>
                                    <div className="bg-white border border-gray-200 rounded shadow z-30 w-40 max-h-60 overflow-y-auto min-w-[120px]">
                                        {filters?.priorities?.map(st => (
                                            <div
                                                key={st.id}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sky-500"
                                                onClick={() => {
                                                    setShowPrioDropdown(false);
                                                    handleUpdate('priority', st);
                                                }}
                                            >
                                                {st.name}
                                            </div>
                                        ))}
                                    </div>
                                </DropdownPortal>
                            </div>
                        </div>
                    </div>
                    {/* Assigned */}
                    <div
                        style={{ background: '#fff', borderRadius: 8, padding: 16, marginBottom: 16 }}
                    >
                        <div style={{ fontWeight: 500, marginBottom: 8 }}>ASSIGNED</div>
                        <div ref={assignRef} style={{ position: 'relative' }}>
                            <Button
                                icon={<PlusOutlined />}
                                size="small"
                                style={{ marginRight: 8 }}
                                onClick={() => setShowAssignDropdown(v => !v)}
                            >
                                Change assigned
                            </Button>
                            {(issue.assignee === null || issue.assignee?.userId != userId) && (
                                <Button
                                    icon={<UserOutlined />}
                                    size="small"
                                    onClick={() => handleUpdate('assignee', filters.assigns.find(v => v.userId == userId))}
                                >
                                    Assign to me
                                </Button>
                            )}
                            <DropdownPortal anchorRef={assignRef} show={showAssignDropdown}>
                                <div className="bg-white border border-gray-200 rounded shadow z-30 w-48 max-h-60 overflow-y-auto min-w-[120px]">
                                    <div
                                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                            setShowAssignDropdown(false);
                                            handleUpdate('assignee', { id: -1 });
                                        }}
                                    >
                                        Không phân công
                                    </div>
                                    {filters.assigns?.map(user => (
                                        <div
                                            key={user.id}
                                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => {
                                                setShowAssignDropdown(false);
                                                handleUpdate('assignee', user);
                                            }}
                                        >
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.fullName} className="w-7 h-7 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600">
                                                    {user.fullName?.charAt(0)?.toUpperCase()}
                                                </div>
                                            )}
                                            <span>{user.fullName}</span>
                                        </div>
                                    ))}
                                </div>
                            </DropdownPortal>
                        </div>
                        <div style={{ marginTop: 12 }}>
                            {issue.assignee ? (
                                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex items-center">
                                        <Avatar src={issue.assignee.avatar}>
                                            {!issue.assignee.avatar && issue.assignee.fullName?.charAt(0)?.toUpperCase()}
                                        </Avatar>
                                        <span className="ml-2">{issue.assignee.fullName}</span>
                                    </div>
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleUpdate('assignee', { id: -1 })}
                                        size="small"
                                    />
                                </div>
                            ) : <span style={{ color: '#aaa' }}>Chưa có</span>}
                        </div>
                    </div>
                    {/* Watchers */}
                    {/* <div style={{ background: '#fff', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                        <div style={{ fontWeight: 500, marginBottom: 8 }}>WATCHERS</div>
                        <div ref={watcherRef} style={{ position: 'relative' }}>
                            <Button
                                icon={<PlusOutlined />}
                                size="small"
                                style={{ marginRight: 8 }}
                                onClick={() => setShowWatcherDropdown(!showWatcherDropdown)}
                            >
                                Add watchers
                            </Button>
                            <Button
                                icon={isCurrentUserWatching() ? <EyeOutlined /> : <EyeOff />}
                                size="small"
                                onClick={handleToggleWatch}
                            >
                                {isCurrentUserWatching() ? "Unwatch" : "Watch"}
                            </Button>

                            {showWatcherDropdown && (
                                <DropdownPortal anchorRef={watcherRef} show={showWatcherDropdown}>
                                    <div className="bg-white border border-gray-200 rounded shadow z-30 w-48 max-h-60 overflow-y-auto min-w-[120px]">
                                        {availableUsers
                                            .filter(user => !watchers.some(watcher => watcher.id === user.id))
                                            .map(user => (
                                                <div
                                                    key={user.id}
                                                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() => handleAddWatcher(user.id)}
                                                >
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt={user.fullName} className="w-7 h-7 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600">
                                                            {user.fullName?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                    )}
                                                    <span>{user.fullName}</span>
                                                </div>
                                            ))}
                                    </div>
                                </DropdownPortal>
                            )}
                        </div>

                        <div style={{ marginTop: 12 }}>
                            {watchers && watchers.length > 0 ? (
                                <div className="space-y-2">
                                    {watchers.map(watcher => (
                                        <div key={watcher.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <div className="flex items-center">
                                                <Avatar src={watcher.avatar}>
                                                    {!watcher.avatar && watcher.fullName?.charAt(0)?.toUpperCase()}
                                                </Avatar>
                                                <span className="ml-2">{watcher.fullName}</span>
                                            </div>
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleRemoveWatcher(watcher.id)}
                                                size="small"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-400">No watchers</div>
                            )}
                        </div>
                    </div> */}
                    {/* Các nút chức năng */}
                    <div
                        style={{ background: '#fff', borderRadius: 8, padding: 16, display: 'flex', gap: 12, justifyContent: 'center' }}
                    >
                        <Button
                            ref={dueDateRef}
                            icon={<ClockCircleOutlined />} shape="circle"
                            className={`${issue.dueDate && 'bg-red-300'}`}
                            onClick={() => setShowDueDatePicker(v => !v)}
                        />
                        <Button
                            icon={<DeleteOutlined />}
                            shape="circle"
                            danger
                            onClick={() => setShowDeleteConfirmModal(true)}
                        />

                        <DropdownPortal anchorRef={dueDateRef} show={showDueDatePicker}>
                            <div className="absolute right-0 bg-white border border-gray-200 rounded shadow-lg p-4 z-10">
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                                    value={issue.dueDate}
                                    onChange={(e) => {
                                        handleUpdate('dueDate', e.target.value);
                                        setShowDueDatePicker(false);
                                    }}
                                />
                                <button
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowDueDatePicker(false)}
                                >
                                    Hủy
                                </button>
                            </div>
                        </DropdownPortal>
                    </div>
                </div>
            </div>

            {showDeleteConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-80">
                    <div className="bg-gray-300 rounded-xl p-10 flex flex-col items-center justify-center">
                        <p className="text-3xl font-semibold mb-10">
                            Xác nhận xóa ?
                        </p>
                        <div className="flex gap-5">
                            <Button
                                onClick={() => handleDeleteIssue()}
                                className="bg-red-300"
                            >
                                Xóa
                            </Button>

                            <Button
                                onClick={() => setShowDeleteConfirmModal(false)}
                                className="bg-blue-300"
                            >
                                Hủy
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}