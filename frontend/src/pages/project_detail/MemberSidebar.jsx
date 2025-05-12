import React, { useState, useEffect } from 'react';
import { FiSearch, FiArrowUp, FiArrowDown, FiX, FiEdit2, FiCheck } from 'react-icons/fi';

const MemberSidebar = ({ teams, selectedTeam, onTeamSelect, onSearch, className, onSort, showRoleManagement = true, onManageRoles }) => {
  const [searchValue, setSearchValue] = useState('');
  const [sortOption, setSortOption] = useState('none');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'

  useEffect(() => {
    // Debounce search to reduce unnecessary re-renders
    const delaySearch = setTimeout(() => {
      onSearch(searchValue);
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchValue, onSearch]);

  useEffect(() => {
    // Notify parent about sort changes
    if (onSort) {
      onSort(sortOption, sortDirection);
    }
  }, [sortOption, sortDirection, onSort]);

  // Ensure teams is always an array
  const safeTeams = Array.isArray(teams) ? teams : [];

  const handleSortChange = (option) => {
    if (sortOption === option) {
      // Toggle direction if same option is selected
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new option
      setSortOption(option);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (option) => {
    if (sortOption !== option) return null;

    return sortDirection === 'asc'
      ? <FiArrowUp className="ml-1 h-4 w-4" />
      : <FiArrowDown className="ml-1 h-4 w-4" />;
  };

  const clearSorting = () => {
    setSortOption('none');
    setSortDirection('desc');
  };

  return (
    <div className={`w-72 border-r border-gray-200 flex-shrink-0 bg-white ${className || ''}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Team</h2>
          {showRoleManagement && (
            <div
              className="flex items-center text-sm text-blue-600 cursor-pointer hover:text-blue-800"
              onClick={onManageRoles}
            >
              <FiEdit2 className="mr-1 h-4 w-4" />
              <span>Manage Roles</span>
            </div>
          )}
        </div>

        {/* Search input */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by full name..."
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Team filters */}
        <div className="space-y-1 mb-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Roles</h3>

          {safeTeams.map((team, index) => (
            <div
              key={index}
              className={`flex items-center py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 ${team === selectedTeam ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              onClick={() => onTeamSelect(team)}
            >
              <span className="truncate">{team}</span>
            </div>
          ))}

          {safeTeams.length === 0 && (
            <div className="text-gray-500 text-sm text-center py-2">
              No roles available
            </div>
          )}
        </div>

        {/* Sorting options */}
        <div className="space-y-1">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Sort by</h3>
            {sortOption !== 'none' && (
              <button
                onClick={clearSorting}
                className="flex items-center text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition-colors"
              >
                <FiX className="h-3 w-3 mr-1" /> Clear
              </button>
            )}
          </div>

          <div
            className={`flex items-center justify-between py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 ${sortOption === 'power' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            onClick={() => handleSortChange('power')}
          >
            <span className="truncate">Total Power</span>
            {getSortIcon('power')}
          </div>

          <div
            className={`flex items-center justify-between py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 ${sortOption === 'badges' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            onClick={() => handleSortChange('badges')}
          >
            <span className="truncate">Number of Badges</span>
            {getSortIcon('badges')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberSidebar; 