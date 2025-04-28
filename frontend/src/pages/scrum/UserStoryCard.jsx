import React from 'react';
import { MoreVertical, Check } from 'lucide-react';

const UserStoryCard = ({ userStory, index }) => {
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

  return (
    <div className="w-full bg-gray-200 rounded flex items-center px-3 py-4 text-sm">
      {/* Left section with drag handle and checkbox */}
      <div className="flex items-center mr-2">
        <button className="text-gray-500 cursor-move mr-2">
          <div className="grid grid-cols-2 gap-0.5">
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
          </div>
        </button>
        <div className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center">
          {/* Render checkmark if status is closed */}
          {userStory.status?.closed && <Check size={12} />}
        </div>
      </div>
      
      {/* ID and Name */}
      <div className="flex-1">
        <div className="flex items-center">
          <span className="text-blue-500 font-medium mr-1">#{userStory.id}</span>
          <span className="text-gray-700">{userStory.name}</span>
        </div>
      </div>
      
      {/* Right section with status, points and menu */}
      <div className="flex items-center space-x-3">
        {/* Status */}
        <div 
          className="px-2 py-0.5 rounded text-xs font-medium text-white"
          style={{ backgroundColor: statusColor }}
        >
          {userStory.status?.name || "Ready"}
        </div>
        
        {/* Points */}
        {totalPoints > 0 && (
          <div className="font-medium">{totalPoints}</div>
        )}
        
        {/* Menu Button */}
        <button className="text-gray-500 hover:text-gray-700">
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
};

export default UserStoryCard;