import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { updateIssue } from '../../api/issue';
import { toast } from 'react-toastify';
import DropdownPortal from './DropdownPortal';

export default function IssueRow({ issue, statuses = [], assigns = [], onUpdate, showTags }) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const statusRef = useRef();
  const assignRef = useRef();

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (showStatusDropdown && statusRef.current && !statusRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
      if (showAssignDropdown && assignRef.current && !assignRef.current.contains(event.target)) {
        setShowAssignDropdown(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showStatusDropdown, showAssignDropdown]);

  const handleStatusChange = async (newStatus) => {
    console.log("Sdfdf")
    try {
      const updatedIssue = await updateIssue(issue.id, { status: newStatus });
      onUpdate(updatedIssue.data);
    } catch (error) {
      toast.error("Error updating issue")
    }
  };

  const handleAssigneeChange = async (newAssigneeId) => {
    try {
      const updatedIssue = await updateIssue(issue.id, { assignee: {id: newAssigneeId} });
      onUpdate(updatedIssue.data);
    } catch (error) {
      toast.error("Error updating issue")
    }
  };

  return (
    <tr className="bg-gray-50 hover:bg-gray-100 transition">
      {/* TYPE */}
      <td className="px-4 py-3">
        <span
          className="w-5 h-5 rounded-full inline-block"
          style={{ background: issue.type?.color }}
          title={issue.type?.name}
        ></span>
      </td>
      {/* SEVERITY */}
      <td className="px-4 py-3">
        <span
          className="w-5 h-5 rounded-full inline-block"
          style={{ background: issue.severity?.color }}
          title={issue.severity?.name}
        ></span>
      </td>
      {/* PRIORITY */}
      <td className="px-4 py-3">
        <span
          className="w-5 h-5 rounded-full inline-block"
          style={{ background: issue.priority?.color }}
          title={issue.priority?.name}
        ></span>
      </td>
      {/* ISSUE */}
      <td className="px-4 py-3">
        <span className="text-sky-700 font-semibold">#{issue.position}</span>{' '}
        <Link to={`../issue/${issue.id}`} className="hover:text-blue-400 transition duration-300 text-gray-900 font-medium">
          {issue.subject}
        </Link>
        {issue.dueDate && (
          <span
            className="ml-2 align-middle inline-block"
            title={new Date(issue.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          >
            <span className="text-yellow-500 text-base cursor-pointer">⏰</span>
          </span>
        )}
        {showTags && Array.isArray(issue.tags) && issue.tags.length > 0 && (
          <span className="ml-2 flex flex-wrap gap-1 inline-flex align-middle">
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
      {/* STATUS */}
      <td className="px-4 py-3 relative" ref={statusRef} style={{zIndex: 30}}>
        <span
          className="font-semibold cursor-pointer select-none flex items-center gap-1"
          style={{ color: issue.status?.color || '#3b82f6' }}
          onClick={() => setShowStatusDropdown(v => !v)}
        >
          {issue.status?.name}
          <span className="text-xs text-gray-400">▼</span>
        </span>
        <DropdownPortal anchorRef={statusRef} show={showStatusDropdown}>
          <div className="bg-white border border-gray-200 rounded shadow z-30 w-40 max-h-60 overflow-y-auto min-w-[120px]">
            {statuses.map(st => (
              <div
                key={st.id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                style={{ color: st.color || '#3b82f6' }}
                onClick={() => {
                  setShowStatusDropdown(false);
                  handleStatusChange(st);
                }}
              >
                {st.name}
              </div>
            ))}
          </div>
        </DropdownPortal>
      </td>
      {/* MODIFIED */}
      <td className="px-4 py-3">
        {/* Nếu có updatedAt thì dùng, không thì dùng dueDate */}
        {issue.updatedDate && new Date(issue.updatedDate).toLocaleDateString('vi-VN', { 
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
      </td>
      {/* ASSIGN TO */}
      <td className="px-4 py-3 relative" ref={assignRef} style={{zIndex: 30}}>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer relative"
          onClick={() => setShowAssignDropdown(v => !v)}
        >
          {issue.assignee ? (
            issue.assignee.avatar ? (
              <img
                src={issue.assignee.avatar}
                alt={issue.assignee.fullName}
                className="w-8 h-8 rounded-full object-cover"
                title={issue.assignee.fullName}
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"
                title={issue.assignee.fullName}
              >
                {issue.assignee.fullName?.charAt(0)?.toUpperCase()}
              </div>
            )
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400" title="Chưa phân công">
              <span>★</span>
            </div>
          )}
        </div>
        <DropdownPortal anchorRef={assignRef} show={showAssignDropdown} alignRight>
          <div className="bg-white border border-gray-200 rounded shadow z-30 w-48 max-h-60 overflow-y-auto min-w-[120px]">
            {assigns.map(user => (
              <div
                key={user.id}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setShowAssignDropdown(false);
                  handleAssigneeChange(user.id);
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
      </td>
    </tr>
  );
} 