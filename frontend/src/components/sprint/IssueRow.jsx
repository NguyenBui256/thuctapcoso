import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from "react-toastify";
import DropdownPortal from '../../pages/issue/DropdownPortal';
import { updateIssue } from '../../api/issue';
import { Button } from 'antd';

export default function IssueRow({ issue, filters, onUpdate, onRemoveFromSprint, onDelete }) {
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showAssignDropdown, setShowAssignDropdown] = useState(false);
    const [showActionDropdown, setShowActionDropdown] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [showRemoveConfirmModal, setShowRemoveConfirmModal] = useState(false);
    const statusRef = useRef();
    const assignRef = useRef();
    const actionRef = useRef();

    // Xử lý click outside để đóng các dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (showStatusDropdown && statusRef.current && !statusRef.current.contains(event.target)) {
                setShowStatusDropdown(null);
            }
            if (showAssignDropdown && assignRef.current && !assignRef.current.contains(event.target)) {
                setShowAssignDropdown(null);
            }
            if (showActionDropdown && actionRef.current && !actionRef.current.contains(event.target)) {
                setShowActionDropdown(null);
            }
        }

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showStatusDropdown, showAssignDropdown, showActionDropdown]);

    const handleUpdateIssue = async (issueId, updateData) => {
        try {
            const updatedIssue = await updateIssue(issueId, updateData);
            if (updatedIssue.error) {
                toast.error(updatedIssue.error);
            } else {
                toast.success('Cập nhật thành công');
                onUpdate(updatedIssue.data);
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi cập nhật');
        }
    };

    const handleRemoveFromSprint = () => {
        setShowRemoveConfirmModal(true);
        setShowActionDropdown(false);
    };

    const handleDelete = () => {
        setShowDeleteConfirmModal(true);
        setShowActionDropdown(false);
    };

    return (
        <>
            <tr className="hover:bg-gray-50">
                {/* Issue: position, tên, tag */}
                <td className="w-1/2 px-4 py-2">
                    <Link to={`../issue/${issue.id}`}>
                        <span className="text-sky-700 font-semibold mr-2">#{issue.position}</span>
                        <span className="text-gray-900 font-medium mr-2">{issue.subject}</span>
                    </Link>
                    {Array.isArray(issue.tags) && issue.tags.length > 0 && (
                        <span className="inline-flex flex-wrap gap-1 align-middle">
                            {issue.tags.map(tag => (
                                <span
                                    key={tag.id}
                                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                                    style={{ background: tag.color || '#eee', color: '#222' }}
                                    title={tag.name}
                                >
                                    {tag.name}
                                </span>
                            ))}
                        </span>
                    )}
                </td>
                {/* Status */}
                <td className="w-1/6 px-4 py-2 relative">
                    <div 
                        ref={statusRef}
                        className="font-medium cursor-pointer hover:bg-gray-100 px-2 py-1 rounded flex items-center gap-1"
                        style={{ color: issue.status?.color || '#3b82f6' }}
                        onClick={() => setShowStatusDropdown(showStatusDropdown === issue.id ? null : issue.id)}
                    >
                        {issue.status?.name || '-'}
                        <span className="text-xs text-gray-400">▼</span>
                    </div>
                    <DropdownPortal anchorRef={statusRef} show={showStatusDropdown === issue.id}>
                        <div className="bg-white border border-gray-200 rounded shadow z-30 w-40 max-h-60 overflow-y-auto min-w-[120px]">
                            {filters.statuses?.map(status => (
                                <div
                                    key={status.id}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                    style={{ color: status.color || '#3b82f6' }}
                                    onClick={() => {
                                        handleUpdateIssue(issue.id, { status: status });
                                        setShowStatusDropdown(null);
                                    }}
                                >
                                    {status.name}
                                </div>
                            ))}
                        </div>
                    </DropdownPortal>
                </td>
                {/* Modified */}
                <td className="w-1/6 px-4 py-2">
                    {issue.updatedDate ? (
                        new Date(issue.updatedDate).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })
                    ) : (
                        issue.dueDate ? (
                            new Date(issue.dueDate).toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            })
                        ) : '-'
                    )}
                </td>
                {/* Assign */}
                <td className="w-1/6 px-4 py-2 relative">
                    <div 
                        ref={assignRef}
                        className="cursor-pointer"
                        onClick={() => setShowAssignDropdown(showAssignDropdown === issue.id ? null : issue.id)}
                    >
                        {issue.assignee ? (
                            issue.assignee.avatar ? (
                                <img
                                    src={issue.assignee.avatar}
                                    alt={issue.assignee.fullName}
                                    className="w-7 h-7 rounded-full object-cover inline-block"
                                    title={issue.assignee.fullName}
                                />
                            ) : (
                                <div
                                    className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 inline-block"
                                    title={issue.assignee.fullName}
                                >
                                    {issue.assignee.fullName?.charAt(0)?.toUpperCase()}
                                </div>
                            )
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 inline-block" title="Chưa phân công">
                                <span>★</span>
                            </div>
                        )}
                    </div>
                    <DropdownPortal anchorRef={assignRef} show={showAssignDropdown === issue.id} alignRight>
                        <div className="bg-white border border-gray-200 rounded shadow z-30 w-48 max-h-60 overflow-y-auto min-w-[120px]">
                            <div
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                    handleUpdateIssue(issue.id, { assignee: { id: -1 } });
                                    setShowAssignDropdown(null);
                                }}
                            >
                                Chưa phân công
                            </div>
                            {filters.assigns?.map(assign => (
                                <div
                                    key={assign.id}
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                        handleUpdateIssue(issue.id, { assignee: { id: assign.id } });
                                        setShowAssignDropdown(null);
                                    }}
                                >
                                    {assign.avatar ? (
                                        <img
                                            src={assign.avatar}
                                            alt={assign.fullName}
                                            className="w-7 h-7 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600">
                                            {assign.fullName?.charAt(0)?.toUpperCase()}
                                        </div>
                                    )}
                                    <span>{assign.fullName}</span>
                                </div>
                            ))}
                        </div>
                    </DropdownPortal>
                </td>
                {/* Actions */}
                <td className="px-4 py-2 relative">
                    <div 
                        ref={actionRef}
                        className="cursor-pointer text-gray-500 hover:text-gray-700"
                        onClick={() => setShowActionDropdown(showActionDropdown === issue.id ? null : issue.id)}
                    >
                        <span className="text-xl">⋮</span>
                    </div>
                    <DropdownPortal anchorRef={actionRef} show={showActionDropdown === issue.id} alignRight>
                        <div className="bg-white border border-gray-200 rounded shadow z-30 w-40">
                            <div
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-red-500"
                                onClick={handleDelete}
                            >
                                Xóa
                            </div>
                            <div
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                                onClick={handleRemoveFromSprint}
                            >
                                Tách khỏi sprint
                            </div>
                        </div>
                    </DropdownPortal>
                </td>
            </tr>

            {showDeleteConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-80">
                    <div className="bg-gray-300 rounded-xl p-10 flex flex-col items-center justify-center">
                        <p className="text-3xl font-semibold mb-10">
                            Xác nhận xóa ?
                        </p>
                        <div className="flex gap-5">
                            <Button
                                onClick={() => {
                                    onDelete(issue.id);
                                    setShowDeleteConfirmModal(false);
                                }}
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

            {showRemoveConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-80">
                    <div className="bg-gray-300 rounded-xl p-10 flex flex-col items-center justify-center">
                        <p className="text-3xl font-semibold mb-10">
                            Xác nhận tách khỏi sprint ?
                        </p>
                        <div className="flex gap-5">
                            <Button
                                onClick={() => {
                                    onRemoveFromSprint(issue.id);
                                    setShowRemoveConfirmModal(false);
                                }}
                                className="bg-red-300"
                            >
                                Tách
                            </Button>

                            <Button
                                onClick={() => setShowRemoveConfirmModal(false)}
                                className="bg-blue-300"
                            >
                                Hủy
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
} 