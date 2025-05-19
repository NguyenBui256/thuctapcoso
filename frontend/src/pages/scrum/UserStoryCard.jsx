import React from 'react';
import { MoreVertical, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Draggable } from 'react-beautiful-dnd';

const UserStoryCard = ({ userStory, index }) => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  // Kiểm tra nếu có dữ liệu hợp lệ
  if (!userStory || !userStory.id) {
    return null;
  }

  // Lấy màu từ status hoặc mặc định nếu không có
  const statusColor = userStory.status?.color || "#70728F";

  // Tính tổng số điểm (points)
  const totalPoints = [
    userStory.uxPoints,
    userStory.backPoints,
    userStory.frontPoints,
    userStory.designPoints
  ].filter(Boolean).reduce((sum, point) => sum + point, 0);

  // Handle click to navigate to detail view
  const handleCardClick = () => {
    navigate(`/projects/${projectId}/backlog/userstory/${userStory.id}`);
  };

  return (
    <Draggable draggableId={`user-story-${userStory.id}`} index={index || 0}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-gray-200 rounded flex items-center text-sm cursor-pointer hover:bg-gray-300 transition-colors ${snapshot.isDragging ? 'py-2 px-2' : 'w-full px-3 py-4'}`}
          onClick={handleCardClick}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.8 : 1,
            boxShadow: snapshot.isDragging ? '0 4px 8px rgba(0, 0, 0, 0.1)' : 'none',
            width: snapshot.isDragging ? '200px' : undefined,
            maxWidth: snapshot.isDragging ? '200px' : undefined,
            height: snapshot.isDragging ? 'auto' : undefined,
          }}
        >
          {/* Left section with drag handle and checkbox */}
          <div className="flex items-center mr-2 shrink-0">
            <div
              {...provided.dragHandleProps}
              className="text-gray-500 cursor-move mr-2"
              onClick={(e) => e.stopPropagation()} // Prevent card click when clicking drag handle
            >
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
              </div>
            </div>
            {!snapshot.isDragging && (
              <div className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center">
                {/* Render checkmark if status is closed */}
                {userStory.status?.closed && <Check size={12} />}
              </div>
            )}
          </div>

          {/* ID and Name */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center overflow-hidden">
              <span className="text-blue-500 font-medium mr-1 whitespace-nowrap shrink-0">#{userStory.id}</span>
              <span className="text-gray-700 truncate">{userStory.name}</span>
            </div>
          </div>

          {/* Right section with status, points and menu */}
          <div className={`flex items-center ${snapshot.isDragging ? 'ml-1' : 'ml-2 space-x-3'} shrink-0`}>
            {/* Status - Only show when not dragging */}
            {!snapshot.isDragging && (
              <div
                className="px-2 py-0.5 rounded text-xs font-medium text-white whitespace-nowrap"
                style={{ backgroundColor: statusColor }}
              >
                {userStory.status?.name || "Ready"}
              </div>
            )}

            {/* Points */}
            {totalPoints > 0 && (
              <div className="font-medium">{totalPoints}</div>
            )}

            {/* Menu Button - hide when dragging */}
            {!snapshot.isDragging && (
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={(e) => e.stopPropagation()} // Prevent card click when clicking menu
              >
                <MoreVertical size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default UserStoryCard;