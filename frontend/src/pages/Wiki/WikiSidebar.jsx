import React, { useState } from 'react';
import { FiTrash2, FiPlus, FiList } from 'react-icons/fi';

const WikiSidebar = ({ pages, selectedPageId, onSelectPage, onDeletePage, onCreatePage, onViewAllPages, viewMode, className }) => {
  const [hoverPageId, setHoverPageId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');

  // Ensure pages is always an array
  const safePages = Array.isArray(pages) ? pages : [];

  const handleDeleteClick = (e, pageId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this page?')) {
      onDeletePage(pageId);
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (newPageTitle.trim()) {
      onCreatePage({
        title: newPageTitle.trim(),
        content: ''
      });
      setNewPageTitle('');
      setIsCreating(false);
    }
  };

  return (
    <div className={`w-64 border-r border-gray-200 flex-shrink-0 bg-white ${className || ''}`}>
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">BOOKMARKS</h2>
        
        <div className="mb-6">
          {/* Main wiki pages section */}
          <div className="space-y-1">
            {safePages.length > 0 ? (
              safePages.map(page => (
                <div
                  key={page.id}
                  className={`flex items-center justify-between py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 ${
                    page.id === selectedPageId && viewMode === 'single' ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                  onClick={() => onSelectPage(page.id)}
                  onMouseEnter={() => setHoverPageId(page.id)}
                  onMouseLeave={() => setHoverPageId(null)}
                >
                  <span className="text-gray-700 truncate">{page.title}</span>
                  {hoverPageId === page.id && (
                    <button
                      onClick={(e) => handleDeleteClick(e, page.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm text-center py-2">
                No pages yet. Create one below.
              </div>
            )}
          </div>
        </div>

        {/* Create new page section */}
        {isCreating ? (
          <form onSubmit={handleCreateSubmit} className="mt-4">
            <input
              type="text"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              placeholder="Page title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex justify-end mt-2 space-x-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center justify-center px-3 py-2 mt-4 text-sm text-blue-600 border border-dashed border-blue-300 rounded-md hover:bg-blue-50"
          >
            <FiPlus className="mr-1" /> Add page
          </button>
        )}
      </div>

      {/* ALL WIKI PAGES section - link to view all pages */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onViewAllPages}
          className={`flex items-center w-full px-3 py-2 rounded-md text-sm ${
            viewMode === 'all' 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FiList className="mr-2" />
          <span className="font-medium">ALL WIKI PAGES</span>
        </button>
      </div>
    </div>
  );
};

export default WikiSidebar; 